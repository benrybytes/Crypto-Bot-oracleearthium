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
const add_points_to_users_1 = __importDefault(require("../mysql/add_points_to_users"));
const db_1 = require("./db");
const reset_leaderboard_in_db = (serverid) => __awaiter(void 0, void 0, void 0, function* () {
    (0, db_1.emptyOrRows)((0, db_1.query)(add_points_to_users_1.default, [0, serverid]));
});
exports.default = {
    reset_leaderboard_in_db,
};
