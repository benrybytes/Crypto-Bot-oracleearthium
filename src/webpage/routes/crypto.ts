import { NextFunction, Request, Response } from "express";
import { createTable } from "../../services/db";
import * as express from "express";
const router = express.Router();
const crypto_service = require("../../services/track_crypto_service");

/* GET programming languages. */
router.get(
  "/get-crypto",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await crypto_service.getSelectedCoins(req.query.serverId));
    } catch (err) {
      console.error(`Error while getting programming languages `, err!);
      next(err);
    }
  },
);

router.post(
  "/check-for-server-table",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      await crypto_service.checkAndAddDiscordServer(req.body.serverId);
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
        await crypto_service.updateSelectedCoins(
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
export default router;
