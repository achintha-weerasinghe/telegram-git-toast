import { logger } from "firebase-functions";
import { Context, Telegraf } from "telegraf";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { BotEndpointNames } from "../../shared/enums/bot-endpoints";
import { BotNames } from "../../shared/enums/bot-names";
import { GitToastDb } from "../../shared/models/git-toast.model";
import { getToastPushMessage } from "../../shared/message-templates/git-toast-templates";

const CHAT_ID_PREFIX = "chat";

export class BotActions {
  private bot = new Telegraf(this.token);
  private db = admin.firestore();
  private gitToastBotCollection = this.db.collection(BotNames.gitToast);

  constructor(
    private token: string,
    private region: string,
    private projectId: string
  ) {
    logger.debug("Telegram webhook setting up...");
    this.bot.telegram.setWebhook(
      `https://${this.region}-${this.projectId}.cloudfunctions.net/botsapi/${BotEndpointNames.gitToast}/bot${this.token}`
    );
    logger.debug(
      `Telegram webhook setting up success! ${this.region} ${this.projectId}`
    );
  }

  init() {
    this.bot.start(async (ctx: Context) => {
      const id = `${CHAT_ID_PREFIX}${ctx.message?.chat.id}`;
      const secret = uuidv4();

      const data: GitToastDb = {
        id,
        secret,
      };

      await this.gitToastBotCollection.doc(id).set(data);
      await ctx.reply(`Welcome!
Please add the following url and secret to your github webhook.
URL: https://<BASE_URL>/chats/${id}
SECRET: ${secret}
`);
    });
  }

  async toast(chatData: GitToastDb, gitBody: any): Promise<void> {
    const id = chatData.id.replace(CHAT_ID_PREFIX, "");

    const message = getToastPushMessage(
      {
        pusher: gitBody.pusher.name,
        branch: gitBody.ref,
        repoUrl: gitBody.repository.url,
        repo: gitBody.repository.name,
      },
      gitBody.commits
    );

    await this.bot.telegram.sendMessage(id, message, { parse_mode: "HTML" });
  }

  async handleUpdate(update: any) {
    await this.bot.handleUpdate(update);
  }
}
