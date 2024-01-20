import { CommandInteraction, EmbedBuilder } from "discord.js";
import { CryptoCurrency } from "../interfaces/cryptoresponse.interface.";
import makeFetchRequest from "../helpers/fetchHandler";

interface ICryptoResponse {
  serverId: string;
  coinData: CryptoCurrency[];
}

const url = "https://crypto-discord-bot.onrender.com/crypto";
/*
    Be able to display an embed 
    Precondition: Need a server id to send a request for data by the server 
    PostCondition: Server sends up the data and we display it through an embed or an error embed 

    @param interaction - The slash command interaction by the user containing information about the server 
*/
const sendTrackedCryptoData = async (interaction: CommandInteraction) => {
  try {
    const serverId = interaction.guildId; // Assuming serverId is the guild ID
    console.log("serverId: ", serverId);

    const [response, error] = await makeFetchRequest<ICryptoResponse[]>(
      url + "/get-crypto?serverId=" + serverId,
    );
    const trackedCryptoData: CryptoCurrency[] = await response!.then(
      (res: ICryptoResponse[]) => res[0].coinData,
    );
    if (error != null) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ed053f")
        .setTitle("Error")
        .setDescription(`An error occurred: ${error.message}`);

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!trackedCryptoData || trackedCryptoData.length === 0) {
      return interaction.reply("No tracked crypto data available.");
    }

    const cryptoListEmbed = new EmbedBuilder()
      .setTitle("Crypto Currencies Tracked: ")

      .setDescription("This is a custom embed with properties")
      .setColor("#3498db")
      .addFields(
        trackedCryptoData.map((crypto: CryptoCurrency, index: number) => ({
          name: `${index + 1}. ${crypto.name} - (${crypto.symbol})`,
          value: `Price: $${parseInt(crypto.priceUsd).toFixed(3)}`, // Use toFixed to limit decimal places
        })),
      );

    return interaction.reply({
      embeds: [cryptoListEmbed],
      ephemeral: true,
    });
  } catch (e) {
    console.log(e);
  }
};

export default sendTrackedCryptoData;
