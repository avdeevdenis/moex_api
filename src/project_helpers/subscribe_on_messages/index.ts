import save_stocks_picture_and_send_telegram from '../../scripts/save_stocks_picture_and_send_telegram';
import { sendTelegramMessage } from '../send_telegram_message';

export type IMessage = {
  /**
   * Сообщение пользователя
   */
  text: string;
};

/**
 * Подписыватся на принятие сообщений от бота и их обработку
 */
export const subscribeOnMessages = (AvdeevStocksBot) => {
  AvdeevStocksBot.on('message', async (message: IMessage) => {
    const lowerText = message.text.toLocaleLowerCase();

    switch (lowerText) {
      case '/day_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'DAY'
        });
        return;

      case '/day_foreign':
        await save_stocks_picture_and_send_telegram({
          market: 'FOREIGN',
          period: 'DAY'
        });
        return;

      case '/day_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'DAY'
        });
        return;

      case '/week_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'WEEK'
        });
        return;

      case '/week_foreign':
        await save_stocks_picture_and_send_telegram({
          market: 'FOREIGN',
          period: 'WEEK'
        });
        return;

      case '/week_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'WEEK'
        });
        return;

      case '/month_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'MONTH'
        });
        return;

      case '/month_foreign':
        await save_stocks_picture_and_send_telegram({
          market: 'FOREIGN',
          period: 'MONTH'
        });
        return;

      case '/month_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'MONTH'
        });
        return;

      case '/six_monthes_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'SIX_MONTHES',
        });
        return;

      case '/six_monthes_foreign':
        await save_stocks_picture_and_send_telegram({
          market: 'FOREIGN',
          period: 'SIX_MONTHES',
        });
        return;

      case '/six_monthes_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'SIX_MONTHES',
        });
        return;

      case '/year_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'YEAR',
        });
        return;

      case '/year_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'YEAR',
        });
        return;

      case '/three_years_rus':
        await save_stocks_picture_and_send_telegram({
          market: 'RUS',
          period: 'THREE_YEARS',
        });
        return;

      case '/three_years_funds':
        await save_stocks_picture_and_send_telegram({
          market: 'FUNDS',
          period: 'THREE_YEARS',
        });
        return;

      default:
        await sendTelegramMessage('Incorrect command.');
        return;
    }
  });
}

// AvdeevStocksBot.on('polling_error', errorLogger);
// AvdeevStocksBot.on('webhook_error', errorLogger);
