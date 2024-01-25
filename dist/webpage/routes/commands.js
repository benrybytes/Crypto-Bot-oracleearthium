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
const discord_server_service_1 = __importDefault(require("../../services/discord_server_service"));
const express = require("express");
const router = express.Router();
const bet_crypto_service_1 = __importDefault(require("../../services/bet_crypto_service"));
router.post("/reset-leaderboard", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serverId = req.query.serverId;
        yield discord_server_service_1.default.reset_leaderboard_in_db(serverId);
        res.status(200).send({
            message: "Successfully reset all points",
        });
    }
    catch (err) {
        res.status(500).send(err);
        console.error("Error while getting bets: ", err);
        next(err);
    }
}));
router.get("/get-bets", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bets = yield bet_crypto_service_1.default.getUsersBettingFromServerId(req.query.serverId); // Assuming you have a method in your service to get bets
            res.status(200).send(bets);
        }
        catch (err) {
            res.status(500).send(err);
            console.error("Error while getting bets: ", err);
            next(err);
        }
    });
});
router.get("/get-users", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield bet_crypto_service_1.default.getUsersFromServerId(req.query.serverId); // Assuming you have a method in your service to get bets
            res.status(200).send(users);
        }
        catch (err) {
            res.status(500).send(err);
            console.error("Error while getting bets: ", err);
            next(err);
        }
    });
});
router.get("/find-user-betting-and-user-by-uid", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userBettingData, userData } = yield bet_crypto_service_1.default.getUserBettingByUid(req.query.serverId, req.query.uid); // Assuming you have a method in your service to get bets
            res.status(200).send({ user: userData, userBetting: userBettingData });
        }
        catch (err) {
            res.status(500).send(err);
            console.error("Error while getting bets: ", err);
            next(err);
        }
    });
});
router.post("/bet-on-symbol", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const symbol = req.body.symbol;
        const uid = req.body.uid;
        const bet_amount = req.body.bet_amount;
        const username = req.body.username;
        const cryptoIncrease = req.body.cryptoIncrease;
        const current_price = req.body.current_price;
        try {
            const result = yield bet_crypto_service_1.default.addUserToBetting(req.query.serverId, uid, bet_amount, symbol, username, cryptoIncrease, current_price);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).send(err);
            console.error(`Error while getting programming languages `, err);
            next(err);
        }
    });
});
exports.default = router;
