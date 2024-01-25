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
const quickSort_1 = __importDefault(require("../helpers/quickSort"));
const createErrorEmbed = (message) => {
    const errorEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#ed053f")
        .setTitle("Error")
        .setDescription(`An error occurred: ${message}`);
    return errorEmbed;
};
const displayLeaderboard = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Handle requests to server for adding users to betting pool
        const response = yield (0, makeGetRequest_1.default)(baseurl_1.discord_express_url + "/get-users?serverId=" + interaction.guildId)
            .then((res) => {
            return { data_response: res.data_response, error: null };
        })
            .catch((e) => {
            console.error("error from server: ", e);
            throw new Error(e);
        });
        if (response.error !== null) {
            return interaction.reply({
                embeds: [createErrorEmbed(response.error.message)],
                ephemeral: true,
            });
        }
        const users_betting = yield response.data_response.then((res) => {
            return res[0].users;
        });
        const get_highest_scores = (0, quickSort_1.default)(users_betting, "points");
        const highestEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Top users points")
            .setColor("#3498db")
            .addFields(get_highest_scores.map((user) => ({
            name: `User: ${user.username}`,
            value: `Points: ${user.points}`,
        })));
        return interaction.reply({
            embeds: [highestEmbed],
            ephemeral: false,
        });
    }
    catch (error) {
        console.error("Error processing slash command:", error);
        return error;
    }
});
exports.default = displayLeaderboard;
