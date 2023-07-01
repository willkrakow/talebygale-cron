import dotenv from 'dotenv';
import path from 'path';
import { removeExpiredPostLinks } from './ghost';
import { sendText } from './notify';

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

async function main() {
    const removedLinks = await removeExpiredPostLinks();
    if (removedLinks && removedLinks.length > 0) {
        console.log("Removed links: ", removedLinks);
        // Remove query params from links
        const shortLinks = removedLinks.map(link => link.split("?")[0]);
        await sendText(`Removed links ${shortLinks.length}: ${shortLinks.join(", ")}`, process.env.LAURA_PHONE_NUMBER!);
        await sendText(`Removed links ${shortLinks.length}: ${shortLinks.join(", ")}`, process.env.MY_PHONE_NUMBER!);
    } else {
        await sendText("No links removed.", process.env.MY_PHONE_NUMBER!);
    }
}

main().then(() => console.log("Finished checking for expired links."))