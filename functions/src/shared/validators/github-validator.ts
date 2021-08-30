import * as express from "express";
import * as CryptoJs from "crypto-js";
import { config } from "firebase-functions";

const GIT_SECRET = config().gittoast.secret;

export async function isFromGithub(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const body = req.body;
  const signature = req.headers["x-hub-signature-256"];

  try {

    const expectedSignature = `sha256=${CryptoJs.HmacSHA256(
      JSON.stringify(body),
      GIT_SECRET
    )}`;

    if (expectedSignature !== signature) {
      return res.status(401).send({ code: 401, message: "Unauthorized" });
    }

    return next();
  } catch (error) {
    return res.status(401).send({ code: 401, message: "Unauthorized" });
  }
}
