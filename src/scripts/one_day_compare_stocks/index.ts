require('../../project_helpers/telegram_bot_deps');
require('../../project_helpers/dotenv');

import axios from 'axios';
import * as fs from 'fs';
import { sendTelegramMessage } from '../../project_helpers/send_telegram_message';
import { debug_log } from '../../project_helpers/debug_log';
import { createFileIfNotExists } from '../../project_helpers/create_file_if_not_exists';
import { saveDataToFile } from '../../project_helpers/save_data_to_file';
import { getStockPricesTodayFileName } from '../../project_helpers/get_stock_prices_today_filename';
import { EXECUTION_LOG_FILEPATH, StocksDataInput } from '../save_stocks_picture_and_send_telegram';

const { DateTime } = require('luxon');

/**
 * Границы изменений, при превышении которых считаем, что произошло значимое изменение
 */
export const DIFF_SENSITIVITY = {
  DAY: 5,
  WEEK: 10,
};

/**
 * Функция ожидает 'ms' - миллисекунд
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Изменения котировок за 1 день
 */
export const getOneDayDiff = async (market: StocksDataInput['market']) => {
  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getOneDayDiff start.');

  /**
   * 1. Получаем необходимые данные из moex API
   */
  const urls = getTodayStocksDataUrls(market);

  let responseData;

  /**
   * Может быть несколько url-ов, объединяем данные полученные в них
   */
  for (let i = 0; i < urls.length; i++) {
    const responseDataItem = await getAxiosResponseData(urls[i]);

    if (!responseData) {
      responseData = responseDataItem;
    } else {
      responseData.marketdata.data.push(...responseDataItem.marketdata.data);
    }
  }

  if (!responseData) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getOneDayDiff end.');
    return;
  }

  const { data: stocksData, columns } = responseData.marketdata;

  /**
   * 2. Добавляем названия столбцов в объекты
   */
  let stocksDataWithColumnNames = addColumnNamesToData(stocksData, columns);

  /**
   * 3. Убираем из названия постфиксы '-RM' - если это зарубежная компания
   */
  if (market === 'FOREIGN') {
    stocksDataWithColumnNames = stocksDataWithColumnNames.map(({ SECID, ...restData }) => {
      const [SECID_PREPARED, ..._SECID_OTHER] = SECID.split('-RM');
      return {
        ...restData,
        SECID: SECID_PREPARED,
      };
    });
  }

  /**
   * 4. Добавляем процентное изменение между котировками открытия и текущей
   */
  const stocksDataWithPercentageDiff = addPercentageDiffField(stocksDataWithColumnNames);

  /**
   * 5. Сортируем по убыванию изменения процентов
   */
  const sortedStocksData = sortStocksDataByPercentageDiff(stocksDataWithPercentageDiff);

  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getOneDayDiff end.');

  return sortedStocksData;
};

/**
 * Вспомогательный метод, который возвращает исторические данные в зависимости от переданных параметров
 */
export const getHistoryDiffHelper = async ({
  requestUrls,
  stocksDataOneDay,
  market,
}: {
  requestUrls: string[],
  stocksDataOneDay: any,
  market: StocksDataInput['market'],
}) => {
  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getHistoryDiffHelper start.');

  /**
   * 1. Получаем необходимые данные из moex API
   */
  let responseData;

  /**
   * Может быть несколько url-ов, объединяем данные полученные в них
   */
  for (let i = 0; i < requestUrls.length; i++) {
    const responseDataItem = await getAxiosResponseHistoryDataWithCursor(requestUrls[i]);

    if (!responseData) {
      responseData = responseDataItem;
    } else {
      responseData.history.data.push(...responseDataItem.history.data);
    }
  }

  if (!responseData) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getHistoryDiffHelper end.');

    return;
  }

  const { data: stocksData, columns } = responseData.history;

  if (!stocksData.length) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] End. nothing found.');

    await sendTelegramMessage('Nothing was found for this command.');

    return;
  }


  /**
   * 2. Добавляем названия столбцов в объекты
   */
  const stocksDataWithColumnNames = addColumnNamesToData(stocksData, columns);


  /**
   * 3. Фильтруем результаты, оставляем только необходимые
   */
  let stocksDataFiltered = filterStocksData(stocksDataWithColumnNames, market);

  /**
 * 3. Убираем из названия постфиксы '-RM' - если это зарубежная компания
 */
  if (market === 'FOREIGN') {
    stocksDataFiltered = stocksDataFiltered.map(({ SECID, ...restData }) => {
      const [SECID_PREPARED, ..._SECID_OTHER] = SECID.split('-RM');
      return {
        ...restData,
        SECID: SECID_PREPARED,
      };
    });
  }

  /**
   * 4. Добавляем текущие значения цены акций из массива с сегодняшними ценами
   */
  const stocksDataWithLastValues = addLastValueToData(stocksDataFiltered, stocksDataOneDay);

  /**
   * 5. Добавляем процентное изменение между котировками открытия и текущей
   */
  const stocksDataWithPercentageDiff = addPercentageDiffField(stocksDataWithLastValues);

  /**
   * 6. Сортируем по убыванию изменения процентов
   */
  const sortedStocksData = sortStocksDataByPercentageDiff(stocksDataWithPercentageDiff);

  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getHistoryDiffHelper end.');

  return sortedStocksData;
};

/**
 * Изменения котировок за неделю
 */
export const getOneWeekDiff = async (stocksDataOneDay, market: StocksDataInput['market']) => {
  const oneWeekDate = getDateWithMinus({ week: 1 });

  const stocksData = await getHistoryDiffHelper({
    requestUrls: getHistoryStocksDataUrl(oneWeekDate, market),
    stocksDataOneDay,
    market,
  });

  return stocksData;
};

/**
 * Изменения котировок за 1 месяц
 */
export const getOneMonthDiff = async (stocksDataOneDay, market: StocksDataInput['market']) => {
  const oneMonthDate = getDateWithMinus({ month: 1 });

  const stocksData = await getHistoryDiffHelper({
    requestUrls: getHistoryStocksDataUrl(oneMonthDate, market),
    stocksDataOneDay,
    market,
  });

  return stocksData;
};

/**
 * Изменения котировок за 6 месяцев
 */
export const getSixMonthesDiff = async (stocksDataOneDay, market: StocksDataInput['market']) => {
  const sixMonthDate = getDateWithMinus({ month: 6 });

  const stocksData = await getHistoryDiffHelper({
    requestUrls: getHistoryStocksDataUrl(sixMonthDate, market),
    stocksDataOneDay,
    market,
  });

  return stocksData;
};

/**
 * Изменения котировок за 1 год
 */
export const getOneYearDiff = async (stocksDataOneDay, market: StocksDataInput['market']) => {
  const oneYearDate = getDateWithMinus({ year: 1 });

  const stocksData = await getHistoryDiffHelper({
    requestUrls: getHistoryStocksDataUrl(oneYearDate, market),
    stocksDataOneDay,
    market,
  });

  return stocksData;
};

/**
 * Изменения котировок за 3 года
 */
export const getThreeYearsDiff = async (stocksDataOneDay, market: StocksDataInput['market']) => {
  const threeYearsDate = getDateWithMinus({ year: 3 });

  const stocksData = await getHistoryDiffHelper({
    requestUrls: getHistoryStocksDataUrl(threeYearsDate, market),
    stocksDataOneDay,
    market,
  });

  return stocksData;
};

/**
 * Проходимся по полученным данным и определяем есть ли среди них абсолютные изменения в процентах, превышающие целевые
 */
export const filterOnlySensetivityDiff = (oneDayDiff) => {
  const oneDayDiffSensetivity = oneDayDiff.filter(oneDayItem =>
    Math.abs(oneDayItem._PERCENTAGE_DIFF) >= DIFF_SENSITIVITY.DAY
  );

  return oneDayDiffSensetivity;
};

/**
 * Формирует массив с сообщениями для телеграма об изменениях цены
 */
export const getTelegramMessagesWithDiff = (oneDayDiffSensetivity) => {
  const oneDayDiffMessages = oneDayDiffSensetivity.map(stocksItem => {
    const { SECID, _PERCENTAGE_DIFF, UPDATETIME } = stocksItem;

    let message = '';

    const trend = _PERCENTAGE_DIFF > 0;
    const trendIcon = trend ? '🍏' : '🍎';
    const trendArrow = trend ? '↑' : '↓'

    const hashtag = `#${SECID}`;

    message += trendIcon + ' *' + SECID + ` > ${DIFF_SENSITIVITY.DAY}% (${_PERCENTAGE_DIFF})% ${trendArrow}` + '*\n';

    message += '*Update time - ' + UPDATETIME + '*.\n';

    message += hashtag;

    return message;
  });

  const messages = [].concat(oneDayDiffMessages);

  return messages;
};

/**
 * Отправляет сообщения в телеграме
 */
export const sendTelegramMessages = async (telegramMessages) => {
  for (let i = 0; i < telegramMessages.length; i++) {
    const telegramMessage = telegramMessages[i];

    await sendTelegramMessage(telegramMessage);

    await sleep(340);
  }
};

/**
 * Возвращает JSON содержимое файла
 */
export const getFileDataJSON = async (filePath: string) => {
  let fileData;

  try {
    fileData = await fs.readFileSync(filePath, { encoding: 'utf8' });
  } catch (error) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getFileDataJSON readFileSync error.' + error.message, {
      isError: true
    });
  }

  let fileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getFileDataJSON JSON.parse error.' + error.message);
  }

  return fileDataJSON;
}

/**
 * Проверяем, отправляли ли ранее информацию по изменению данного тикера, и фильтруем если отправляли и записываем в файл
 */
export const filterDiffWithAlreadySended = async (oneDayDiffSensetivity) => {
  const todayFilepath = getStockPricesTodayFileName({ pathStart: './src/raw_data/compare_stocks', extension: 'json' });

  await createFileIfNotExists(todayFilepath);

  const fileContent = await getFileDataJSON(todayFilepath);

  const fileContentJSON = fileContent ?? {};

  const filtered = oneDayDiffSensetivity.filter(oneDayDiffItem => {
    const { SECID } = oneDayDiffItem;

    const alreadySended = (fileContentJSON[SECID])?.IS_SENDED;

    return !alreadySended;
  });

  if (!filtered.length) return [];

  for (let i = 0; i < filtered.length; i++) {
    const filteredItem = filtered[i];
    const { SECID, _PERCENTAGE_DIFF } = filteredItem;

    if (!fileContentJSON[SECID]) {
      fileContentJSON[SECID] = {};
    }

    fileContentJSON[SECID].IS_SENDED = true;
    fileContentJSON[SECID].SENDED_DIFF_VALUE = _PERCENTAGE_DIFF;
  }

  await saveDataToFile(JSON.stringify(fileContentJSON), todayFilepath, async (error) => {
    await debug_log(EXECUTION_LOG_FILEPATH, `[compare_stocks] saveDataToFile error.`, {
      isError: true,
      data: error.message,
    });
  });

  return filtered;
};

/**
 * Возвращает разницу между двумя числами в процентах
 */
export const getPercentageDiff = (value1: number, value2: number, NUMBER_ROUNDING_ORDER = 2) => {
  let valuesDiffInPercents = value2 * 100 / value1 - 100;

  // Округляем до порядка 'NUMBER_ROUNDING_ORDER' и приводим к числу
  valuesDiffInPercents = Number(valuesDiffInPercents.toFixed(NUMBER_ROUNDING_ORDER));

  return valuesDiffInPercents;
};

/**
 * Тикеры Российских компаний, информацию о которых необходимо получить
 */
const REQUIRED_API_TICKERS_RUS = [
  'OZON',
  'YNDX',
  'SBER',
  'ALRS',
  'FIVE',
  'AFKS',
  'GAZP',
  'DSKY',
  'IRAO',
  'MOEX',
  'MTSS',
  'NLMK',
  'POLY',
  'AGRO',
  'HYDR',
  'SBER',
  'SBERP',
  'PHOR',
  'CHMF',
  'TCSG',
  'AKRN',
  'LSRG',
  'GMKN',
  'UPRO',
];

/**
 * Тикеры зарубежных компаний, информацию о которых необходимо получить
 */
export const REQUIRED_API_TICKERS_FOREIGN = [
  'SPCE-RM',
  'AAPL-RM',
  'KO-RM',
  'ANBN-RM',
  'T-RM',
  'BAC-RM',
  'CSCO-RM',
  'XOM-RM',
  'INTC-RM',
  'VZ-RM',
  'MRK-RM',
  'HPQ-RM',
];

/**
 * Тикеры фондов, торгующихся в режиме T+ USD, информацию о которых необходимо получить
 */
export const REQUIRED_API_TICKERS_FUNDS_TPLUS_USD = [
  'FXCN',
  'FXGD',
  'FXDM',
  'FXIM',
  'FXUS',
  'FXES',
  'FXTP',
  'FXIP',
  'FXWO',
 
  'TMOS',
  'TGLD',
  'TECH',
  'TSPX',
  'TBIO',

  'VTBE',
  'VTBX'
];

/**
 * Тикеры фондов, торгующихся в режиме T+, информацию о которых необходимо получить
 */
export const REQUIRED_API_TICKERS_FUNDS_TPLUS = [
  'FXDE',
  'FXRB',
];

/**
 * Необходимые поля из API
 */
const REQUIRED_API_FIELDS = [
  'SECID',
  'OPEN',
  'LAST',
  'UPDATETIME',
  'CHANGE',
];

/**
 * Возвращет дату путем отнятия некоторого количества дней/недель/месяцев из текущей даты
 */
export const getDateWithMinus = (minusValue) => {
  let minusedDate = DateTime.now().minus(minusValue);

  // Если получается суббота или воскресенье - откатываемся к пятнице
  if (minusedDate.weekday === 6) {
    minusedDate = minusedDate.minus({ days: 1 });
  }

  if (minusedDate.weekday === 7) {
    minusedDate = minusedDate.minus({ days: 2 });
  }

  const minusedDateISO = minusedDate.toISODate();

  return minusedDateISO;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг за определенный день
 * (неделю назад, месяц назад, полгода назад в зависимости от переданной даты)
 * Российские компании
 */
export const getHistoryStocksDataUrlRUS = (date) => {
  const url = 'https://iss.moex.com/iss/history/engines/stock/markets/shares/boardgroups/57/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Дата, данные за которую мы хотим получить
     */
    '&date=' + date +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&history.columns=' + 'TRADEDATE,SECID,OPEN' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Начало с 0
     */
    '&start=0' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=3' +

    /**
     * Максимально возможный лимит - 100 элементов
     */
    '&limit=100' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг за определенный день
 * (неделю назад, месяц назад, полгода назад в зависимости от переданной даты)
 * Зарубежные компании
 */
export const getHistoryStocksDataUrlForeign = (date) => {
  const url = 'https://iss.moex.com/iss/history/engines/stock/markets/foreignshares/boardgroups/265/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    // '&security_collection=301'

    /**
     * Дата, данные за которую мы хотим получить
     */
    '&date=' + date +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&history.columns=' + 'TRADEDATE,SECID,OPEN' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Начало с 0
     */
    '&start=0' +

    /**
     * Максимально возможный лимит - 100 элементов
     */
    '&limit=100' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг за определенный день
 * (неделю назад, месяц назад, полгода назад в зависимости от переданной даты)
 * Фонды в режиме T+
 */
export const getHistoryStocksDataUrlFundsTplus = (date) => {
  const url = 'https://iss.moex.com/iss/history/engines/stock/markets/shares/boardgroups/156/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Дата, данные за которую мы хотим получить
     */
    '&date=' + date +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=151' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&history.columns=' + 'TRADEDATE,SECID,OPEN' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Начало с 0
     */
    '&start=0' +

    /**
     * Максимально возможный лимит - 100 элементов
     */
    '&limit=100' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг за определенный день
 * (неделю назад, месяц назад, полгода назад в зависимости от переданной даты)
 * Фонды в режиме T+
 */
export const getHistoryStocksDataUrlFundsTPlusUSD = (date) => {
  const url = 'https://iss.moex.com/iss/history/engines/stock/markets/shares/boardgroups/156/securities.json' +
    /**
    * Отключаем дополнительную мету
    */
    '?iss.meta=off' +

    /**
    * Дата, данные за которую мы хотим получить
    */
    '&date=' + date +

    /**
    * Поле, по которому сортирует результаты
    */
    '&sort_column=SECID' +

    /**
    * Порядок сортировки
    */
    '&sort_order=asc' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=151' +

    /**
    * Поля, которые необходимо получить из API
    */
    '&history.columns=' + 'TRADEDATE,SECID,OPEN' +

    /**
    * Пользовательский язык
    */
    '&lang=ru' +

    /**
    * Начало с 0
    */
    '&start=0' +

    /**
    * Максимально возможный лимит - 100 элементов
    */
    '&limit=100' +

    /**
    * Таймпстепм
    */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг за определенный день
 * (неделю назад, месяц назад, полгода назад в зависимости от переданной даты)
 */
export const getHistoryStocksDataUrl = (date, market: StocksDataInput['market']) => {
  let url;

  switch (market) {
    case 'RUS':
      url = getHistoryStocksDataUrlRUS(date);
      break;

    case 'FOREIGN':
      url = getHistoryStocksDataUrlForeign(date);
      break;

    case 'FUNDS':
      return [getHistoryStocksDataUrlFundsTplus(date)];
  }

  return [url];
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг Российских компаний
 * за сегодня
 */
export const getTodayStocksDataUrlRUS = () => {
  const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boardgroups/57/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=3' +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&marketdata.columns=' + REQUIRED_API_FIELDS.join(',') +

    /**
     * Тикеры, информация о которых необходимо получить из API
     */
    '&marketdata.securities=' + REQUIRED_API_TICKERS_RUS.join(',') +

    /**
     * Говорим о том, что хотим получить только блок с 'marketdata'
     */
    '&iss.only=marketdata' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг зарубежных компаний
 * за сегодня
 */
export const getTodayStocksDataUrlForeign = () => {
  const url = 'https://iss.moex.com/iss/engines/stock/markets/foreignshares/boardgroups/265/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=301' +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&marketdata.columns=' + REQUIRED_API_FIELDS.join(',') +

    /**
     * Тикеры, информация о которых необходимо получить из API
     */
    '&marketdata.securities=' + REQUIRED_API_TICKERS_FOREIGN.join(',') +

    /**
     * Говорим о том, что хотим получить только блок с 'marketdata'
     */
    '&iss.only=marketdata' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг фондов, торгующихся в T+ USD
 * за сегодня
 */
export const getTodayStocksDataUrlFundsTPlusUSD = () => {
  const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boardgroups/156/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=151' +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&marketdata.columns=' + REQUIRED_API_FIELDS.join(',') +

    /**
     * Тикеры, информация о которых необходимо получить из API
     */
    '&marketdata.securities=' + REQUIRED_API_TICKERS_FUNDS_TPLUS_USD.join(',') +

    /**
     * Говорим о том, что хотим получить только блок с 'marketdata'
     */
    '&iss.only=marketdata' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг фондов, торгующихся в T+
 * за сегодня
 */
export const getTodayStocksDataUrlFundsTplus = () => {
  const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boardgroups/156/securities.json' +
    /**
     * Отключаем дополнительную мету
     */
    '?iss.meta=off' +

    /**
     * Фильтр по коллекции
     */
    '&security_collection=151' +

    /**
     * Поле, по которому сортирует результаты
     */
    '&sort_column=SECID' +

    /**
     * Порядок сортировки
     */
    '&sort_order=asc' +

    /**
     * Поля, которые необходимо получить из API
     */
    '&marketdata.columns=' + REQUIRED_API_FIELDS.join(',') +

    /**
     * Тикеры, информация о которых необходимо получить из API
     */
    '&marketdata.securities=' + REQUIRED_API_TICKERS_FUNDS_TPLUS.join(',') +

    /**
     * Говорим о том, что хотим получить только блок с 'marketdata'
     */
    '&iss.only=marketdata' +

    /**
     * Пользовательский язык
     */
    '&lang=ru' +

    /**
     * Таймпстепм
     */
    '&_=' + Number(new Date())

  return url;
};

/**
 * Ссылка на API, по которой получаем котировки ценных бумаг
 * за сегодня
 */
export const getTodayStocksDataUrls = (market: StocksDataInput['market']) => {
  let url;

  switch (market) {
    case 'RUS':
      url = getTodayStocksDataUrlRUS();
      break;

    case 'FOREIGN':
      url = getTodayStocksDataUrlForeign();
      break;

    case 'FUNDS':
      return [getTodayStocksDataUrlFundsTplus(), getTodayStocksDataUrlFundsTPlusUSD()];
  }

  return [url];
};

/**
 * Отправляет ajax-запрос по заданному адресу и возвращает результат
 */
export const getAxiosResponseData = async (url: string) => {
  let response;

  await debug_log(EXECUTION_LOG_FILEPATH, `[compare_stocks] getAxiosResponseData send request "${url}".`);

  try {
    response = await axios.get(url);
  } catch (requestError) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getAxiosResponseData requestError.', {
      isError: true,
      data: requestError.message,
    });

    return;
  }

  const isResponseOk = response && (
    response.status === 200 &&
    response.statusText === 'OK'
  );

  if (!isResponseOk) {
    await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getAxiosResponseData response error.', {
      isError: true,
      data: response.status,
    });

    return;
  }

  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] getAxiosResponseData response ok.');

  return response.data;
};

/**
 * Рекурсивная обработка последовательно ссылок с параметром 'cursor'
 */
const parseRecursiveOneCursorHistoryUrl = async (url: string) => {
  const responseData = await getAxiosResponseData(url);

  const hasCursor = responseData['history.cursor'];
  if (!hasCursor) return responseData;

  const historyData = responseData.history.data;
  if (!historyData.length) return [];

  const { columns, data } = responseData['history.cursor'];

  const urlObject = new URL(url);

  const dataWithColumns = addColumnNamesToData(data, columns)[0];
  const nextStart = parseInt(dataWithColumns.INDEX) + parseInt(dataWithColumns.PAGESIZE);

  urlObject.searchParams.set('start', nextStart.toString());

  const nextUrl = urlObject.toString();

  await debug_log(EXECUTION_LOG_FILEPATH, '[compare_stocks] parseRecursiveOneCursorHistoryUrl.', {
    data: { nextStart }
  });

  /**
   * Do not DDOS
   */
  await sleep(340);

  const nextResponseData = await parseRecursiveOneCursorHistoryUrl(nextUrl);

  return [].concat(responseData, nextResponseData);
};

/**
 * Отправляет ajax-запрос по заданному адресу и в случае нахождения в ответе поля 'cursor' - отправляет последующий запрос со смещением
 */
export const getAxiosResponseHistoryDataWithCursor = async (url: string) => {
  const responseData = await parseRecursiveOneCursorHistoryUrl(url);

  const mergedResponseData = responseData.reduce((result, responseDataItem) => {
    if (!result.history.columns.length) {
      result.history.columns = responseDataItem.history.columns;
    }

    result.history.data.push(...responseDataItem.history.data);

    return result;
  }, { history: { columns: [], data: [] } });

  return mergedResponseData;
};

/**
 * Добавляет названия колонок 'columns' в массив с объектами 'data'
 */
export const addColumnNamesToData = (data, columns) => {
  return data.map(item => {
    return item.reduce((result, itemValue, index) => {
      result[columns[index]] = itemValue;
      return result;
    }, {});
  });
};

/**
 * Добавляет поле с процентным изменением цены в объект
 */
export const addPercentageDiffField = (stocksData) => {
  return stocksData.map(stocksDataItem => {
    const percentageDiff = getPercentageDiff(stocksDataItem.OPEN, stocksDataItem.LAST);

    return {
      ...stocksDataItem,
      _PERCENTAGE_DIFF: percentageDiff,
    };
  });
};

/**
 * Сортируем по убыванию изменения процентов
 */
export const sortStocksDataByPercentageDiff = (stocksData) => {
  const sortedStocksData = stocksData.sort((firstItem, secondItem) => secondItem._PERCENTAGE_DIFF - firstItem._PERCENTAGE_DIFF);

  return sortedStocksData;
};

/**
 * Фильтрует результаты, оставляем только по необходимым тикерам
 */
export const filterStocksData = (stocksData, market: StocksDataInput['market']) => {
  let REQUIRED_TICKERS;

  switch (market) {
    case 'RUS':
      REQUIRED_TICKERS = REQUIRED_API_TICKERS_RUS;
      break;

    case 'FOREIGN':
      REQUIRED_TICKERS = REQUIRED_API_TICKERS_FOREIGN;
      break;

    case 'FUNDS':
      REQUIRED_TICKERS = [...REQUIRED_API_TICKERS_FUNDS_TPLUS, ...REQUIRED_API_TICKERS_FUNDS_TPLUS_USD];
      break;
  }

  return [...stocksData].filter(stocksDataItem => REQUIRED_TICKERS.includes(stocksDataItem.SECID));
};

/**
 * Добавляет текущие значения цены акций из массива с сегодняшними ценами
 */
const addLastValueToData = (stocksData, stocksDataOneDay) => {
  const stocksDataCloned = [...stocksData];

  return stocksDataCloned.reduce((result, stocksItem) => {
    const lastValue = stocksDataOneDay.find(({ SECID }) => SECID === stocksItem.SECID).LAST;

    result.push({
      ...stocksItem,
      LAST: lastValue,
    });

    return result;
  }, []);
};