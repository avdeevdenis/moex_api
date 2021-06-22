import { StocksChangesItem } from '../..';
import { debug_log } from '../../../../project_helpers/debug_log';
import { getCompanyNameByTicker } from '../../../../project_helpers/get_company_name_by_ticker';
import { sendTelegramMessage } from '../../../../project_helpers/send_telegram_message';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH } from '../../../save_share_prices/common_params';
import { SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY } from '../get_changes_from_day_start';

/**
 * Приходит время в формате 12:30:25
 * Возвращает время в формате 12:30
 */
const getTimeWithoutSeconds = (time: string) => {
  const splitedTime = time.split(':');

  splitedTime.pop();

  return splitedTime.join(':');
};

export const sendDayChangesNotification = async (changesData: StocksChangesItem[]) => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] sendDayChangesNotification start.');

  let messageTemplate = (tickerName, changeAction, changeValue, sticker, updateTimeFirst, updateTimeRecent) => {
    const companyName = getCompanyNameByTicker(tickerName);
    const ticker = companyName ? `(${tickerName})` : tickerName;

    const updateTimeDiff = `\nFrom *${getTimeWithoutSeconds(updateTimeFirst)}* to *${getTimeWithoutSeconds(updateTimeRecent)}*.`;

    /**
     * Если название компании SPCE-RM - тогда оставляем только SPCE
     */
    const hashtag = tickerName.includes('-') ? `\n#${tickerName.split('-')[0]}` : `\n#${tickerName}`;

    /**
     * For example:
     *
     * 🍏 Yandex N.V (YNDX) > 5% (7.3%) ↑
     * From 12:20 to 12:40
     * #YNDX
     */
    return `${sticker} *${companyName} ${ticker} ${changeValue} ${changeAction}* ${updateTimeDiff}${hashtag}`;
  }

  const changeMessagesForTelegram = changesData.map(changeData => {
    const { tickerName, stockPercentageDiff, updateTimeFirst, updateTimeRecent } = changeData;

    const isPositiveDiff = stockPercentageDiff > 0;

    const changeAction = isPositiveDiff ? '↑' : '↓';
    const changeValue = ` > ${SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY}% (${stockPercentageDiff}%)`;
    const sticker = isPositiveDiff ? '🍏' : '🍎';

    return messageTemplate(tickerName, changeAction, changeValue, sticker, updateTimeFirst, updateTimeRecent);
  });

  const sendTelegramMessagePromises = changeMessagesForTelegram
    .map(changeMessage => sendTelegramMessage(
      changeMessage,
      async (messageText) => {
        await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), `[check_difference_in_share_prices] sendTelegramMessage. ${messageText}`);
      }
    ));

  return Promise.all([...sendTelegramMessagePromises]);
};