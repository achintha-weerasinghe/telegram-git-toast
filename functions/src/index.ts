import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import { BotEndpointNames } from "./shared/enums/bot-endpoints";

admin.initializeApp();
const app = express();

import { gitToastRouter } from "./api/git-toast";

app.use(`/${BotEndpointNames.gitToast}`, gitToastRouter);

app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).end();
});

export const botsapi = functions.https.onRequest(app);