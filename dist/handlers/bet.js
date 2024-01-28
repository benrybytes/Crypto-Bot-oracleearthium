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
const error_1 = require("./error");
const sendBetData = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
            console.log("Error from server: ", e);
            throw new Error(e);
        });
        if (findUserByUidResponse.error !== null) {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("Failed to fetch user data")],
                ephemeral: true,
            });
        }
        const userBettingFromRes = yield ((_a = findUserByUidResponse.data_response) === null || _a === void 0 ? void 0 : _a.then((res) => res.user_betting));
        const userFromRes = yield ((_b = findUserByUidResponse.data_response) === null || _b === void 0 ? void 0 : _b.then((res) => res.user));
        if (userBettingFromRes !== null) {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("User is already in the betting list")],
                ephemeral: true,
            });
        }
        const getCoinsFromServer = yield (0, makeGetRequest_1.default)(baseurl_1.crypto_express_url + "/get-crypto?serverId=" + interaction.guildId)
            .then((res) => {
            return { data_response: res.data_response, error: null };
        })
            .catch((e) => {
            console.log("Error from server: ", e);
            throw new Error(e);
        });
        if (getCoinsFromServer.error !== null) {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("Failed to fetch crypto data")],
                ephemeral: true,
            });
        }
        const trackedCrypto = yield getCoinsFromServer.data_response.then((res) => res.coinData);
        const betAmount = parseInt(interaction.options.get("bet_amount", true).value);
        const symbol = interaction.options
            .get("crypto_symbol", true)
            .value.toString();
        const cryptoIncrease = Boolean(interaction.options.get("increase_or_decrease", true).value);
        if (userFromRes.points < betAmount || betAmount <= 10) {
            return interaction.reply({
                embeds: [
                    (0, error_1.createErrorEmbed)("Minimum amount to bet is 10 or you don't have enough points to bet"),
                ],
                ephemeral: true,
            });
        }
        const coinBettingOn = trackedCrypto.find((coin) => coin.symbol == symbol);
        if (coinBettingOn == undefined) {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("Please input a correct crypto symbol")],
                ephemeral: true,
            });
        }
        else if (typeof cryptoIncrease !== "boolean") {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("Please input a correct prediction")],
                ephemeral: true,
            });
        }
        const userBet = {
            symbol,
            username: userFromRes.username,
            uid: userFromRes.uid,
            bet_amount: betAmount,
            cryptoIncrease,
            current_price: parseFloat(coinBettingOn.priceUsd),
        };
        const user_betting_response = yield (0, postHandler_1.default)(baseurl_1.discord_express_url + "/bet-on-symbol?serverId=" + interaction.guildId, userBet)
            .then((res) => {
            return { data_response: res.data_response, error: null };
        })
            .catch((e) => {
            return { data_response: null, error: e };
        });
        if (user_betting_response.error !== null) {
            return interaction.reply({
                embeds: [(0, error_1.createErrorEmbed)("Failed to place bet")],
                ephemeral: true,
            });
        }
        const usersBetting = yield user_betting_response.data_response.then((res) => res.updated_users_betting);
        const cryptoListEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Users betting: ")
            .setDescription(`${interaction.member.user.username} bet ${betAmount}`)
            .setColor("#3498db")
            .addFields(usersBetting.map((user) => ({
            name: `User: ${user.username}`,
            value: `Bet Amount: ${user.bet_amount} | Crypto Price Increase: ${user.cryptoIncrease}`,
        })));
        yield interaction.reply({
            embeds: [cryptoListEmbed],
            ephemeral: false,
        });
    }
    catch (error) {
        console.error("Error processing slash command:", error);
        return interaction.reply({
            embeds: [(0, error_1.createErrorEmbed)("An error occurred while processing your command")],
            ephemeral: true,
        });
    }
});
exports.default = sendBetData;
