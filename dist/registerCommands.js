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
exports.registerCommands = void 0;
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const env = process.env.NODE_ENV || "development";
const config = require(path_1.default.join(__dirname, "/config/discord_config"))[env];
const rest = new discord_js_1.REST({ version: "10" }).setToken(config.discord_token);
const clientId = config.discord_client_id;
const waitForCommand = (commands, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    const commandList = [];
    commands.forEach((command) => {
        commandList.push(command.data.toJSON());
    });
    if (guildId.length == 0) {
        yield rest.put(discord_js_1.Routes.applicationCommands(clientId), {
            body: commandList,
        });
    }
});
function registerCommands({ guildId, commands, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Started refreshing application (/) commands.");
            yield waitForCommand(commands, guildId);
            console.log("Successfully reloaded application (/) commands.");
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.registerCommands = registerCommands;
