module.exports = {
  development: {
    apiBaseUrl:
      "http://localhost:" + process.env.EXPRESS_PORT! ||
      "http://localhost:53134",
  },
  production: {
    apiBaseUrl: "https://crypto-discord-bot.onrender.com",
  },
};
