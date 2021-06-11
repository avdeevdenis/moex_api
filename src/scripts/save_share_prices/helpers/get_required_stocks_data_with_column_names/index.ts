import { IRecievedFieldsFromApiSequrence, IStocksMarketItemObject, IStocksReponseMarketItem } from '../../typings';
import { getUnixTimeFromDateString } from '../get_unix_time_from_date_string';

export const getRequiredStocksDataWithColumnNames = (stocksData: IStocksReponseMarketItem[], columns: IRecievedFieldsFromApiSequrence) => {
  const stocksDataWithColumns: IStocksMarketItemObject[] = stocksData.map(tickerData => {
    const dataWithColumns = columns.reduce((result: any, columnName, index) => {
      result[columnName] = tickerData[index];

      return result;
    }, {} as IStocksMarketItemObject);

    // Обогащаем объект TIMESTAMP'ом
    dataWithColumns.UNIX_TIME = getUnixTimeFromDateString(dataWithColumns.TIME);

    return dataWithColumns;
  });

  return stocksDataWithColumns;
}