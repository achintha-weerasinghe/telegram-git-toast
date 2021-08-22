import * as functions from "firebase-functions";
import * as express from "express";
import { logger } from "firebase-functions";
import { BotActions } from "./bot-actions";

export const gitToastRouter = express.Router();

const {
  token: BOT_TOKEN,
  region: REGION,
  projectid: PROJECT_ID,
} = functions.config().gittoast;

const botActions = new BotActions(BOT_TOKEN, REGION, PROJECT_ID);
botActions.init();

gitToastRouter.post(
  `/bot${BOT_TOKEN}`,
  async (req: express.Request, res: express.Response) => {
    const body = req.body;

    if (!body) {
      return res.status(200).send({ success: true });
    }

    try {
      logger.debug("BODY", body);
      await botActions.handleUpdate(body);
    } catch (error) {
      logger.error("ERROR WHILE HANDLING UPDATE", error);
    }

    return res.status(200).send({ success: true });
  }
);

gitToastRouter.post(
  `/chat/:id`,
  async (req: express.Request, res: express.Response) => {
    const body = req.body;

    if (!body) {
      return res.status(200).send({ success: true });
    }

    return res.status(200).send({ success: true });
  }
);

gitToastRouter.get("*", async (req: express.Request, res: express.Response) => {
  res.status(404).send("Not found");
});
