import { SlashCommandBuilder, CommandInteraction } from "discord.js";
export interface ICommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (interaction: CommandInteraction) => Promise<void> | void;
}
declare let commandList: ICommand[];
export default commandList;
