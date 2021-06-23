import * as fs from 'fs';
import { StocksChangesItem } from '../..';
import { debug_log } from '../../../../project_helpers/debug_log';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, GET_STOCK_PRICES_TODAY_PATH, REQUIRED_TICKERS_FOR_FOREIGN_COMPANIES, REQUIRED_TICKERS_FOR_FUNDS, REQUIRED_TICKERS_FOR_RUSSIAN_COMPANIES } from '../../../save_share_prices/common_params';
import { IAvaliableTickerName, IAvaliableTickerNameForForeignMarket, IAvaliableTickerNameForFundMarket, IAvaliableTickerNameForRussianMarket, IStocksSavedToFileObjectItem, StocksFileDataJSON } from '../../../save_share_prices/typings';
import { getPercentageDiff } from '../get_percentage_diff';

/**
 * Значение в процентах (от 1 до 99), при превышении которого (в обе стороны) в течение дня считаем что котировки ценной бумаги выросли/упали
 * ⚠️ Для акций
 */
export const SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY_FOR_STOCKS = 4.0;

/**
 * Значение в процентах (от 1 до 99), при превышении которого (в обе стороны) в течение дня считаем что котировки ценной бумаги выросли/упали
 * ⚠️ Для фондов
 */
export const SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY_FOR_FUNDS = 2.5;

export type TickerInfo = {
  values: IStocksSavedToFileObjectItem[],
  wasNotificationSended?: boolean,
};

const isFund = (tickerName: IAvaliableTickerNameForFundMarket) => {
  return REQUIRED_TICKERS_FOR_FUNDS.includes(tickerName);
};

const isStock = (tickerName: IAvaliableTickerNameForRussianMarket | IAvaliableTickerNameForForeignMarket) => {
  const allStockTikers = [...REQUIRED_TICKERS_FOR_RUSSIAN_COMPANIES, ...REQUIRED_TICKERS_FOR_FOREIGN_COMPANIES];

  return allStockTikers.includes(tickerName);
};

export const getSignificantPercentageDifferencePerDay = (tickerName: IAvaliableTickerName) => {
  if (isFund(tickerName as IAvaliableTickerNameForFundMarket)) {
    return SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY_FOR_FUNDS;
  }

  if (isStock(tickerName as IAvaliableTickerNameForRussianMarket | IAvaliableTickerNameForForeignMarket)) {
    return SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY_FOR_STOCKS;
  }

  debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), `[check_difference_in_share_prices] getSignificantPercentageDifferencePerDay no correct significant percentage difference for '${tickerName}'`);
};

const checkDayChangesForOneTicker = (tickerName: IAvaliableTickerName, tickerInfo: TickerInfo) => {
  const { values: tickerData, wasNotificationSended } = tickerInfo;

  // Отсекаем сразу тикеры, оповещения об изменении которых уже были отправлены ранее
  if (wasNotificationSended) return;

  const firstData = tickerData[0];
  const recentData = tickerData[tickerData.length - 1];

  if (!firstData || !recentData) return;

  const firstDataValue = firstData.PRICE;
  const recentDataValue = recentData.PRICE;

  const stockPercentageDiff = getPercentageDiff(firstDataValue, recentDataValue);

  if (!firstData.PRICE || !recentData.PRICE) return;

  /**
   * Выбираем в качестве целевого разные значения, т.к. акции более волатильны, чем фонды
   */
  const SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY = getSignificantPercentageDifferencePerDay(tickerName);

  /**
   * Рост/падение котировки превышает целевое значение
   */
  const isSignificantValue = Math.abs(stockPercentageDiff) - SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY >= 0;

  if (isSignificantValue) {
    debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] checkDayChangesForOneTicker firstData=' + JSON.stringify(firstData) + ' recentData=' + JSON.stringify(recentData));
  }

  return {
    tickerName,
    isSignificantValue,
    stockPercentageDiff,
    updateTimeFirst: firstData.UPDATED_TIME,
    updateTimeRecent: recentData.UPDATED_TIME
  };
};

export const getChangesFromDayStart: () => Promise<StocksChangesItem[]> = async () => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), `[check_difference_in_share_prices] getChangesFromDayStart start from file '${GET_STOCK_PRICES_TODAY_PATH()}'.`);

  let fileData;

  try {
    fileData = await fs.readFileSync(GET_STOCK_PRICES_TODAY_PATH(), { encoding: 'utf8' });
  } catch (error) {
    await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] getChangesFromDayStart readFileSync error.' + error.message, {
      isError: true
    });
  }

  let fileDataJSON: StocksFileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] getChangesFromDayStart JSON.parse error.' + error.message, {
      isError: true
    });
  }

  if (!fileDataJSON) return;

  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] getChangesFromDayStart ok.');

  const percentageDiffData = Object.keys(fileDataJSON).map((tickerName: IAvaliableTickerName) => {
    return checkDayChangesForOneTicker(tickerName, fileDataJSON[tickerName]);
  });

  /**
   * Оставляем только значения, превышающие целевые (в меньшую или большую сторону)
   */
  const significantDiffData = percentageDiffData.filter(percentageDiffItem => percentageDiffItem && percentageDiffItem.isSignificantValue);

  if (!significantDiffData.length) return;

  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] getChangesFromDayStart significantDiffData has.');

  return significantDiffData;
};
