import { STOCKS_COLUMNS_ORDER } from '../../common_params';
import { IStocksPreparedMarketDataObject, IStocksReponseMarketItem } from '../../typings';

export const getRequiredStocksDataWithColumnNames = (stocksData: IStocksReponseMarketItem[]) => {
  const stocksDataWithColumns: IStocksPreparedMarketDataObject[] = stocksData.map(tickerData => {
    const dataWithColumns = STOCKS_COLUMNS_ORDER.reduce((result: any, columnName, index) => {
      result[columnName] = tickerData[index];

      return result;
    }, {} as IStocksPreparedMarketDataObject);

    return dataWithColumns;
  });

  return stocksDataWithColumns;
}