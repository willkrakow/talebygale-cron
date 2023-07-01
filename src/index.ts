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
        await sendText(`Removed links ${removedLinks.length}: ${removedLinks.join(", ")}`, process.env.MY_PHONE_NUMBER!);
    }
}

main().then(() => console.log("Finished checking for expired links."))