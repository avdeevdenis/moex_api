import { debug } from '../../helpers/debug';
import { getCompanyNameByTicker } from '../../helpers/getCompanyNameByTicker';
import { sendTelegramMessage } from '../../helpers/sendTelegramMessage';
import { SIGNIFICANT_PERCENTAGE_DIFFERENCE_PER_DAY } from './getChangesFromDayStart';

export const sendDayChangesNotification = async (changesData) => {
  debug('🔹 5. Send day changes notification start.');

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

  const sendTelegramMessagePromises = changeMessagesForTelegram.map(sendTelegramMessage);

  return Promise.all([...sendTelegramMessagePromises]);
};