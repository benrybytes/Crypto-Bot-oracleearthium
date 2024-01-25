"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crypto_express_url = exports.discord_express_url = exports.baseUrl = void 0;
let baseUrl = "http://localhost:53134";
exports.baseUrl = baseUrl;
if (process.env.PROVIDER == "onrender") {
    exports.baseUrl = baseUrl = "https://helloworld-p9vq.onrender.com";
}
else if (process.env.PROVIDER == "replit.dev") {
    exports.baseUrl = baseUrl =
        "https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev";
}
else if (process.env.PROVIDER == "replit.app") {
    exports.baseUrl = baseUrl = "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";
}
const discord_express_url = baseUrl + "/discord-server";
exports.discord_express_url = discord_express_url;
const crypto_express_url = baseUrl + "/crypto";
exports.crypto_express_url = crypto_express_url;
