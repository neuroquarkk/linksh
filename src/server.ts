import { checkConn } from '@db';
import app from './app';
import { config } from '@config';

async function main() {
    try {
        await checkConn();
        app.listen(config.PORT, () => {
            console.log(`server started on :${config.PORT}`);
        });
    } catch (error) {
        process.exit(1);
    }
}

main();
