import { saveDataToFile } from '../../../../project_helpers/save_data_to_file';
import { GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH, SERVER_DIR, STOCK_PRICES_BY_DATE_DATA_DIR_NAME, GET_STOCK_PRICES_TODAY_PATH } from '../../common_params';
import { IStocksMarketItemObject } from '../../typings';
import { createDirIfNotExits } from '../../../../project_helpers/create_dir_if_not_exists';
import { createFileIfNotExists } from '../../../../project_helpers/create_file_if_not_exists';
import { debug_log } from '../../../../project_helpers/debug_log';

const fs = require('fs');

/**
 * Здесь записываем полученную информацию о тикерах в файл, при этом
 * 
 * Если директории не существует - создаем новую
 * Если файла не существует - создаем новый
 * Если в файле есть данные - объединяем данные из файла и новые
 */
export const mergeStocksDataIntoFile = async (stocksData: IStocksMarketItemObject[]) => {
  // Создаем нужные папки и файл
  await createStocksDataFileIfNotExits();

  // Получаем объект из файла
  const fileDataJSON = await getFileDataJSON();

  if (!fileDataJSON) return;

  // Объединяем данные из файла с данными полученными
  const combinedStocksData = combineStocksDataWithFileData(stocksData, fileDataJSON);

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile save JSON data start.');

  // Записываем объединенные данные в файл
  const isSaved = await saveDataToFile(JSON.stringify(combinedStocksData), GET_STOCK_PRICES_TODAY_PATH(), async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile saveDataToFile error.' + error.message);
  });

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile save JSON data end.');

  return isSaved;
};

/**
 * Объединяем данные из файла с данными полученными
 */
const combineStocksDataWithFileData = (stocksData: IStocksMarketItemObject[], fileDataJSON) => {
  stocksData.forEach(stocksItem => {
    const { SECID, ...restItemData } = stocksItem;

    if (!fileDataJSON[SECID]) {
      fileDataJSON[SECID] = {};
    }

    if (!fileDataJSON[SECID].values) {
      fileDataJSON[SECID].values = [];
    }

    const tickerValuesArray = fileDataJSON[SECID].values;

    /**
     * Записываем новую информацию в объект, только если она НЕ дублирует последнюю имеющуюся
     * (не совпадает по TIME)
     */
    const lastValueData = tickerValuesArray[tickerValuesArray.length - 1];
    const lasValueDataTime = lastValueData && lastValueData.TIME;

    const value = restItemData.LAST;

    /**
     * По каким-то причинам может не быть значения котировок 'LAST', в таком случае не записываем тоже
     */
    if (lasValueDataTime !== restItemData.TIME || !value) {
      debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), `[save_share_prices] combineStocksDataWithFileData update value '${SECID}'.`);

      if (tickerValuesArray.length >= 2) {
        tickerValuesArray[tickerValuesArray.length - 1] = restItemData;
      } else {
        tickerValuesArray.push(restItemData);
      }
    }
  });

  return fileDataJSON;
}

const getFileDataJSON = async () => {
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getFileDataJSON start.');

  const fileData = await fs.readFileSync(GET_STOCK_PRICES_TODAY_PATH(), { encoding: 'utf8' });

  let fileDataJSON = null;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    fileDataJSON = {};
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getFileDataJSON error.' + error.message);
  }

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getFileDataJSON end.');

  return fileDataJSON;
};

const createStocksDataFileIfNotExits = async () => {
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits start.');

  // Проверяем существует ли корневая папка с данными
  await createDirIfNotExits(SERVER_DIR, async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits SERVER_DIR error.' + error.message);
  });

  // Проверяем существует ли корневая папка с данными для сохранения информации по акциям
  await createDirIfNotExits(STOCK_PRICES_BY_DATE_DATA_DIR_NAME, async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits STOCK_PRICES_BY_DATE_DATA_DIR_NAME error.' + error.message);
  });

  // Проверяем существует ли файл с информацией по акциям для текущего дня
  await createFileIfNotExists(GET_STOCK_PRICES_TODAY_PATH(), async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits GET_STOCK_PRICES_TODAY_PATH() error.' + error.message);
  });

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits end.');
};