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
const crypto_1 = __importDefault(require("../handlers/crypto"));
const targetedCrypto_1 = __importDefault(require("../handlers/targetedCrypto"));
const bet_1 = __importDefault(require("../handlers/bet"));
const leaderboard_1 = __importDefault(require("../handlers/leaderboard"));
// List of commands registered with handlers and data containined to show on discord
let commandList = [
    {
        data: new discord_js_1.SlashCommandBuilder()
            .setName("get_leaderboard")
            .setDescription("Display top 10 highest points"),
        execute(interaction) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, leaderboard_1.default)(interaction);
            });
        },
    },
    {
        data: new discord_js_1.SlashCommandBuilder()
            .setName("get_current_prices")
            .setDescription("Display a crypto currency list"),
        execute(interaction) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, crypto_1.default)(interaction);
            });
        },
    },
    {
        data: new discord_js_1.SlashCommandBuilder()
            .setName("get_targeted_crypto")
            .setDescription("server specific tokens"),
        execute(interaction) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, targetedCrypto_1.default)(interaction);
            });
        },
    },
    {
        data: new discord_js_1.SlashCommandBuilder()
            .setName("bet_on_tracked_currency")
            .setDescription("Bet amount on tracked coins")
            .addStringOption((option) => option
            .setName("crypto_symbol")
            .setDescription("The token symbol in tracked list")
            .setRequired(true))
            .addIntegerOption((option) => option
            .setName("bet_amount")
            .setDescription("The price to bet on tracked list")
            .setRequired(true))
            .addBooleanOption((option) => option
            .setName("increase_or_decrease")
            .setDescription("true or false for response")
            .setRequired(true)),
        execute(interaction) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, bet_1.default)(interaction);
            });
        },
    },
];
exports.default = commandList;
