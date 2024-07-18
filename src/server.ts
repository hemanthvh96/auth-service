import { Config } from './config';
import app from './app';
import logger from './config/logger';

const startServer = () => {
    const PORT = Config.PORT;

    try {
        app.listen(PORT, () => {
            logger.info(`Listening on port ${PORT}`);
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

startServer();

/* 
Why timeout needed to exit the process:

logger.error() writes asynchronously to the file.
So we have to kind of wait for that operation for that to complete.
Hence we delayed the process exit by 1 second.
*/
