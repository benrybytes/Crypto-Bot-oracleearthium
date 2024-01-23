const baseUrl =
  process.env.DEV == "d"
    ? "https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev"
    : "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";

const discord_express_url = baseUrl + "/discord-server";
const crypto_express_url = baseUrl + "/crypto";
export { baseUrl, discord_express_url, crypto_express_url };
