import { config } from 'dotenv';

config();

const { NODE_ENV } = process.env;

export const Config = { NODE_ENV };
