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
const fetchHandler_1 = __importDefault(require("../helpers/fetchHandler"));
const quickSort_1 = __importDefault(require("../helpers/quickSort"));
const sendUserTopCurrencies = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const [response, error] = yield (0, fetchHandler_1.default)("https://api.coincap.io/v2/assets");
    if (error != null) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#ed053f")
            .setTitle("Error")
            .setDescription(`An error occurred: ${error.message}`);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    const data = yield response.then((response) => response.data);
    const convertPriceStringToNumber = data.map((crypto) => (Object.assign(Object.assign({}, crypto), { priceUsd: parseFloat(crypto.priceUsd) })));
    const prices = convertPriceStringToNumber.map((crypto, index) => {
        return { key: index, value: crypto.priceUsd };
    });
    const sortedCryptoData = (0, quickSort_1.default)(prices, "value")
        .reverse()
        .slice(0, 10);
    const cryptoListEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Top 10 Crypto Currencies: ")
        .setDescription("Found as of recently")
        .setColor("#3498db")
        .addFields(sortedCryptoData.map((cryptoPrice, index) => ({
        name: `${index + 1}. ${convertPriceStringToNumber[cryptoPrice.key].name} (${convertPriceStringToNumber[cryptoPrice.key].symbol})`,
        value: `Price: $${cryptoPrice.value.toFixed(2)}`, // Use toFixed to limit decimal places
    })));
    return interaction.reply({
        embeds: [cryptoListEmbed],
        ephemeral: false,
    });
});
exports.default = sendUserTopCurrencies;
