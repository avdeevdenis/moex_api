import * as fs from 'fs';
import { saveDataToFile } from '../../../../project_helpers/save_data_to_file';
import { GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH, SERVER_DIR, STOCK_PRICES_BY_DATE_DATA_DIR_NAME, GET_STOCK_PRICES_TODAY_PATH } from '../../common_params';
import { IStocksPreparedMarketDataObject, IStocksSavedToFileObjectItem, StocksFileDataJSON } from '../../typings';
import { createDirIfNotExits } from '../../../../project_helpers/create_dir_if_not_exists';
import { createFileIfNotExists } from '../../../../project_helpers/create_file_if_not_exists';
import { debug_log } from '../../../../project_helpers/debug_log';

/**
 * Здесь записываем полученную информацию о тикерах в файл, при этом
 * 
 * Если директории не существует - создаем новую
 * Если файла не существует - создаем новый
 * Если в файле есть данные - объединяем данные из файла и новые
 */
export const mergeStocksDataIntoFile = async (stocksData: IStocksPreparedMarketDataObject[]) => {
  // Создаем нужные папки и файл
  await createStocksDataFileIfNotExits();

  // Получаем объект из файла
  const fileDataJSON = await getFileDataJSON();

  if (!fileDataJSON) return;

  // Объединяем данные из файла с данными полученными
  const combinedStocksData = await combineStocksDataWithFileData(stocksData, fileDataJSON);

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile save JSON data start.');

  // Записываем объединенные данные в файл
  const isSaved = await saveDataToFile(JSON.stringify(combinedStocksData), GET_STOCK_PRICES_TODAY_PATH(), async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile saveDataToFile error.' + error.message, {
      isError: true
    });
  });

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] mergeStocksDataIntoFile save JSON data end.');

  return isSaved;
};

/**
 * Отсекаем котировки акций, если это не сегодняшняя котировка, а вчерашняя, для этого проверяем что время обновления котировки < 12
 * (а потому что так захотел)
 */
const isTodayTime = (time: string) => {
  const hours = time.split(':')[0];
  const hoursInt = parseInt(hours, 10);

  return hoursInt < 12;
};

/**
 * Объединяем данные из файла с данными полученными
 */
const combineStocksDataWithFileData = async (stocksData: IStocksPreparedMarketDataObject[], fileDataJSON: StocksFileDataJSON) => {
  let changedItemForLogs = [];

  for (let i = 0; i < stocksData.length - 1; i++) {
    const stocksItem = stocksData[i];

    const { TICKER, ...restItemData } = stocksItem;

    if (!fileDataJSON[TICKER]) {
      fileDataJSON[TICKER] = {
        values: []
      };
    }

    if (!fileDataJSON[TICKER].values) {
      fileDataJSON[TICKER].values = [];
    }

    const tickerValuesArray: IStocksSavedToFileObjectItem[] = fileDataJSON[TICKER].values;

    /**
     * Записываем новую информацию в объект, только если она НЕ дублирует последнюю имеющуюся
     * (не совпадает по TIME)
     */
    const lastItemData: IStocksSavedToFileObjectItem = tickerValuesArray[tickerValuesArray.length - 1];
    const lastUpdateTime = lastItemData?.UPDATED_TIME;

    const price = restItemData.PRICE;

    /**
     * Цены почему-то может не быть - пропускаем
     */
    if (!price) continue;

    /**
     * Свежей информации по тикеру нет - пропускаем
     */
    if (
      lastUpdateTime !== undefined &&
      restItemData.UPDATED_TIME !== undefined &&
      lastUpdateTime === restItemData.UPDATED_TIME
    ) continue;

    /**
     * Логика такая: 
     * Если это первая информация о по данному тикеру - проверяем, что дата сегодняшная и записываем в массив
     * Если это последующая информация - записываем после первой (и перезаписываем ее далее)
     */
    switch (tickerValuesArray.length) {
      case 0: {
        if (isTodayTime(restItemData.UPDATED_TIME)) {
          tickerValuesArray.push(restItemData);
          changedItemForLogs.push(stocksItem);
        }

        break;
      }

      case 1:
        tickerValuesArray.push(restItemData);
        changedItemForLogs.push(stocksItem);
        break;

      default:
        tickerValuesArray[tickerValuesArray.length - 1] = restItemData;
        changedItemForLogs.push(stocksItem);
        break;
    }
  }

  if (changedItemForLogs.length) {
    const changedItemForLogsString = changedItemForLogs.map(item => {
      return '\t' + item.UPDATED_TIME + ' : ' + item.TICKER + ' : ' + item.PRICE;
    }).join('\n');

    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), `[save_share_prices] combineStocksDataWithFileData update \n${changedItemForLogsString}`);
  }

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
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getFileDataJSON error.' + error.message, {
      isError: true
    });
  }

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getFileDataJSON end.');

  return fileDataJSON;
};

const createStocksDataFileIfNotExits = async () => {
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits start.');

  // Проверяем существует ли корневая папка с данными
  await createDirIfNotExits(SERVER_DIR, async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits SERVER_DIR error.' + error.message, {
      isError: true
    });
  });

  // Проверяем существует ли корневая папка с данными для сохранения информации по акциям
  await createDirIfNotExits(STOCK_PRICES_BY_DATE_DATA_DIR_NAME, async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits STOCK_PRICES_BY_DATE_DATA_DIR_NAME error.' + error.message, {
      isError: true
    });
  });

  // Проверяем существует ли файл с информацией по акциям для текущего дня
  await createFileIfNotExists(GET_STOCK_PRICES_TODAY_PATH(), async (error: Error) => {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits GET_STOCK_PRICES_TODAY_PATH() error.' + error.message, {
      isError: true
    });
  });

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] createStocksDataFileIfNotExits end.');
};