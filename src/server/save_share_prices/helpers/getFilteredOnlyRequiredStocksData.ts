import {
  ALL_REQUIRED_TICKER_NAMES,
} from '../stocks_common_params';
import { IStocksReponseMarketItem, IStocksResponseMarketData } from '../stocks_common_typings';

import { arrayToObject } from './arrayToObject';

// Фильтруем из всех бумаг только те, информацию по которым получить необходимо
export const getFilteredOnlyRequiredStocksData = (stocksData: IStocksResponseMarketData, stocksForeignData: IStocksResponseMarketData) => {
  const responseDataObject = Object.assign(
    {},
    arrayToObject(stocksData.data),
    arrayToObject(stocksForeignData.data)
  );

  const filteredTickersData = ALL_REQUIRED_TICKER_NAMES
    .reduce((result: IStocksReponseMarketItem[], tickerName) => {
      const item = responseDataObject[tickerName];

      // Проверяем что нет тикеров, по которым не нашли информацию
      if (item) {
        result.push(item);
      } else {
        console.error(`🐥 Nothing found for ticker '${tickerName}'`)
      }

      return result;
    }, [] as IStocksReponseMarketItem[]);

  return filteredTickersData;
};