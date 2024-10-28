import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_MIGRATION_HOST
        ? process.env.DB_MIGRATION_HOST
        : Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_DATABASE,
    // SET synchronize: false in PRODUCTION
    // synchronize: Config.NODE_ENV === 'dev' || Config.NODE_ENV === 'test',
    synchronize: false, // Turn to true
    logging: false,
    entities: ['src/entity/*.{ts,js}'], //User, RefreshToken, Tenant
    migrations: ['src/migration/*.{ts,js}'],
    subscribers: [],
});

/* 
    We want synchronize to be true in dev and test but not in prod.
    If you add a column in entity file then TypeORM will make that column synchronized 
    with databse immediately in dev and test environments. 
    But we dont want to do this in prod.

    In prod we have to do manually.

    However in the test file we use beforeAll() hook where we drop the database and synchornize
    the database manually. Hence for safer side we are directly setting this to false.
    So by mistake it will never be true and hence db is safe.
*/
