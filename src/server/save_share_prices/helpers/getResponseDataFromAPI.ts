import axios from 'axios';
import { debug } from '../../helpers/debug';
import { GET_MOEX_API_URL_WITH_PARAMS, MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST, MOEX_API_STOCKS_SECURITIES_HOST } from '../stocks_common_params';
import { IRecievedFieldsFromApiSequrence } from '../stocks_common_typings';

/**
 * Отправляет GET-запроc в MOEX API и получаем ответ по бумагам Российских эмитентов и второй запрос - зарубежных
 */
export const getResponseDataFromAPI = async () => {
  debug('🔹 1. Get response from API start.');

  const stocksUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_STOCKS_SECURITIES_HOST);
  const stocksForeignUrl = GET_MOEX_API_URL_WITH_PARAMS(MOEX_API_FOREIGN_STOCKS_SECURITIES_HOST)

  const [stocksResponse, stocksForeignResponse] = await Promise.all([axios.get(stocksUrl), axios.get(stocksForeignUrl)]);

  debug('🔹 2. Get response from API ok.');

  const stocksResponseData = stocksResponse.data.marketdata;
  const stocksForeignResponseData = stocksForeignResponse.data.marketdata;
  const columns: IRecievedFieldsFromApiSequrence = stocksResponseData.columns || stocksForeignResponseData.columns;

  return {
    stocksResponseData,
    stocksForeignResponseData,
    columns,
  };
};