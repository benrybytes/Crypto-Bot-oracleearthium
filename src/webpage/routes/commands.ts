import { NextFunction, Request, Response } from "express";
import { createTable } from "../../services/db";

const express = require("express");
const router = express.Router();
const cryptoMW = require("../../services/dbmiddleware");

router.post(
  "/bet-on-symbol",
  async function (req: Request, res: Response, next: NextFunction) {
    const symbol: string = req.body.symbol;
    const uid: string = req.body.uid;

    const price: number = req.body.price;
    try {
      res.json(
        await cryptoMW.addUserToBetting(req.query.serverId, uid, price, symbol),
      );
    } catch (err) {
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);
