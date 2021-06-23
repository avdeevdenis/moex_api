import * as fs from 'fs';
import { debug_log } from '../../../../project_helpers/debug_log';
import { saveDataToFile } from '../../../../project_helpers/save_data_to_file';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, GET_STOCK_PRICES_TODAY_PATH } from '../../../save_share_prices/common_params';

/**
 * Записываем флаг 'wasNotificationSended' ценнным бумагам, оповещения по которым были отправлены шагом ранее
 */
export const saveNotificationStateToStocksDataFile = async (changesData) => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] saveNotificationStateToStocksDataFile start.');

  const fileData = await fs.readFileSync(GET_STOCK_PRICES_TODAY_PATH(), { encoding: 'utf8' });

  let fileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] saveNotificationStateToStocksDataFile fileDataJSON JSON.parse error.' + error.message, {
      isError: true
    });
  }

  if (!fileDataJSON) return;

  // Преобразуем массив в объект, чтобы дальше легче было сверить по ключам
  const changesDataObject = changesData.reduce((result, current) => {
    result[current.tickerName] = true;

    return result;
  }, {});

  // Пробегаемся по ключам объекта и ключам в файле, при совпадении - выставляем флаг
  Object.keys(changesDataObject).forEach(tickerName => {
    fileDataJSON[tickerName].wasNotificationSended = true;
  });

  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] saveNotificationStateToStocksDataFile save notification state to stocks data file start.');

  // Записываем в файл полученную информацию
  await saveDataToFile(JSON.stringify(fileDataJSON), GET_STOCK_PRICES_TODAY_PATH(), async (error: Error) => {
    await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] saveNotificationStateToStocksDataFile saveDataToFile error.' + error.message, {
      isError: true
    });
  });

  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] saveNotificationStateToStocksDataFile save notification state to stocks data file end.');
}