/**
 * Здесь хранятся конфигурации общих параметров для запросов/обработки акций
 */
import { getStockPricesTodayFileName } from './helpers/getStockPricesTodayFileName';
import {
  IAvaliableTickerName,
  IAvaliableTickerNameForForeignMarket,
  IAvaliableTickerNameForRussianMarket,
  IRecievedFieldsFromApiSequrence,
} from './stocks_common_typings';

/**
 * Корневая папка со всеми данными
 */
export const SERVER_DIR = 'src/data';

/**
 * Папка, где хранятся данные про акции в разбивке по дням
 */
export const STOCK_PRICES_BY_DATE_DATA_DIR_NAME = SERVER_DIR + '/stocks_prices_by_date_data';

/**
 * Файл с данными про акции по конкретному дню (вида DD_MM_YYYY)
 */
export const STOCK_PRICES_TODAY_FILE_NAME = getStockPricesTodayFileName() + '.json';

/**
 * Полный путь к файлу про акции по конкретному дню
 */
export const STOCK_PRICES_TODAY_PATH = STOCK_PRICES_BY_DATE_DATA_DIR_NAME + '/' + STOCK_PRICES_TODAY_FILE_NAME;

/**
 * Возвращает информацию о всех тикерах на Московской бирже
 */
export const MOEX_API_STOCKS_SECURITIES_HOST = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json';

/**
 * Возвращает информацию о всех тикерах зарубежных компаний
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
export const GET_MOEX_API_URL_WITH_PARAMS = (host: typeof MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST | typeof MOEX_API_STOCKS_SECURITIES_HOST) => {
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
  'POLY',
  'SBER',
  'CHMF',
  'PHOR',
];

export const ALL_REQUIRED_TICKER_NAMES: IAvaliableTickerName[] = [
  ...REQUIRED_TICKERS_FOR_RUSSIAN_COMPANIES,
  ...REQUIRED_TICKERS_FOR_FOREIGN_COMPANIES
];