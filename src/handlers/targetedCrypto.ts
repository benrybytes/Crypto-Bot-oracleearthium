import { CommandInteraction, EmbedBuilder } from "discord.js";
import { CryptoCurrency } from "../interfaces/cryptoresponse.interface.";
import { baseUrl } from '../constants/baseurl'
import makeFetchRequest from "../helpers/fetchHandler";
import makeGetRequest from "../helpers/makeGetRequest";
import { createErrorEmbed } from "./error";

interface ICryptoResponseDB {
  id: number;
  serverId: string;
  coinData: CryptoCurrency[];
}


const url = baseUrl + "/crypto";
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

    const { data_response, error } = await makeGetRequest<ICryptoResponseDB>(
      url + "/get-crypto?serverId=" + serverId,
    );
    if (error != null) {
      createErrorEmbed("Error getting tracked coins");
    }
    const trackedCryptoData: CryptoCurrency[] = await data_response!.then(
      (res: ICryptoResponseDB) => res.coinData,
    );

    if (!trackedCryptoData || trackedCryptoData.length === 0) {
      return interaction.reply("No tracked crypto data available.");
    }

    const cryptoListEmbed = new EmbedBuilder()
      .setTitle("Crypto Currencies Tracked: ")

      .setDescription("Server currently tracking : " + trackedCryptoData.length + " crypto currencies\nThese are the currencies you could bet on right now!")
      .setColor("#3498db")
      .addFields(
        trackedCryptoData.map((crypto: CryptoCurrency, index: number) => ({
          name: `${index + 1}. ${crypto.name} - (${crypto.symbol})`,
          value: `[More Info Here](${crypto.explorer})`
          //$${parseInt(crypto.priceUsd).toFixed(3)}`,
        })),
      );

    await interaction.reply({
      embeds: [cryptoListEmbed],
      ephemeral: false,
    });
  } catch (e) {
    console.log(e);
  }
};

export default sendTrackedCryptoData;
