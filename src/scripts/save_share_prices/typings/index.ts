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
  'PHOR';

export type IAvaliableTickerNameForForeignMarket =
  'SPCE-RM' |
  'AAPL-RM' |
  'T-RM' |
  'CSCO-RM' |
  'KO-RM' |
  'XOM-RM' |
  'VZ-RM';

export type IAvaliableTickerName = IAvaliableTickerNameForRussianMarket | IAvaliableTickerNameForForeignMarket;

export type IRecievedFieldsFromApi =
  'SECID' |
  'TIME' |
  'LAST';

export type IRecievedFieldsFromApiSequrence = ['SECID', 'TIME', 'LAST'];
export type IRecievedFieldsFromApiSequrenceWithCustomFields = ['SECID', 'TIME', 'LAST', 'UNIX_TIME'];

export type IAvaliableTickerTime = string;
export type IAvaliableTickerValue = number;
export type IAvaliableTickerUnixTime = number;

export type IStocksReponseMarketItem = [
  IAvaliableTickerName,
  IAvaliableTickerTime,
  IAvaliableTickerValue,
];

export type IStocksMarketItemObject = {
  SECID: IAvaliableTickerName,
  TIME: IAvaliableTickerTime,
  LAST: IAvaliableTickerValue,
  UNIX_TIME: IAvaliableTickerUnixTime,
}

export type IStocksResponseMarketData = {
  columns: IRecievedFieldsFromApiSequrence | IRecievedFieldsFromApiSequrenceWithCustomFields,
  data: IStocksReponseMarketItem,
};