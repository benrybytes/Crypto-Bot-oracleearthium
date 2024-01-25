import { NextFunction, Request, Response } from "express";
import discord_server_service from "../../services/discord_server_service";
const express = require("express");
const router = express.Router();
import bet_crypto_service from "../../services/bet_crypto_service";

router.post(
  "/reset-leaderboard",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.query.serverId as string;
      await discord_server_service.reset_leaderboard_in_db(serverId);
      res.status(200).send({
        message: "Successfully reset all points",
      });
    } catch (err) {
      res.status(500).send(err);
      console.error("Error while getting bets: ", err);
      next(err);
    }
  },
);

router.get(
  "/get-bets",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const bets = await bet_crypto_service.getUsersBettingFromServerId(
        req.query.serverId as string,
      ); // Assuming you have a method in your service to get bets
      res.status(200).send(bets);
    } catch (err) {
      res.status(500).send(err);
      console.error("Error while getting bets: ", err);
      next(err);
    }
  },
);

router.get(
  "/get-users",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const users = await bet_crypto_service.getUsersFromServerId(
        req.query.serverId as string,
      ); // Assuming you have a method in your service to get bets
      res.status(200).send(users);
    } catch (err) {
      res.status(500).send(err);
      console.error("Error while getting bets: ", err);
      next(err);
    }
  },
);

router.get(
  "/find-user-betting-and-user-by-uid",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { userBettingData, userData } =
        await bet_crypto_service.getUserBettingByUid(
          req.query.serverId as string,
          req.query.uid as string,
        ); // Assuming you have a method in your service to get bets
      res.status(200).send({ user: userData, userBetting: userBettingData });
    } catch (err) {
      res.status(500).send(err);
      console.error("Error while getting bets: ", err);
      next(err);
    }
  },
);

router.post(
  "/bet-on-symbol",
  async function (req: Request, res: Response, next: NextFunction) {
    const symbol: string = req.body.symbol;
    const uid: string = req.body.uid;

    const bet_amount: number = req.body.bet_amount;
    const username: string = req.body.username;
    const cryptoIncrease: boolean = req.body.cryptoIncrease;
    const current_price: number = req.body.current_price;
    try {
      const result = await bet_crypto_service.addUserToBetting(
        req.query.serverId as string,
        uid,
        bet_amount,
        symbol,
        username,
        cryptoIncrease,
        current_price,
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(400).send(err);
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);

export default router;
