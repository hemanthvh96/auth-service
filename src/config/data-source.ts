import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from '.';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_DATABASE,
    // SET synchronize: false in PRODUCTION
    synchronize: Config.NODE_ENV === 'dev' || Config.NODE_ENV === 'test',
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
