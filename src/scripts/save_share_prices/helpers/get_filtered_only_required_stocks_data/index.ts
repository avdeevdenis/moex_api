import { debug_log } from '../../../../project_helpers/debug_log';
import { ALL_REQUIRED_TICKER_NAMES, GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH } from '../../common_params';
import { IStocksReponseMarketItem, IStocksResponseMarketData } from '../../typings';

const arrayToObject = (array) => {
  return array.reduce((result, item) => {
    result[item[0]] = item;

    return result;
  }, {});
}

/**
 * Фильтруем из всех бумаг только те, информацию по которым получить необходимо
 */
export const getFilteredOnlyRequiredStocksData = async ({
  stocksResponseData,
  stocksForeignResponseData,
  stocksFundsResponseData,
}: {
  stocksResponseData: IStocksResponseMarketData
  stocksForeignResponseData: IStocksResponseMarketData,
  stocksFundsResponseData: IStocksResponseMarketData,
}) => {
  /**
   * Хотим использовать понятные названия, поэтому AAPL-RM преобразуем в AAPL
   */
  const stocksForeignResponseDataPrepared = stocksForeignResponseData.data.map(([tickerName, ...restProps]) => {
    let tickerNamePrepared = '';

    if (tickerName.endsWith('-RM')) {
      tickerNamePrepared = tickerName.split('-RM')[0];
    }

    return [
      tickerNamePrepared,
      ...restProps,
    ];
  });

  /**
   * Создаем объекты с ключами в виде тикеров для облегчения дальнейшей обработки
   */
  const responseDataObject = Object.assign(
    {},
    arrayToObject(stocksResponseData.data),
    arrayToObject(stocksForeignResponseDataPrepared),
    arrayToObject(stocksFundsResponseData.data),
  );

  const noFoundTickers = [];

  const filteredTickersData = ALL_REQUIRED_TICKER_NAMES
    .reduce((result: IStocksReponseMarketItem[], tickerName) => {
      const item = responseDataObject[tickerName];

      // Проверяем что нет тикеров, по которым не нашли информацию
      if (item) {
        result.push(item);
      } else {
        noFoundTickers.push(tickerName);
      }

      return result;
    }, [] as IStocksReponseMarketItem[]);

  if (noFoundTickers.length) {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), `[save_share_prices] Nothing found for tickers '${JSON.stringify(noFoundTickers)}'`);
  }

  return filteredTickersData;
};