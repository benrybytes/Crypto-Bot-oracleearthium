import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config";
import { ICommand } from "./commands/commandList";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
const clientId: string = process.env.DISCORD_CLIENT_ID!;

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
