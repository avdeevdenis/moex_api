import AvdeevStocksBot from '../getBot';

import { AVDEEV_DENIS_ID } from '../telegramConfigs';

/**
 * Отправляет сообщение с текстом 'messageText' в телеграме
 */
export const sendTelegramMessage = async (messageText: string) => {
  const messageData = [
    AVDEEV_DENIS_ID,
    messageText, {
      parse_mode: 'Markdown'
    }
  ];

  return new Promise(resolve => {
    AvdeevStocksBot.sendMessage(...messageData)
      .then(resolve)
      .catch(resolve);
  });
};