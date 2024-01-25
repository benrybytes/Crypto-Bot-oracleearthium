"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv").config();
exports.config = {
    DISCORD_CLIENT_ID: process.env["DISCORD_CLIENT_ID"],
    DISCORD_TOKEN: process.env["DISCORD_TOKEN"],
    DISCORD_CLIENT_SECRET: process.env["DISCORD_CLIENT_SECRET"],
    SECRET: process.env["SECRET"],
    COIN_CAP_KEY: process.env["COIN_CAP_KEY"],
    DB_HOST: process.env["DB_HOST"],
    DB_USER: process.env["DB_USER"],
    DB_PASSWORD: process.env["DB_PASSWORD"],
    DB_DATABASE: process.env["DB_DATABASE"],
    DEV: process.env["DEV"],
    PORT: process.env["PORT"],
};
