import { CommandInteraction } from "discord.js";

const sendBetData = async (interaction: CommandInteraction) => {
  try {
    // The options passed from the slash command
    const betAmountOption = interaction.options.get("bet_amount", true).value;
    const symbolOption = interaction.options.get("crypto_symbol", true).value;

    // Check if the options are present
    if (betAmountOption === null || symbolOption === null) {
      throw new Error("Invalid options");
    }

    // Extract the values
    const betAmount: string | number | boolean = betAmountOption!;
    const symbol: string | number | boolean = symbolOption!;

    // Now you can use betAmount and symbol in your logic
    console.log("Bet Amount:", betAmount);
    console.log("Crypto Symbol:", symbol);

    // Add your logic here...
  } catch (error) {
    console.error("Error processing slash command:", error);
  }
};

export default sendBetData;
