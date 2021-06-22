import axios from 'axios';
import { debug_log } from '../../../../project_helpers/debug_log';
import {
  GET_MOEX_API_URL_WITH_PARAMS,
  MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST,
  MOEX_API_FUND_STOCKS_SECURITIES_HOST,
  MOEX_API_STOCKS_SECURITIES_HOST,
  GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH,
} from '../../common_params';
import { IStocksResponseMarketData } from '../../typings';

export type IResponseDataFromApi = {
  stocksResponseData: IStocksResponseMarketData,
  stocksFundsResponseData: IStocksResponseMarketData,
  stocksForeignResponseData: IStocksResponseMarketData,
};

/**
 * Отправляет GET-запроc в MOEX API и получаем ответ со всей необходимой информацией
 */
export const getResponseDataFromAPI: () => Promise<IResponseDataFromApi | undefined> = async () => {
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getResponseDataFromAPI start.');

  const stocksUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_STOCKS_SECURITIES_HOST);
  const stocksForeignUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST);
  const stocksFundsUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_FUND_STOCKS_SECURITIES_HOST);

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] stocksUrl=' + stocksUrl);
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] stocksForeignUrl=' + stocksForeignUrl);
  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] stocksFundsUrl=' + stocksFundsUrl);

  const [stocksResponse, stocksForeignResponse, stocksFundsResponse] = await Promise.all([
    axios.get(stocksUrl),
    axios.get(stocksForeignUrl),
    axios.get(stocksFundsUrl)
  ]);

  await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getResponseDataFromAPI ok.');

  const stocksResponseData: IStocksResponseMarketData = (
    stocksResponse &&
    stocksResponse.data &&
    stocksResponse.data.marketdata
  );

  const stocksForeignResponseData: IStocksResponseMarketData = (
    stocksForeignResponse &&
    stocksForeignResponse.data &&
    stocksForeignResponse.data.marketdata
  );

  const stocksFundsResponseData: IStocksResponseMarketData = (
    stocksFundsResponse &&
    stocksFundsResponse.data &&
    stocksFundsResponse.data.marketdata
  );

  const hasRequiredData = (
    stocksResponseData &&
    stocksForeignResponseData &&
    stocksFundsResponseData
  );

  if (!hasRequiredData) {
    await debug_log(GET_SAVE_SHARE_PRICES_TODAY_LOG_PATH(), '[save_share_prices] getResponseDataFromAPI invalid response from API.');
    return;
  }

  return {
    stocksResponseData,
    stocksFundsResponseData,
    stocksForeignResponseData,
  };
};