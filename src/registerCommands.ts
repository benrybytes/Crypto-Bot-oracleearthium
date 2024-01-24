import { REST, Routes } from "discord.js";
import { ICommand } from "./commands/commandList";
import path from "path";

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "/config/discord_config"))[env];

const rest = new REST({ version: "10" }).setToken(
  config.discord_token as string,
);
const clientId: string = config.discord_client_id;

type DeployCommandsProps = {
  guildId: string;
  commands: ICommand[];
};

const waitForCommand = async (commands: ICommand[], guildId: string) => {
  const commandList: any[] = [];
  commands.forEach((command: ICommand) => {
    commandList.push(command.data.toJSON());
  });
  if (guildId.length == 0) {
    await rest.put(Routes.applicationCommands(clientId), {
      body: commandList,
    });
  }
};

export async function registerCommands({
  guildId,
  commands,
}: DeployCommandsProps) {
  try {
    console.log("Started refreshing application (/) commands.");

    await waitForCommand(commands, guildId);

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
