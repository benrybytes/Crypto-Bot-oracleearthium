"use strict";
/* import IUrl from "../../interfaces/url.interface"; */
Object.defineProperty(exports, "__esModule", { value: true });
exports.treat = void 0;
class BaseUrl {
    static getDiscordLoginLink() {
        if (window.location.href.includes("onrender")) {
            this.discordLoginUrl = "";
        }
        else if (window.location.href.includes("replit.dev")) {
            this.discordLoginUrl =
                "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=https%3A%2F%2F5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev%2Fauth%2Fdiscord&scope=identify";
        }
        else if (window.location.href.includes("replit.app")) {
            this.discordLoginUrl =
                "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=https%3A%2F%2Fcrypto-bot-oracleearthium-henrymartinez8.replit.app%2Fauth%2Fdiscord&scope=identify";
        }
        return this.discordLoginUrl;
    }
    static getBaseUrl() {
        if (window.location.href.includes("onrender")) {
            this.baseUrl = "https://helloworld-p9vq.onrender.com";
        }
        else if (window.location.href.includes("replit.dev")) {
            this.baseUrl =
                "https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev";
        }
        else if (window.location.href.includes("replit.app")) {
            this.baseUrl =
                "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";
        }
        return {
            cryptoUrl: this.baseUrl + "/crypto",
            baseUrl: this.baseUrl,
            discordUrl: this.baseUrl + "/discord-server",
        };
    }
}
BaseUrl.baseUrl = "http://localhost:53134";
BaseUrl.discordLoginUrl = "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A53134%2Fauth%2Fdiscord&scope=identify";
const myVariable = "Hello from baseurl";
// baseurl.js
exports.treat = {
    hello: "Hello from baseurl",
    ok: BaseUrl,
};
