import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database config
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    DB_USER: process.env.DB_USER || 'pearl_user',
    DB_PASSWORD: process.env.DB_PASSWORD || 'pearl_password',
    DB_NAME: process.env.DB_NAME || 'pearl_db',
};
