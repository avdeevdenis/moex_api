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

export type TelegramSendCustomOptions = {
  /**
   * Метод, вызываемый в случае ошибки
   */
  onSendError: (error: Error) => void;
}

export const sendTelegramPhoto = async (photoData: fs.ReadStream, photoOptions: TelegramSendOptions & TelegramSendCustomOptions) => {
  const onSendError = photoOptions?.onSendError;

  return new Promise(resolve => {
    AvdeevStocksBot.sendPhoto(AVDEEV_DENIS_ID, photoData, photoOptions)
      .then(() => {
        resolve(true);
      })
      .catch(async (error) => {
        if (onSendError) {
          await onSendError(error);
        }

        resolve(true);
      });
  });
};