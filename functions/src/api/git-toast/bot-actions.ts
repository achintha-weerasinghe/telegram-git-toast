import { Context, Telegraf } from "telegraf";
import { logger } from "firebase-functions";
import { BotEndpointNames } from "../../shared/enums/bot-endpoints";
import { getToastPushMessage } from "../../shared/message-templates/git-toast-templates";

const CHAT_ID_PREFIX = "chat";

export class BotActions {
  private bot = new Telegraf(this.token);

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

      await ctx.reply(
        `Welcome!
Please add the following url and your secret to your github webhook.
<b>URL:</b> https://{BASE_URL}/chats/${id}.

<code>Note: Please configure only for pushes</code>`,
        { parse_mode: "HTML" }
      );
    });
  }

  async toast(id: string, gitBody: any): Promise<void> {
    const newId = id.replace(CHAT_ID_PREFIX, "");

    try {
      const message = getToastPushMessage(
        {
          pusher: gitBody.pusher.name,
          branch: gitBody.ref,
          repoUrl: gitBody.repository.url,
          repo: gitBody.repository.name,
        },
        gitBody.commits
      );

      await this.bot.telegram.sendMessage(newId, message, { parse_mode: "HTML" });
    } catch (error) {
      logger.error(JSON.stringify(error));
      await this.bot.telegram.sendMessage(
        newId,
        "Error occured while generating the toast! Please check the logs for additional details."
      );
    }
  }

  async handleUpdate(update: any) {
    await this.bot.handleUpdate(update);
  }
}
