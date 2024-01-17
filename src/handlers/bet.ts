import { CommandInteraction, EmbedBuilder } from "discord.js";
import makePostRequest from "../helpers/postHandler";
import { crypto_express_url, discord_express_url } from "../constants/baseurl";
import IPostResponse from "../interfaces/post_response.interface";
import IUserBetting from "../interfaces/user_betting.interface";
import makeGetRequest from "../helpers/makeGetRequest";
import {
  CryptoCurrency,
  CryptoData,
} from "../interfaces/cryptoresponse.interface.";
import IUser from "../interfaces/users.interface";

interface IUserAndBettingUser {
  user: IUser;
  userBetting: IUserBetting;
}

interface ICryptoResponseDB {
  id: number;
  serverId: string;
  coinData: CryptoData[];
}

const createErrorEmbed = (message: string): EmbedBuilder => {
  const errorEmbed = new EmbedBuilder()
    .setColor("#ed053f")
    .setTitle("Error")
    .setDescription(`An error occurred: ${message}`);

  return errorEmbed;
};

const sendBetData = async (interaction: CommandInteraction) => {
  try {
    const findUserByUidResponse: IPostResponse<IUserAndBettingUser> =
      await makeGetRequest<IUserAndBettingUser>(
        discord_express_url +
          "/find-user-betting-and-user-by-uid?serverId=" +
          interaction.guildId +
          "&uid=" +
          interaction.user.id,
      )
        .then((res) => {
          return { data_response: res.data_response, error: null };
        })
        .catch((e) => {
          console.log("error from server: ", e);
          throw new Error(e);
        });

    const userBettingFound = await findUserByUidResponse.data_response!.then(
      (res: IUserAndBettingUser) => res.userBetting,
    );

    console.log("Here is user betting found: ", userBettingFound);

    if (
      Array.isArray(userBettingFound) &&
      userBettingFound[0].userBettingData !== null
    ) {
      return interaction.reply({
        embeds: [createErrorEmbed("User in betting list already")],
        ephemeral: true,
      });
    }

    const userFound: any = await findUserByUidResponse.data_response!.then(
      (res: IUserAndBettingUser) => res.user,
    );
    const userDataFound = userFound[0] as any;

    const getCoinsFromServer: IPostResponse<ICryptoResponseDB[]> =
      await makeGetRequest<ICryptoResponseDB[]>(
        crypto_express_url + "/get-crypto?serverId=" + interaction.guildId,
      )
        .then((res) => {
          return { data_response: res.data_response, error: null };
        })
        .catch((e) => {
          console.log("error from server: ", e);
          throw new Error(e);
        });

    if (getCoinsFromServer.error !== null) {
      return getCoinsFromServer.error;
    }

    const tracked_crypto: CryptoCurrency[] =
      (await getCoinsFromServer.data_response!.then(
        (res: ICryptoResponseDB[]) => {
          console.log("CRYPTO DATA FROM RESPONSE: ", res[0].coinData);
          return res[0].coinData;
        },
      )) as CryptoCurrency[];

    console.log("crypto: ", tracked_crypto);

    // The options passed from the slash command
    const bet_amount: number = parseInt(
      interaction.options.get("bet_amount", true).value as string,
    );
    const symbol = interaction.options
      .get("crypto_symbol", true)
      .value!.toString();

    const cryptoIncrease = Boolean(
      interaction.options.get("increase_or_decrease", true).value,
    );

    console.log("user data found: ", userDataFound);

    // Check if the options are present
    if (userDataFound.points < bet_amount || bet_amount <= 10) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            "minimum amount to bet is 10 or don't have enough points to bet",
          ),
        ],
        ephemeral: true,
      });
    }

    const coinBettingOn = tracked_crypto.find(
      (coin: CryptoCurrency) => coin.symbol === symbol,
    );
    if (!coinBettingOn) {
      return interaction.reply({
        embeds: [createErrorEmbed("Please Input a correct crypto symbol")],
        ephemeral: true,
      });
    }

    const priceUsd = coinBettingOn.priceUsd || "0";
    console.log("PRICE: ", priceUsd);
    console.log("symbol: ", symbol);
    // Continue processing with the priceUsd value...
    if (coinBettingOn === undefined || symbol === null) {
      return interaction.reply({
        embeds: [createErrorEmbed("Please Input a correct crypto symbol")],
        ephemeral: true,
      });
    } else if (typeof cryptoIncrease !== "boolean") {
      return interaction.reply({
        embeds: [createErrorEmbed("Please Input a correct prediction")],
        ephemeral: true,
      });
    }

    console.log("COIN BETTING: ", coinBettingOn);
    const userBet: IUserBetting = {
      symbol,
      username: interaction.user.username,
      uid: interaction.member?.user.id!,
      bet_amount,
      cryptoIncrease,
      current_price: parseFloat(coinBettingOn.priceUsd),
    };

    console.log("user bet: ", userBet);
    // Handle requests to server for adding users to betting pool
    const response: IPostResponse<any> = await makePostRequest<any, any>(
      discord_express_url + "/bet-on-symbol?serverId=" + interaction.guildId,
      userBet,
    )
      .then((res) => {
        return { data_response: res.data_response, error: null };
      })
      .catch((e) => {
        console.log("error from server: ", e);
        throw new Error(e);
      });

    if (response.error !== null) {
      return response.error;
    }

    console.log("response from post from bet: ", response.data_response);

    const users_betting: IUserBetting[] = await response.data_response!.then(
      (res) => {
        return res[0].usersBetting;
      },
    );

    const cryptoListEmbed = new EmbedBuilder()
      .setTitle("Crypto Currencies Tracked: ")

      .setDescription(`${interaction.member!.user.username} bet ${bet_amount}`)
      .setColor("#3498db")
      .addFields(
        users_betting.map((user: IUserBetting) => ({
          name: `User: ${user.username}`,
          value: `Bet Amount: ${user.bet_amount} | Crypto Price Increase: ${user.cryptoIncrease}`,
        })),
      );

    return interaction.reply({
      embeds: [cryptoListEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error processing slash command:", error);
    return error;
  }
};

export default sendBetData;
