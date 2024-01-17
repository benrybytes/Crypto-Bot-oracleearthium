import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import sendUserTopCurrencies from "../handlers/crypto";
import sendTrackedCryptoData from "../handlers/targetedCrypto";
import sendBetData from "../handlers/bet";
import displayLeaderboard from "../handlers/leaderboard";

export interface ICommand {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: CommandInteraction) => Promise<void> | void;
}

// List of commands registered with handlers and data containined to show on discord
let commandList: ICommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName("get_leaderboard")
      .setDescription("Display top 10 highest points"),
    async execute(interaction: CommandInteraction) {
      displayLeaderboard(interaction);
    },
  },
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
  {
    data: new SlashCommandBuilder()
      .setName("bet_on_tracked_currency")
      .setDescription("Bet amount on tracked coins")
      .addStringOption((option) =>
        option
          .setName("crypto_symbol")
          .setDescription("The token symbol in tracked list")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("bet_amount")
          .setDescription("The price to bet on tracked list")
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName("increase_or_decrease")
          .setDescription("true or false for response")
          .setRequired(true),
      ),
    async execute(interaction: CommandInteraction) {
      sendBetData(interaction);
    },
  },
];

export default commandList;
