import { GET_IMAGE_TABLE_FILEPATH } from '../..';
import * as fs from 'fs';
import { sendTelegramPhoto } from '../../../../project_helpers/send_telegram_photo';
import { getToday } from '../../../save_share_prices/helpers/get_stock_prices_today_filename';
import { checkFileExists } from '../../../../project_helpers/check_file_exists';
import { GET_CHECK_ONE_DAY_DIFF_LOG_PATH } from '../../../save_share_prices/common_params';
import { debug_log } from '../../../../project_helpers/debug_log';

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

  await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] sendOneDayChageTableImageToTelegram start.');

  await sendTelegramPhoto(imageStream, {
    caption: `🎭 Top changes today *${getToday()}*.`,
    parse_mode: 'Markdown'
  });

  await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] sendOneDayChageTableImageToTelegram end.');
};