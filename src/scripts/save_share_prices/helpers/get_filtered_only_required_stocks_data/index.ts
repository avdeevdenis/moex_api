import { debug_log } from '../../../../project_helpers/debug_log';
import { ALL_REQUIRED_TICKER_NAMES, SAVE_SHARE_PRICES_TODAY_LOG_PATH } from '../../common_params';
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
export const getFilteredOnlyRequiredStocksData = async (stocksData: IStocksResponseMarketData, stocksForeignData: IStocksResponseMarketData) => {
  /**
   * Создаем объекты с ключами в виде тикеров для облегчения дальнейшей обработки
   */
  const responseDataObject = Object.assign(
    {},
    arrayToObject(stocksData.data),
    arrayToObject(stocksForeignData.data)
  );

  const noFoundTickers = [];

  const filteredTickersData = ALL_REQUIRED_TICKER_NAMES
    .reduce((result: IStocksReponseMarketItem[], tickerName) => {
      const item = responseDataObject[tickerName];

      // Проверяем что нет тикеров, по которым не нашли информацию
      if (item) {
        result.push(item);
      } else {
        noFoundTickers.push(item);
      }

      return result;
    }, [] as IStocksReponseMarketItem[]);

  if (noFoundTickers.length) {
    await Promise.all([...noFoundTickers.map(noFoundTicker => {
      return debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, `[save_share_prices] Nothing found for ticker '${noFoundTicker}'`);
    })])
  }

  return filteredTickersData;
};