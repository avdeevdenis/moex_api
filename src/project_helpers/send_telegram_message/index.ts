import AvdeevStocksBot from '../get_telegram_bot';
import { TelegramSendOptions } from '../send_telegram_photo';
import { AVDEEV_DENIS_ID } from '../telegram_configs';

/**
 * Отправляет сообщение с текстом 'messageText' в телеграме
 */
export const sendTelegramMessage = async (messageText: string, callback?: (messageText: string) => void) => {
  const messageData = [
    AVDEEV_DENIS_ID,
    messageText, {
      parse_mode: 'Markdown'
    } as TelegramSendOptions
  ];

  return new Promise(resolve => {
    AvdeevStocksBot.sendMessage(...messageData)
      .then(() => {
        resolve(true);

        callback && callback(messageText);
      })
      .catch(() => {
        resolve(true);

        callback && callback(messageText);
      });
  });
};