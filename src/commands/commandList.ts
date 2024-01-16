import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import sendUserTopCurrencies from "../handlers/crypto";
import sendTrackedCryptoData from "../handlers/targetedCrypto";

export interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void> | void;
}

// List of commands registered with handlers and data containined to show on discord
let commandList: ICommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName("get_current_prices")
      .setDescription("Display a crypto currency list"),
    async execute(interaction: CommandInteraction) {
      sendUserTopCurrencies(interaction);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("get_targeted_crypto")
      .setDescription("server specific tokens"),
    async execute(interaction: CommandInteraction) {
      sendTrackedCryptoData(interaction);
    },
  },
];

export default commandList;
