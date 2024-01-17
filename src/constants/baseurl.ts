const baseUrl =
  process.env.DEPLOY_STATUS === "production" ? "" : "http://localhost:53134";

const discord_express_url = baseUrl + "/discord-server";
const crypto_express_url = baseUrl + "/crypto";
export { discord_express_url, crypto_express_url };
