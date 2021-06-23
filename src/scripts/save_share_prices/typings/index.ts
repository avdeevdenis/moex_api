export type IAvaliableTickerNameForRussianMarket =
  'YNDX' |
  'VTBR' |
  'ALRS' |
  'GAZP' |
  'MOEX' |
  'NLMK' |
  'POLY' |
  'SBER' |
  'CHMF' |
  'PHOR' |
  'OZON';

export type IAvaliableTickerNameForForeignMarket =
  'SPCE' |
  'AAPL' |
  'T' |
  'CSCO' |
  'KO' |
  'XOM' |
  'VZ';

export type IAvaliableTickerNameForFundMarket =
  'TSPX' |
  'FXDM' |
  'TGLD' |
  'FXGD' |
  'TECH' |
  'TIPO' |
  'TMOS' |
  'TBIO' |
  'FXTP' |
  'FXIM' |
  'FXWO';

export type IAvaliableTickerName = IAvaliableTickerNameForRussianMarket | IAvaliableTickerNameForForeignMarket | IAvaliableTickerNameForFundMarket;

export type IAvaliableTickerUpdatedTime = string;
export type IAvaliableTickerValue = number;

export type IStocksReponseMarketItem = [
  IAvaliableTickerName,
  IAvaliableTickerUpdatedTime,
  IAvaliableTickerValue,
];

export type IStocksMarketItemObject = {
  SECID: IAvaliableTickerName,
  TIME: IAvaliableTickerUpdatedTime,
  LAST: IAvaliableTickerValue,
}

/**
 * Секция 'marketdata' ответа от API MOEX
 */
export type IStocksResponseMarketData = {
  data: IStocksReponseMarketItem[],
};

/**
 * Тип для преобразованных данных по тикерам
 */
export type IStocksPreparedMarketDataObject = {
  TICKER: IAvaliableTickerName,
  UPDATED_TIME: IAvaliableTickerUpdatedTime,
  PRICE: number,
};

/**
 * Тип для преобразованных данных по тикерам, который записывается в файл
 */
 export type IStocksSavedToFileObjectItem = {
  UPDATED_TIME: IAvaliableTickerUpdatedTime,
  PRICE: number,
};