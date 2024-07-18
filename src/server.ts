import { Config } from './config';
import app from './app';

const startServer = () => {
    const PORT = Config.PORT;

    try {
        app.listen(PORT, () => {
            /* eslint no-console: off */
            console.log(`Listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
