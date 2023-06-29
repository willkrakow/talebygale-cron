import dotenv from 'dotenv';
import path from 'path';
import { checkForExpiredPostLinks } from './ghost';

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

async function main() {
    await checkForExpiredPostLinks();
}

main().then(() => console.log("Finished checking for expired links."))