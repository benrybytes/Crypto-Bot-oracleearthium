// Return the token and the client id of the bot
import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, LOCAL_IPV4, USER, PASSWORD, DB } =
  process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !LOCAL_IPV4) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  LOCAL_IPV4,
  USER,
  PASSWORD,
  DB,
};
