import { Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class TelegramUpdate {
  @Start()
  async onStart(ctx: Context) {
    await ctx.reply(
      'Welcome to Rezerva! Open the web app to discover and book venues.',
    );
  }
}
