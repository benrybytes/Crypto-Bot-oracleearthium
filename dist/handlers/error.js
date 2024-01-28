"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorEmbed = void 0;
const discord_js_1 = require("discord.js");
const createErrorEmbed = (message) => {
    const errorEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#ed053f")
        .setTitle("Error")
        .setDescription(`An error occurred: ${message}`);
    return errorEmbed;
};
exports.createErrorEmbed = createErrorEmbed;
