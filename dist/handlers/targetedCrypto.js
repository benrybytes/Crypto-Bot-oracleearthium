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
const baseurl_1 = require("../constants/baseurl");
const makeGetRequest_1 = __importDefault(require("../helpers/makeGetRequest"));
const error_1 = require("./error");
const url = baseurl_1.baseUrl + "/crypto";
/*
    Be able to display an embed
    Precondition: Need a server id to send a request for data by the server
    PostCondition: Server sends up the data and we display it through an embed or an error embed

    @param interaction - The slash command interaction by the user containing information about the server
*/
const sendTrackedCryptoData = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serverId = interaction.guildId; // Assuming serverId is the guild ID
        console.log("serverId: ", serverId);
        const { data_response, error } = yield (0, makeGetRequest_1.default)(url + "/get-crypto?serverId=" + serverId);
        if (error != null) {
            (0, error_1.createErrorEmbed)("Error getting tracked coins");
        }
        const trackedCryptoData = yield data_response.then((res) => res.coinData);
        if (!trackedCryptoData || trackedCryptoData.length === 0) {
            return interaction.reply("No tracked crypto data available.");
        }
        const cryptoListEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Crypto Currencies Tracked: ")
            .setDescription("Server currently tracking : " + trackedCryptoData.length + " crypto currencies\nThese are the currencies you could bet on right now!")
            .setColor("#3498db")
            .addFields(trackedCryptoData.map((crypto, index) => ({
            name: `${index + 1}. ${crypto.name} - (${crypto.symbol})`,
            value: `[More Info Here](${crypto.explorer})`
            //$${parseInt(crypto.priceUsd).toFixed(3)}`,
        })));
        yield interaction.reply({
            embeds: [cryptoListEmbed],
            ephemeral: false,
        });
    }
    catch (e) {
        console.log(e);
    }
});
exports.default = sendTrackedCryptoData;
