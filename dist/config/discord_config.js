"use strict";
require("dotenv").config();
const local_auth = "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=https%3A%2F%2F5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev%2Fauth%2Fdiscord&scope=identify";
module.exports = {
    development: {
        discord_auth: local_auth,
        discord_client_id: process.env["DISCORD_CLIENT_ID"],
        discord_token: process.env["DISCORD_TOKEN"],
        discord_client_secret: process.env["DISCORD_CLIENT_SECRET"],
    },
    test: {
        discord_auth: local_auth,
        discord_client_id: process.env["DISCORD_CLIENT_ID"],
        discord_token: process.env["DISCORD_TOKEN"],
        discord_client_secret: process.env["DISCORD_CLIENT_SECRET"],
    },
    production: {
        discord_auth: process.env["DISCORD_AUTH"],
        discord_client_id: process.env["DISCORD_CLIENT_ID"],
        discord_token: process.env["DISCORD_TOKEN"],
        discord_client_secret: process.env["DISCORD_CLIENT_SECRET"],
    },
};
