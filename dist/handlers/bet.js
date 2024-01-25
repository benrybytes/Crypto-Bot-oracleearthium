"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const postHandler_1 = __importDefault(require("../helpers/postHandler"));
const baseurl_1 = require("../constants/baseurl");
const makeGetRequest_1 = __importDefault(require("../helpers/makeGetRequest"));
const db_1 = require("../services/db");
const createErrorEmbed = (message) => {
    const errorEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#ed053f")
        .setTitle("Error")
        .setDescription(`An error occurred: ${message}`);
    return errorEmbed;
};
const sendBetData = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const findUserByUidResponse = yield (0, makeGetRequest_1.default)(baseurl_1.discord_express_url +
            "/find-user-betting-and-user-by-uid?serverId=" +
            interaction.guildId +
            "&uid=" +
            interaction.user.id)
            .then((res) => {
            return { data_response: res.data_response, error: null };
        })
            .catch((e) => {
            console.log("error from server: ", e);
            throw new Error(e);
        });
        const userBettingFound = yield findUserByUidResponse.data_response.then((res) => res.userBetting);
        if (Array.isArray(userBettingFound) &&
            userBettingFound[0].userBettingData !== null) {
            return interaction.reply({
                embeds: [createErrorEmbed("User in betting list already")],
                ephemeral: true,
            });
        }
        const userFound = yield findUserByUidResponse.data_response.then((res) => res.user);
        const userDataFound = userFound[0];
        const getCoinsFromServer = yield (0, makeGetRequest_1.default)(baseurl_1.crypto_express_url + "/get-crypto?serverId=" + interaction.guildId)
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
        const tracked_crypto = (yield getCoinsFromServer.data_response.then((res) => {
            console.log("CRYPTO DATA FROM RESPONSE: ", res[0].coinData);
            return res[0].coinData;
        }));
        // The options passed from the slash command
        const bet_amount = parseInt(interaction.options.get("bet_amount", true).value);
        const symbol = interaction.options
            .get("crypto_symbol", true)
            .value.toString();
        const cryptoIncrease = Boolean(interaction.options.get("increase_or_decrease", true).value);
        // Check if the options are present
        if (userDataFound.points < bet_amount || bet_amount <= 10) {
            return interaction.reply({
                embeds: [
                    createErrorEmbed("minimum amount to bet is 10 or don't have enough points to bet"),
                ],
                ephemeral: true,
            });
        }
        const coinBettingOn = tracked_crypto.find((coin) => coin.symbol === symbol);
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
        }
        else if (typeof cryptoIncrease !== "boolean") {
            return interaction.reply({
                embeds: [createErrorEmbed("Please Input a correct prediction")],
                ephemeral: true,
            });
        }
        const userBet = {
            symbol,
            username: interaction.user.username,
            uid: (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.user.id,
            bet_amount,
            cryptoIncrease,
            current_price: parseFloat(coinBettingOn.priceUsd),
        };
        // Handle requests to server for adding users to betting pool
        const response = yield (0, postHandler_1.default)(baseurl_1.discord_express_url + "/bet-on-symbol?serverId=" + interaction.guildId, userBet)
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
        const users_betting = yield response.data_response.then((res) => {
            return res[0].usersBetting;
        });
        // Handle deleting in database amount bet
        const betSQL = `
      UPDATE bet_crypto
      SET users = (
          SELECT JSON_ARRAYAGG(
              JSON_SET(
                  user,
                  '$.points',
                  JSON_UNQUOTE(JSON_EXTRACT(user, '$.points')) - ?
              )
          )
          FROM JSON_TABLE(users, '$[*]' COLUMNS (
              user JSON PATH '$'
          )) AS t
      )
      WHERE serverId = ?;

    `;
        yield (0, db_1.query)(betSQL, [bet_amount, interaction.guildId]);
        const cryptoListEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Crypto Currencies Tracked: ")
            .setDescription(`${interaction.member.user.username} bet ${bet_amount}`)
            .setColor("#3498db")
            .addFields(users_betting.map((user) => ({
            name: `User: ${user.username}`,
            value: `Bet Amount: ${user.bet_amount} | Crypto Price Increase: ${user.cryptoIncrease}`,
        })));
        return interaction.reply({
            embeds: [cryptoListEmbed],
            ephemeral: false,
        });
    }
    catch (error) {
        console.error("Error processing slash command:", error);
        return error;
    }
});
exports.default = sendBetData;
