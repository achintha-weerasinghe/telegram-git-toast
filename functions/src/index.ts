import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

admin.initializeApp();
const app = express();

import { gitToastRouter } from "./api/git-notify";

app.use("/git-notify", gitToastRouter);

app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).end();
});

export const api = functions.https.onRequest(app);