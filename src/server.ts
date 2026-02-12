import { checkConn } from '@db';
import app from './app';
import { config } from '@config';
import { initRedis } from './db/redis';

async function main() {
    try {
        await checkConn();
        await initRedis();
        app.listen(config.PORT, () => {
            console.log(`server started on :${config.PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
