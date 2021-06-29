import check_one_day_diff_once from '../../scripts/check_one_day_diff_once';

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
      case '/day':
        await check_one_day_diff_once();
        return;

      default:
        return;
    }
  });
}

// AvdeevStocksBot.on('polling_error', errorLogger);
// AvdeevStocksBot.on('webhook_error', errorLogger);
