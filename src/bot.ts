import { Guild, Interaction } from "discord.js";
import { registerCommands } from "./registerCommands";
import commandList from "./commands/commandList"; // Import the commands directly

const { Client, GatewayIntentBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;

// bot created for server with permissions
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// When bot is ready, make global commands |
client.once("ready", async () => {
  console.log("Discord bot is ready! 🤖");
  await registerCommands({ guildId: "", commands: commandList });
});

// Only runs if server is joined by the bot
client.on("guildCreate", async (guild: Guild) => {
  try {
    console.log("Guild joined: ", guild.name);
    //await registerCommands({ guildId: guild.id, commands: commandList });
  } catch (error) {
    console.error("Error in guildCreate event:", error);
  }
});

// Any interaction created | Commands
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

console.log("Bot registration process...");
client.login(token);
