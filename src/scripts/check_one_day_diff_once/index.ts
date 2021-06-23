require('../../project_helpers/telegram_bot_deps');
require('../../project_helpers/dotenv');

import { getToday } from '../save_share_prices/helpers/get_stock_prices_today_filename';
import { createImageTableWithDayChangesData } from './helpers/create_image_table_with_day_changes_data';
import { getFileDataJSON } from './helpers/get_file_data_json';
import { getOneDayChangesTableData } from './helpers/get_one_day_changes_table_data';
import { sendOneDayChageTableImageToTelegram } from './helpers/send_one_day_chage_table_image_to_telegram';

/**
 * Путь к директории, в которой хранятся изображения изменений котировок за день
 */
export const IMAGE_TABLE_DIR = './src/raw_data/check_one_day_diff_once';

/**
 * Возвращает путь к файлу, в которой хранятся изображения изменений котировок за сегодняшний день
 */
export const GET_IMAGE_TABLE_FILEPATH = () => IMAGE_TABLE_DIR + '/' + getToday() + '.png';

/**
 * Функциональность следующая - считываем содержимое файла с котировками за сегодняшний день и формируем визуальную табличку с информацией,
 * которую отправляем в сообщении в телеграме
 */
export default async () => {
  // 1. Считываем данные из файла
  const fileDataJSON = await getFileDataJSON();
  if (!fileDataJSON) return;

  // 2. Формируем визуальную таблицу, которую будем отправлять в сообщении дальше
  const oneDayChangesData = getOneDayChangesTableData(fileDataJSON);
  if (!oneDayChangesData) return;

  // 3. Создаем изображение (таблицу) с ТОПом изменений котировок за день
  await createImageTableWithDayChangesData(oneDayChangesData);

  // 4. Отправляем в телеграме сообщение с картинкой (таблицей)
  await sendOneDayChageTableImageToTelegram();
};