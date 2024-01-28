/* import IUrl from "../../interfaces/url.interface"; */
// class BaseUrl {
//   private static baseUrl: string = "http://localhost:53134";
//   private static discordLoginUrl: string =
//     "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A53134%2Fauth%2Fdiscord&scope=identify";

//   public static getDiscordLoginLink(): string {
//     if (window.location.href.includes("onrender")) {
//       this.discordLoginUrl = "";
//     } else if (window.location.href.includes("replit.dev")) {
//       console.log("DISCORD URL REPLIT DEV")
//       this.discordLoginUrl =
//         "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=https%3A%2F%2F5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev%2Fauth%2Fdiscord&scope=identify";
//     } else if (window.location.href.includes("replit.app")) {
      
//       this.discordLoginUrl =
//         "https://discord.com/api/oauth2/authorize?client_id=1195900327254294600&response_type=token&redirect_uri=https%3A%2F%2Fcrypto-bot-oracleearthium-henrymartinez8.replit.app%2Fauth%2Fdiscord&scope=identify";
//     }

//     return this.discordLoginUrl;
//   }

//   public static getBaseUrl(): any {
//     if (window.location.href.includes("onrender")) {
//       this.baseUrl = "https://helloworld-p9vq.onrender.com";
//     } else if (window.location.href.includes("replit.dev")) {
//       this.baseUrl =
//         "https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev";
//     } else if (window.location.href.includes("replit.app")) {
//       this.baseUrl =
//         "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";
//     }

//     return {
//       cryptoUrl: this.baseUrl + "/crypto",
//       baseUrl: this.baseUrl,
//       discordUrl: this.baseUrl + "/discord-server",
//     };
//   }
// }

// const myVariable = "Hello from baseurl";

// // baseurl.js
// export const treat = {
//   hello: "Hello from baseurl",
//   ok: BaseUrl,
// };
