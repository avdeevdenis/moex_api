import { debug_log } from '../../../../project_helpers/debug_log';
import { getCompanyNameByTicker } from '../../../../project_helpers/get_company_name_by_ticker';
import { sendTelegramMessage } from '../../../../project_helpers/send_telegram_message';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH } from '../../../save_share_prices/common_params';
import { SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY } from '../get_changes_from_day_start';

export const sendDayChangesNotification = async (changesData) => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] sendDayChangesNotification start.');

  let messageTemplate = (tickerName, changeAction, changeValue, sticker) => {
    const companyName = getCompanyNameByTicker(tickerName);
    const ticker = companyName ? `(${tickerName})` : tickerName;

    /**
     * For example:
     *
     * #alert
     * 🍏 Yandex N.V (YNDX) > 5% (7.3%) ↑ from the beginning of the day.
     */
    return `#alert\n${sticker} *${companyName} ${ticker} ${changeValue} ${changeAction}* from the beginning of the day.`;
  }

  const changeMessagesForTelegram = changesData.map(changeData => {
    const { tickerName, stockPercentageDiff } = changeData;

    const isPositiveDiff = stockPercentageDiff > 0;

    const changeAction = isPositiveDiff ? '↑' : '↓';
    const changeValue = ` > ${SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY}% (${stockPercentageDiff}%)`;
    const sticker = isPositiveDiff ? '🍏' : '🍎';

    return messageTemplate(tickerName, changeAction, changeValue, sticker);
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