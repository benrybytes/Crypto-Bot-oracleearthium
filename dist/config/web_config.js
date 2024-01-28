"use strict";
module.exports = {
    development: {
        apiBaseUrl: "http://localhost:" + process.env.EXPRESS_PORT ||
            "http://localhost:4020",
    },
    production: {
        apiBaseUrl: "https://crypto-bot-oracleearthium-henrymartinez8.replit.app",
    },
};
