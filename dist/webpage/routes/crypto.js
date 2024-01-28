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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const crypto_service = require("../../services/track_crypto_service");
/* GET programming languages. */
router.get("/get-crypto", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, serverId, coinData } = yield crypto_service.getSelectedCoins(req.query.serverId);
        try {
            res.status(200).send({ id, serverId, coinData });
        }
        catch (err) {
            console.error(`Error while getting programming languages `, err);
            next(err);
        }
    });
});
router.post("/check-for-server-table", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield crypto_service.checkAndAddDiscordServer(req.body.serverId);
            res.status(200).send();
        }
        catch (err) {
            console.error(`Error while getting programming languages `, err);
            next(err);
        }
    });
});
router.post("/update-coin-list", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield crypto_service.updateSelectedCoins(req.body.serverId, req.body.selectedCoins));
        }
        catch (err) {
            console.error(`Error while getting programming languages `, err);
            next(err);
        }
    });
});
exports.default = router;
