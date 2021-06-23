import { GET_IMAGE_TABLE_FILEPATH } from '../..';
import * as fs from 'fs';
import { sendTelegramPhoto } from '../../../../project_helpers/send_telegram_photo';
import { getToday } from '../../../save_share_prices/helpers/get_stock_prices_today_filename';
import { checkFileExists } from '../../../../project_helpers/check_file_exists';

/**
 * Отправляем в телеграме сообщение с изображением (таблицей), сгенерированным ранее
 */
export const sendOneDayChageTableImageToTelegram = async () => {
  const filePath = GET_IMAGE_TABLE_FILEPATH();

  const isExists = await checkFileExists(filePath);

  if (!isExists) {
    return;
  }

  const imageStream = fs.createReadStream(filePath);

  await sendTelegramPhoto(imageStream, {
    caption: `🎭 Top changes today *${getToday()}*.`,
    parse_mode: 'Markdown'
  });
};