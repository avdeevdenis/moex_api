import { debug } from "../../helpers/debug";
import { saveDataToFile } from "../../helpers/saveDataToFile";
import { STOCK_PRICES_TODAY_PATH } from "../../save_share_prices/stocks_common_params";

const fs = require('fs');

/**
 * Записываем флаг 'wasNotificationSended' ценнным бумагам, оповещения по которым были отправлены шагом ранее
 */
export const saveNotificationStateToStocksDataFile = async (changesData) => {
  debug('🔹 6. Save notification state to stocks data file to read start.');

  const fileData = await fs.readFileSync(STOCK_PRICES_TODAY_PATH, { encoding: 'utf8' });

  let fileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (_) { }

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

  debug('🔹 6. Save notification state to stocks data file to read ok.');

  // Записываем в файл полученную информацию
  await saveDataToFile(JSON.stringify(fileDataJSON), STOCK_PRICES_TODAY_PATH);

  debug('🔹 7. Save notification state to stocks data file ok.');
}