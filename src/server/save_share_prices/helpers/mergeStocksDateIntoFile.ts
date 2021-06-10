import * as fs from 'fs';

import { createDirIfNotExits } from '../../helpers/createDirIfNotExits';
import { createFileIfNotExists } from '../../helpers/createFileIfNotExists';
import { debug } from '../../helpers/debug';
import { saveDataToFile } from '../../helpers/saveDataToFile';
import { SERVER_DIR, STOCK_PRICES_BY_DATE_DATA_DIR_NAME, STOCK_PRICES_TODAY_PATH } from '../stocks_common_params';
import { IStocksMarketItemObject } from '../stocks_common_typings';

/**
 * Здесь записываем полученную информацию о тикерах в файл, при этом
 * 
 * Если директории не существует - создаем новую
 * Если файла не существует - создаем новый
 * Если в файле есть данные - объединяем данные из файла и новые
 */
export const mergeStocksDateIntoFile = async (stocksData: IStocksMarketItemObject[]) => {
  // Создаем нужные папки и файл
  await createStocksDataFileIfNotExits();

  // Получаем объект из файла
  const fileDataJSON = await getFileDataJSON();

  // Объединяем данные из файла с данными полученными
  const combinedStocksData = combineStocksDataWithFileData(stocksData, fileDataJSON);

  debug('🔹 7. Save json data to file start.');

  // Записываем объединенные данные в файл
  const isSaved = await saveDataToFile(JSON.stringify(combinedStocksData), STOCK_PRICES_TODAY_PATH);

  debug('🔹 8. Save json data to file ok.');

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

    if (lasValueDataTime !== restItemData.TIME) {
      debug(`🔸 Updated values for '${SECID}'`);

      tickerValuesArray.push(restItemData);
    }
  });

  return fileDataJSON;
}

const getFileDataJSON = async () => {
  debug('🔹 5. Get file data JSON start.');
  const fileData = await fs.readFileSync(STOCK_PRICES_TODAY_PATH, { encoding: 'utf8' });

  let fileDataJSON = {};

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    fileDataJSON = {};
  }

  debug('🔹 6. Get file data JSON ok.');

  return fileDataJSON;
};

const createStocksDataFileIfNotExits = async () => {
  debug('🔹 3. Create stocks data file if not exists start.');

  // Проверяем существует ли корневая папка с данными
  await createDirIfNotExits(SERVER_DIR);

  // Проверяем существует ли корневая папка с данными для сохранения информации по акциям
  await createDirIfNotExits(STOCK_PRICES_BY_DATE_DATA_DIR_NAME);

  // Проверяем существует ли файл с информацией по акциям для текущего дня
  await createFileIfNotExists(STOCK_PRICES_TODAY_PATH);

  debug('🔹 4. Create stocks data file if not exists ok.');
};