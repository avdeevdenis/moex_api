import { getStockPricesTodayFileName } from '../helpers/get_stock_prices_today_filename';

import {
  IAvaliableTickerName,
  IAvaliableTickerNameForForeignMarket,
  IAvaliableTickerNameForFundMarket,
  IAvaliableTickerNameForRussianMarket,
  IRecievedFieldsFromApiSequrence,
} from '../typings';

/**
 * Корневая папка со всеми данными
 */
export const SERVER_DIR = 'src/raw_data';

/**
 * Папка, где хранятся данные про акции в разбивке по дням
 */
export const STOCK_PRICES_BY_DATE_DATA_DIR_NAME = SERVER_DIR + '/stocks_prices_by_date_data';

/**
 * Полный путь к файлу про акции по конкретному дню (вида DD_MM_YYYY)
 */
export const GET_STOCK_PRICES_TODAY_PATH = () => {
  return getStockPricesTodayFileName({
    pathStart: STOCK_PRICES_BY_DATE_DATA_DIR_NAME,
    extension: 'json',
  });
};

/**
 * Путь по которому хранятся логи выполнения скрипта 'save_share_prices
 */
export const GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH = () => {
  return getStockPricesTodayFileName({
    pathStart: 'src/logs/save_share_prices',
    extension: 'txt',
  });
};

/**
 * Путь по которому хранятся логи выполнения скрипта 'check_difference_in_share_prices'
 */
export const GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH = () => {
  return getStockPricesTodayFileName({
    pathStart: 'src/logs/check_difference_in_share_prices',
    extension: 'txt',
  });
};

/**
 * Возвращает информацию о всех тикерах акций на Московской бирже
 */
export const MOEX_API_STOCKS_SECURITIES_HOST = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json';

/**
 * Возвращает информацию о всех тикерах фондов на Московской бирже
 */
export const MOEX_API_FUND_STOCKS_SECURITIES_HOST = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQTD/securities.json';

/**
 * Возвращает информацию о всех тикерах акций зарубежных компаний
 */
export const MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST = 'https://iss.moex.com/iss/engines/stock/markets/foreignshares/boards/FQBR/securities.json' as const;

/**
 * Поля, необходимые получить по каждому тикеру
 */
export const REQUIRED_FILEDS_RECIEVED_FROM_API: IRecievedFieldsFromApiSequrence = [
  'SECID',
  'TIME',
  'LAST',
];

/**
 * Возвращает полный URL для запроса в MOEX API за информацией по тикерам
 */
export const GET_MOEX_API_URL_WITH_PARAMS = (host: typeof MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST | typeof MOEX_API_STOCKS_SECURITIES_HOST | typeof MOEX_API_FUND_STOCKS_SECURITIES_HOST) => {
  return host +
    '?iss.meta=off' +
    '&iss.only=marketdata' +
    '&marketdata.columns=' + encodeURIComponent(REQUIRED_FILEDS_RECIEVED_FROM_API.join(','));
};

/**
 * Тикеры зарубежных компаний, информацию по которым хотим получить
 */
export const REQUIRED_TICKERS_FOR_FOREIGN_COMPANIES: IAvaliableTickerNameForForeignMarket[] = [
  'SPCE-RM',
  'AAPL-RM',
  'T-RM',
  'CSCO-RM',
  'KO-RM',
  'XOM-RM',
  'VZ-RM'
];

/**
 * Тикеры Российских компаний, информацию по которым хотим получить
 */
export const REQUIRED_TICKERS_FOR_RUSSIAN_COMPANIES: IAvaliableTickerNameForRussianMarket[] = [
  'YNDX',
  'VTBR',
  'ALRS',
  'GAZP',
  'MOEX',
  'NLMK',
  'OZON',
  'POLY',
  'SBER',
  'CHMF',
  'PHOR',
];

/**
 * Тикеры Фондов, информацию по которым хотим получить
 */
export const REQUIRED_TICKERS_FOR_FUNDS: IAvaliableTickerNameForFundMarket[] = [
  'TSPX',
  'FXDM',
  'TGLD',
  'FXGD',
  'TECH',
  'TIPO',
  'TMOS',
  'TBIO',
  'FXTP',
  'FXIM',
  'FXWO',
];

export const ALL_REQUIRED_TICKER_NAMES: IAvaliableTickerName[] = [
  ...REQUIRED_TICKERS_FOR_RUSSIAN_COMPANIES,
  ...REQUIRED_TICKERS_FOR_FOREIGN_COMPANIES,
  ...REQUIRED_TICKERS_FOR_FUNDS,
];