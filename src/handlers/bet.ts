import { CommandInteraction, EmbedBuilder } from "discord.js";
import makePostRequest from "../helpers/postHandler";
import { crypto_express_url, discord_express_url } from "../constants/baseurl";
import IPostResponse from "../interfaces/post_response.interface";
import IUserBetting from "../interfaces/user_betting.interface";
import makeGetRequest from "../helpers/makeGetRequest";
import {
  CryptoCurrency,
} from "../interfaces/cryptoresponse.interface.";
import IUser from "../interfaces/users.interface";
import { createErrorEmbed } from "./error";

interface IUserAndBettingUser {
  user: IUser;
  user_betting: IUserBetting;
}

interface ICryptoResponseDB {
  id: number;
  serverId: string;
  coinData: CryptoCurrency[];
}

interface IUpdatedUserBettingResponse {
  updated_users_betting: IUserBetting[];
}



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
          return { data_response: res.data_response!, error: null };
        })
        .catch((e) => {
          console.log("Error from server: ", e);
          throw new Error(e);
        });

    if (findUserByUidResponse.error !== null) {
      return interaction.reply({
        embeds: [createErrorEmbed("Failed to fetch user data")],
        ephemeral: true,
      });
    }

    const userBettingFromRes = await findUserByUidResponse.data_response?.then((res) => res.user_betting)!;
    const userFromRes = await findUserByUidResponse.data_response?.then((res) => res.user)!;
    if (userBettingFromRes !== null) {
      return interaction.reply({
        embeds: [createErrorEmbed("User is already in the betting list")],
        ephemeral: true,
      });
    }

    const getCoinsFromServer: IPostResponse<ICryptoResponseDB> =
      await makeGetRequest<ICryptoResponseDB>(
        crypto_express_url + "/get-crypto?serverId=" + interaction.guildId,
      )
        .then((res) => {
          return { data_response: res.data_response, error: null };
        })
        .catch((e) => {
          console.log("Error from server: ", e);
          throw new Error(e);
        });

    if (getCoinsFromServer.error !== null) {
      return interaction.reply({
        embeds: [createErrorEmbed("Failed to fetch crypto data")],
        ephemeral: true,
      });
    }

    const trackedCrypto: CryptoCurrency[] =
      await getCoinsFromServer.data_response!.then((res) => res.coinData);

    const betAmount: number = parseInt(
      interaction.options.get("bet_amount", true).value as string,
    );
    const symbol = interaction.options
      .get("crypto_symbol", true)
      .value!.toString();

    const cryptoIncrease = Boolean(
      interaction.options.get("increase_or_decrease", true).value,
    );

    if (userFromRes.points < betAmount || betAmount <= 10) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            "Minimum amount to bet is 10 or you don't have enough points to bet",
          ),
        ],
        ephemeral: true,
      });
    }

    const coinBettingOn = trackedCrypto.find(
      (coin: CryptoCurrency) => coin.symbol == symbol,
    );

    if (coinBettingOn == undefined) {
      return interaction.reply({
        embeds: [createErrorEmbed("Please input a correct crypto symbol")],
        ephemeral: true,
      });
    } else if (typeof cryptoIncrease !== "boolean") {
      return interaction.reply({
        embeds: [createErrorEmbed("Please input a correct prediction")],
        ephemeral: true,
      });
    }
    const userBet: IUserBetting = {
      symbol,
      username: userFromRes.username,
      uid: userFromRes.uid,
      bet_amount: betAmount,
      cryptoIncrease,
      current_price: parseFloat(coinBettingOn.priceUsd),
    };

    const user_betting_response: IPostResponse<IUpdatedUserBettingResponse> = await makePostRequest<IUpdatedUserBettingResponse, IUserBetting>(
      discord_express_url + "/bet-on-symbol?serverId=" + interaction.guildId,
      userBet,
    )
      .then((res) => {
        return { data_response: res.data_response, error: null };
      })
      .catch((e) => {
        return { data_response: null, error: e };
      });

    if (user_betting_response.error !== null) {
      return interaction.reply({
        embeds: [createErrorEmbed("Failed to place bet")],
        ephemeral: true,
      });
    }

    const usersBetting: IUserBetting[] = await user_betting_response.data_response!.then((res: IUpdatedUserBettingResponse) => res.updated_users_betting);

    const cryptoListEmbed = new EmbedBuilder()
      .setTitle("Users betting: ")
      .setDescription(`${interaction.member!.user.username} bet ${betAmount}`)
      .setColor("#3498db")
      .addFields(
        usersBetting.map((user: IUserBetting) => ({
          name: `User: ${user.username}`,
          value: `Bet Amount: ${user.bet_amount} | Crypto Price Increase: ${user.cryptoIncrease}`,
        })),
      );

    await interaction.reply({
      embeds: [cryptoListEmbed],
      ephemeral: false,
    });
  } catch (error) {
    console.error("Error processing slash command:", error);
    return interaction.reply({
      embeds: [createErrorEmbed("An error occurred while processing your command")],
      ephemeral: true,
    });
  }
};

export default sendBetData;
