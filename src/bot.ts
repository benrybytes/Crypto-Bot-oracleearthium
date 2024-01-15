import {
  Client,
  Collection,
  Guild,
  GuildManager,
  Interaction,
  OAuth2Guild,
  GatewayIntentBits,
  PermissionsBitField,
  GuildMemberManager,
  GuildMember,
  User,
  UserManager,
} from "discord.js";
import { registerCommands } from "./registerCommands";
import commandList from "./commands/commandList"; // Import the commands directly
import createApp from "./webpage/index";
import Users from "./handlers/users";
const token = process.env.DISCORD_TOKEN;

// bot created for server with permissions
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// Servers bot has access to
let guilds: GuildManager;
let usersForEachServer: User[][]; // Members of different servers in their respective servers made of users

const users = new Users();

const findServerUserBotIsIn = () => {};

// When bot is ready, make global commands |
client.once("ready", async () => {
  console.log("Discord bot is ready! 🤖");

  // Get the servers saved in the cache of the discord bot
  guilds = client.guilds;
  users.setServers(guilds);
  usersForEachServer = await Promise.all(
    users
      .getServers()
      .map(async (server: Guild) => await users.fetchMembers(server)),
  );

  await registerCommands({ guildId: "", commands: commandList });
});

// Only runs if server is joined by the bot
client.on("guildCreate", async (guild: Guild) => {
  try {
    console.log("Guild joined: ", guild.name);
    //servers.push(guild)
    //await registerCommands({ guildId: guild.id, commands: commandList });
  } catch (error) {
    console.error("Error in guildCreate event:", error);
  }
});

// Any interaction created | Command
client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const command = commandList.find(
    (cmd) => cmd.data.name === interaction.commandName,
  );
  if (command) {
    command.execute(interaction);
  }
});

const app = createApp(users);

console.log("Bot registration process...");
client.login(token);
