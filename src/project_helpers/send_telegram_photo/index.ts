import AvdeevStocksBot from '../get_telegram_bot';
import { AVDEEV_DENIS_ID } from '../telegram_configs';
import * as fs from 'fs';

/**
 * Отправляет фотографию в телеграме
 */

export type TelegramSendOptions = {
  /**
   * Режим обработки сообщений - markdown-разметка
   */
  parse_mode?: 'Markdown',

  /**
   * Подпись к фотографии
   */
  caption?: string;
};

export const sendTelegramPhoto = async (photoData: fs.ReadStream, photoOptions: TelegramSendOptions) => {
  return new Promise(resolve => {
    AvdeevStocksBot.sendPhoto(AVDEEV_DENIS_ID, photoData, photoOptions)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(true);
      });
  });
};