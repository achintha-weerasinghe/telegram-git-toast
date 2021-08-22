import * as express from "express";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v1";
import * as CryptoJs from "crypto-js";
import { BotNames } from "../enums/bot-names";
import { GitToastDb } from "../models/git-toast.model";

const db = admin.firestore();
const gitToastBotCollection = db.collection(BotNames.gitToast);

export async function isFromGithub(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const body = req.body;
  const id = req.params.id;
  const signature = req.headers["x-hub-signature-256"];
  logger.debug("SIGNATURE", signature);
  logger.debug("HEADERS", JSON.stringify(req.headers));
  logger.debug("PARAMS", JSON.stringify(req.params));
  logger.debug("BODY", JSON.stringify(req.body));

  try {
    const data: GitToastDb = (
      await gitToastBotCollection.doc(id).get()
    ).data() as GitToastDb;

    const expectedSignature = `sha256=${CryptoJs.HmacSHA256(
      JSON.stringify(body),
      data.secret
    )}`;

    if (expectedSignature !== signature) {
      return res.status(401).send({ code: 401, message: "Unauthorized" });
    }

    res.locals.data = data;

    return next();
  } catch (error) {
    return res.status(401).send({ code: 401, message: "Unauthorized" });
  }
}
