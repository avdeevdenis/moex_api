import { debug_log } from '../../../../project_helpers/debug_log';
import { CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, STOCK_PRICES_TODAY_PATH } from '../../../save_share_prices/common_params';
import { IAvaliableTickerName } from '../../../save_share_prices/typings';
import { getPercentageDiff } from '../get_percentage_diff';

const fs = require('fs');

/**
 * Значение в процентах (от 1 до 99), при превышении которого (в обе стороны) считаем что котировки ценной бумаги выросли/упали
 */
export const SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY = 3.0;

const checkDayChangesForOneTicker = (tickerName: IAvaliableTickerName, tickerInfo) => {
  const { values: tickerData, wasNotificationSended } = tickerInfo;

  // Отсекаем сразу тикеры, оповещения об изменении которых уже были отправлены ранее
  if (wasNotificationSended) return;

  const firstData = tickerData[0];
  const recentData = tickerData[tickerData.length - 1];

  if (!firstData || !recentData) return;

  const firstDataValue = firstData.LAST;
  const recentDataValue = recentData.LAST;

  const stockPercentageDiff = getPercentageDiff(firstDataValue, recentDataValue);

  /**
   * Рост/падение котировки превышает целевое значение
   */
  const isSignificantValue = Math.abs(stockPercentageDiff) - SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY >= 0;

  return {
    tickerName,
    isSignificantValue,
    stockPercentageDiff,
  };
};

export const getChangesFromDayStart = async () => {
  await debug_log(CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, '[check_difference_in_share_prices] getChangesFromDayStart start.');

  let fileData;

  try {
    fileData = await fs.readFileSync(STOCK_PRICES_TODAY_PATH, { encoding: 'utf8' });
  } catch (error) {
    await debug_log(CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, '[check_difference_in_share_prices] getChangesFromDayStart readFileSync error.' + error.message);
  }

  let fileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    await debug_log(CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, '[check_difference_in_share_prices] getChangesFromDayStart JSON.parse error.' + error.message);
  }

  if (!fileDataJSON) return;

  await debug_log(CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, '[check_difference_in_share_prices] getChangesFromDayStart ok.');

  const percentageDiffData = Object.keys(fileDataJSON).map((tickerName: IAvaliableTickerName) => {
    return checkDayChangesForOneTicker(tickerName, fileDataJSON[tickerName]);
  });

  /**
   * Оставляем только значения, превышающие целевые (в меньшую или большую сторону)
   */
  const significantDiffData = percentageDiffData.filter(percentageDiffItem => percentageDiffItem && percentageDiffItem.isSignificantValue);

  if (!significantDiffData.length) return;

  await debug_log(CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH, '[check_difference_in_share_prices] getChangesFromDayStart significantDiffData has.');

  return significantDiffData;
};
