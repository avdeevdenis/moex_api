import axios from 'axios';
import { debug_log } from '../../../../project_helpers/debug_log';
import {
  GET_MOEX_API_URL_WITH_PARAMS,
  MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST,
  MOEX_API_FUND_STOCKS_SECURITIES_HOST,
  MOEX_API_STOCKS_SECURITIES_HOST,
  SAVE_SHARE_PRICES_TODAY_LOG_PATH
} from '../../common_params';
import { IRecievedFieldsFromApiSequrence } from '../../typings';

/**
 * Отправляет GET-запроc в MOEX API и получаем ответ по бумагам Российских эмитентов и второй запрос - зарубежных
 */
export const getResponseDataFromAPI = async () => {
  await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] getResponseDataFromAPI start.');

  const stocksUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_STOCKS_SECURITIES_HOST);
  const stocksForeignUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST);
  const stocksFundsUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_FUND_STOCKS_SECURITIES_HOST);

  const [stocksResponse, stocksForeignResponse, stocksFundsResponse] = await Promise.all([
    axios.get(stocksUrl),
    axios.get(stocksForeignUrl),
    axios.get(stocksFundsUrl)
  ]);

  await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] getResponseDataFromAPI ok.');

  const stocksResponseData = (
    stocksResponse &&
    stocksResponse.data &&
    stocksResponse.data.marketdata
  );

  const stocksForeignResponseData = (
    stocksForeignResponse &&
    stocksForeignResponse.data &&
    stocksForeignResponse.data.marketdata
  );

  const stocksFundsResponseData = (
    stocksFundsResponse &&
    stocksFundsResponse.data &&
    stocksFundsResponse.data.marketdata
  )

  const columns: IRecievedFieldsFromApiSequrence = (
    stocksResponseData && stocksResponseData.columns ||
    stocksForeignResponseData && stocksForeignResponseData.columns ||
    stocksFundsResponseData && stocksFundsResponseData.columns
  );

  if (!stocksResponseData || !stocksForeignResponseData || !stocksFundsResponseData || !columns) {
    await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] getResponseDataFromAPI invalid response from API.');
    return;
  }

  return {
    stocksResponseData,
    stocksFundsResponseData,
    stocksForeignResponseData,
    columns,
  };
};