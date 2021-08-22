import { logger } from "firebase-functions";
import { Context, Telegraf } from "telegraf";

interface MyContext extends Context {}

export class BotActions {
  private bot = new Telegraf<MyContext>(this.token);

  constructor(
    private token: string,
    private region: string,
    private projectId: string
  ) {
    logger.debug("Telegram webhook setting up...");
    this.bot.telegram.setWebhook(
      `https://${this.region}-${this.projectId}.cloudfunctions.net/api/git-notify/bot${this.token}`
    );
    logger.debug(
      `Telegram webhook setting up success! ${this.region} ${this.projectId}`
    );
  }

  init() {
    this.bot.start((ctx) => {
      console.log(ctx);
      ctx.reply("Welcome!");
    });
  }

  async handleUpdate(update: any) {
    await this.bot.handleUpdate(update);
  }
}
