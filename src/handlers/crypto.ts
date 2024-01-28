import { CommandInteraction, EmbedBuilder } from "discord.js";
import makeFetchRequest from "../helpers/fetchHandler";
import quickSort from "../helpers/quickSort";
import { IPriceList } from "../interfaces/price_list.interface";

interface ICryptoData {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;
  vwap24Hr: string;
  explorer: string;
}

interface ICryptoPriceString extends ICryptoData {
  priceUsd: string;
}
interface ICryptoPriceNumber extends ICryptoData {
  priceUsd: number;
}
interface ICryptoResponse {
  data: ICryptoPriceString[];
}

const sendUserTopCurrencies = async (interaction: CommandInteraction) => {
  const [response, error] = await makeFetchRequest<ICryptoResponse>(
    "https://api.coincap.io/v2/assets",
  );
  if (error != null) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#ed053f")
      .setTitle("Error")
      .setDescription(`An error occurred: ${error.message}`);

    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  const data: ICryptoPriceString[] = await response!.then(
    (response) => response.data,
  );
  const convertPriceStringToNumber: ICryptoPriceNumber[] = data.map(
    (crypto) => ({
      ...crypto, // Make a copy
      priceUsd: parseFloat(crypto.priceUsd), // Map priceUsd to a number
    }),
  );
  const prices: IPriceList[] = convertPriceStringToNumber.map(
    (crypto: ICryptoPriceNumber, index: number) => {
      return { key: index, value: crypto.priceUsd };
    },
  );
  const sortedCryptoData = quickSort<IPriceList>(prices, "value")
    .reverse()
    .slice(0, 10);
  const cryptoListEmbed = new EmbedBuilder()
    .setTitle("Top 10 Crypto Currencies: ")

    .setDescription("Found as of recently")
    .setColor("#3498db")
    .addFields(
      sortedCryptoData.map((cryptoPrice: IPriceList, index: number) => ({
        name: `${index + 1}. ${convertPriceStringToNumber[cryptoPrice.key].name
          } (${convertPriceStringToNumber[cryptoPrice.key].symbol})`,
        value: `Price: $${cryptoPrice.value.toFixed(2)}`, // Use toFixed to limit decimal places
      })),
    );


  await interaction.reply({
    embeds: [cryptoListEmbed],
    ephemeral: false,
  });
};
export default sendUserTopCurrencies;
