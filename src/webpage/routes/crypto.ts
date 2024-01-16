import { NextFunction, Request, Response } from "express";
import { createTable } from "../../services/db";

const express = require("express");
const router = express.Router();
const cryptoMW = require("../../services/dbmiddleware");

/* GET programming languages. */
router.get(
  "/get-crypto",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await cryptoMW.getSelectedCoins(req.query.serverId));
    } catch (err) {
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);

router.post(
  "/check-for-server-table",
  async function (req: Request, res: Response, next: NextFunction) {
    await createTable(); // If previous table of data was deleted
    try {
      await cryptoMW.checkAndAddServer(req.body.serverId);
      res.status(200).send();
    } catch (err) {
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);

router.post(
  "/update-coin-list",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      res.json(
        await cryptoMW.updateSelectedCoins(
          req.body.serverId,
          req.body.selectedCoins,
        ),
      );
    } catch (err) {
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);

module.exports = router;
