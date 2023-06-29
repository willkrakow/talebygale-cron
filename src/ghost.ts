import GhostAdminAPI, { GhostPost } from '@tryghost/admin-api';
import GhostContentAPI from '@tryghost/content-api';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import dotenv from 'dotenv';

const REMOTE_JOBS = "remote-jobs";

dotenv.config({
    path: ".env"
});
const adminAPI = new GhostAdminAPI({
    url: process.env.GHOST_API_URL as string,
    key: process.env.GHOST_API_KEY as string,
    version: "v5.0",
});

const contentAPI = new GhostContentAPI({
    url: process.env.GHOST_API_URL as string,
    key: process.env.GHOST_CONTENT_API_KEY as string,
    version: "v5.0",
});

export async function checkForExpiredPostLinks() {
    const posts = await contentAPI.posts.browse({ limit: 1000, include: "tags" });
    const adminPosts = await adminAPI.posts.browse({ limit: 1000, include: "tags" });
    const publishedPostIds = adminPosts
        // .filter(p => p.status !== "draft")
        .map(p => p.id)

    const jobBoardPublishedPosts = posts
        .filter(p => Array.isArray(p.tags) && p.tags.some(t => t.slug === REMOTE_JOBS))
        .filter(p => publishedPostIds.includes(p.id))

    for await (const post of jobBoardPublishedPosts) {
        if (!post.html) {
            console.warn("No HTML found for post", post.id, post.title)
            return null;
        }

        const postHTML = new JSDOM(post.html);
        const link = postHTML.window.document.querySelector("a");
        if (!link) {
            console.warn("No link found for post", post.id, post.title)
            continue;
        }

        const BAD_LINKS = 'Bad links: ';
        const adminPost = await adminAPI.posts.read({ id: post.id });
        try {
            const response = await axios.get(link.href, { headers: { Accept: "text/html" } });
            if (response.status === 200) {
                console.log("Link is okay", link.href);
            }
            if (response.status > 300) {

                console.count(BAD_LINKS);
                console.log("Link is bad", link.href);
                await unpublishPost(adminPost);
                continue;
            }
        } catch (e) {
            console.count(BAD_LINKS);
            console.error("Error getting link", link.href);
            await unpublishPost(adminPost);
            continue;
        }
    }
}


async function unpublishPost(post: GhostPost) {
    console.info("Unpublishing post", post.id, post.title)
    try {
        await adminAPI.posts.edit({
            id: post.id,
            status: "draft",
            updated_at: post.updated_at,
            published_by: null,
        });
        console.info("Successfullty unpublished post", post.id)
    } catch (e: unknown) {
        console.log(e)
        if (!isUpdateCollisionError(e)) {
            console.log(e);
            return;
        }
        console.warn("Update collision error");
    }
}

type UpdateCollisionError = {
    type: "UpdateCollisionError";
    context: string;
    code: string;
}

function isUpdateCollisionError(e: unknown): e is UpdateCollisionError {
    return typeof e === "object" && e !== null && "type" in e && e.type === "UpdateCollisionError";
}

