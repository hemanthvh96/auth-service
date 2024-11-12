import { Config } from './config';
import app from './app';
import logger from './config/logger';
import { AppDataSource } from './config/data-source';
import { User } from './entity/User';

const startServer = async () => {
    const PORT = Config.PORT;

    try {
        await AppDataSource.initialize();
        logger.info('Connected to the database');
        app.listen(PORT, () => {
            logger.info(`Listening on port ${PORT}`);
        });

        const adminUser = {
            firstName: 'Master Admin F',
            lastName: 'Master Admin L',
            email: 'masteradmin@gmail.com',
            password: 'masterAdmin@123',
            role: 'admin',
        };

        const userRepository = AppDataSource.getRepository(User);
        const admin = await userRepository.find({
            where: { email: 'masteradmin@gmail.com' },
        });
        if (!admin.length) {
            await userRepository.save(adminUser);
            logger.info('Master Admin Created');
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
void startServer();

/* 
Why timeout needed to exit the process:

logger.error() writes asynchronously to the file.
So we have to kind of wait for that operation for that to complete.
Hence we delayed the process exit by 1 second.
*/
