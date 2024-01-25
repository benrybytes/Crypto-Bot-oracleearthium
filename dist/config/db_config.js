"use strict";
require("dotenv").config();
module.exports = {
    development: {
        username: "root",
        password: "bread",
        database: "crypto-bot-dev",
        host: "127.0.0.1",
        dialect: "mysql",
        dialectOptions: {
            charset: "utf8mb4",
        },
        port: 3306,
        connectionTimeout: 60000,
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
        dialectOptions: {
            charset: "utf8mb4",
        },
        port: 3306,
        connectionTimeout: 60000,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        dialectOptions: {
            charset: "utf8mb4",
        },
        connectionTimeout: 60000,
    },
};
