import { getPercentageDiff } from '../../../check_difference_in_share_prices/helpers/get_percentage_diff';
import { IAvaliableTickerName, IStocksSavedToFileObjectItem, StocksFileDataJSON } from '../../../save_share_prices/typings';

/**
 * Ограничиваем количество выводимых в результате элементов (с прибылью и с убытком отдельно)
 */
const RESPONSE_ITEMS_LIMIT = 5;

/**
 * Формирует итоговые данные, по которым будет отрисована таблица с топ-изменений за день
 */
export const getOneDayChangesTableData = (fileDataJson: StocksFileDataJSON) => {
  /**
   * Оставляем только те данные, где есть два временных промежутка
   */
  const noEmptyFileDataKeys = Object.keys(fileDataJson).filter(tickerName => {
    return fileDataJson[tickerName].values.length == 2;
  });

  /**
   * Сортируем названия тикеров в таком порядке - сначала с наибольшей разницей в стоимости в плюс,
   * в конце - с наибольшей разницей в минус
   */
  const sortedTickerNames = noEmptyFileDataKeys.sort((firstTickerName: IAvaliableTickerName, secondTickerName: IAvaliableTickerName) => {
    const firstTikerValues = fileDataJson[firstTickerName].values;
    
    const [{ PRICE: firstTikerStartPrice }, { PRICE: firstTikerLastPrice }] = firstTikerValues;
    const firstTickerPriceDiff = getPercentageDiff(firstTikerStartPrice, firstTikerLastPrice);

    const [{ PRICE: secondTickerStartPrice }, { PRICE: secondTickerLastPrice }] = fileDataJson[secondTickerName].values;
    const secondTickerPriceDiff = getPercentageDiff(secondTickerStartPrice, secondTickerLastPrice);

    return secondTickerPriceDiff - firstTickerPriceDiff;
  }) as IAvaliableTickerName[];

  /**
   * Получаем тикеры с максимальным ростом и максимальным падением
   */
  let tickersWithHighestGrowthRate = sortedTickerNames.slice(0, RESPONSE_ITEMS_LIMIT);
  let tickersWithHighestNegativeGrowthRate = sortedTickerNames.slice(sortedTickerNames.length - RESPONSE_ITEMS_LIMIT).reverse();

  /**
   * Проверяем что в числе тикеров с максимальным ростом и максимальным падением находятся действиетльно таковые
   */
  tickersWithHighestGrowthRate = tickersWithHighestGrowthRate.filter(tickerName => {
    const [{ PRICE: startPrice }, { PRICE: lastPrice }] = fileDataJson[tickerName].values as IStocksSavedToFileObjectItem[];

    const percentageDiff = getPercentageDiff(startPrice, lastPrice);

    return percentageDiff > 0;
  });

  tickersWithHighestNegativeGrowthRate = tickersWithHighestNegativeGrowthRate.filter(tickerName => {
    const [{ PRICE: startPrice }, { PRICE: lastPrice }] = fileDataJson[tickerName].values as IStocksSavedToFileObjectItem[];

    const percentageDiff = getPercentageDiff(startPrice, lastPrice);

    return percentageDiff < 0;
  });

  if (!tickersWithHighestGrowthRate.length && !tickersWithHighestNegativeGrowthRate) return;

  /**
   * Добавляем информацию про разницу в стоимости к названию
   */
  const tickersDataWithHighestGrowthRate = tickersWithHighestGrowthRate.map(tickerName => {
    const [{ PRICE: startPrice }, { PRICE: lastPrice }] = fileDataJson[tickerName].values as IStocksSavedToFileObjectItem[];

    const percentageDiff = getPercentageDiff(startPrice, lastPrice);

    return {
      tickerName,
      percentageDiff: '+' + percentageDiff + '%',
      direction: 'up'
    };
  });

  const tickersDataWithHighestNegativeGrowthRate = tickersWithHighestNegativeGrowthRate.map(tickerName => {
    const [{ PRICE: startPrice }, { PRICE: lastPrice }] = fileDataJson[tickerName].values as IStocksSavedToFileObjectItem[];

    const percentageDiff = getPercentageDiff(startPrice, lastPrice);

    return {
      tickerName,
      percentageDiff: percentageDiff.toString() + '%',
      direction: 'down'
    };
  });

  const allTickersData = [...tickersDataWithHighestGrowthRate, ...tickersDataWithHighestNegativeGrowthRate];

  return allTickersData as OneDayChangesData[];
};

export type OneDayChangesData = {
  tickerName: IAvaliableTickerName;
  percentageDiff: string;
  direction: 'up' | 'down';
};