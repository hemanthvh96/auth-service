import { config } from 'dotenv';
import path from 'path';

// LOADING ENVIRONMENT VARIABLES BASED ON NODE_ENV
// WE SET NODE_ENV IN PACKAGE.JSON WITH THE HELP OF CROSS-ENV PACKAGE
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const { NODE_ENV, PORT, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } =
    process.env;

export const Config = {
    NODE_ENV,
    PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DB_DATABASE,
};
