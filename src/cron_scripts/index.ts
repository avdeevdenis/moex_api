import { filterDiffWithAlreadySended, filterOnlySensetivityDiff, getOneDayDiff, getTelegramMessagesWithDiff, sendTelegramMessages } from '../scripts/one_day_compare_stocks';
import save_stocks_picture_and_send_telegram, { StocksDataInput } from '../scripts/save_stocks_picture_and_send_telegram';

import { saveCronLaunch } from './helpers';

const cron = require('node-cron');

// Оставляем для тестирования
// const DAILY_REPEAT_INTERVALS = '*/5 * * * * *';
const DAILY_REPEAT_INTERVALS = '*/5 7-20 * * 1-5';

/**
 * Время работы cron-скрипта  - каждые 5 минут с 10:00 до 23:00 пт-пт включительно
 * (важно не забыть UTC+3)
 */
cron.schedule(DAILY_REPEAT_INTERVALS, async () => {
  const markets = ['RUS', 'FOREIGN', 'FUNDS'] as StocksDataInput['market'][];

  for (let i = 0; i < markets.length; i++) {
    const oneDayDiff = await getOneDayDiff(markets[i]);

    const oneDayDiffSensetivity = filterOnlySensetivityDiff(oneDayDiff);

    const filteredDiff = await filterDiffWithAlreadySended(oneDayDiffSensetivity);

    const telegramMessages = getTelegramMessagesWithDiff(filteredDiff);

    await sendTelegramMessages(telegramMessages);
  }

  await saveCronLaunch('COMPARE_STOCKS');
});

/**
 * Запускам отправку статистики за текущий день один раз в день (в 23:00 каждый рабочий день)
 */
const ONLY_EVENING_REPEAT_INTERVAL = '0 20 * * 1-5';

cron.schedule(ONLY_EVENING_REPEAT_INTERVAL, async () => {
  await save_stocks_picture_and_send_telegram({
    market: 'RUS',
    period: 'DAY'
  });

  await save_stocks_picture_and_send_telegram({
    market: 'FOREIGN',
    period: 'DAY'
  });

  await save_stocks_picture_and_send_telegram({
    market: 'FUNDS',
    period: 'DAY'
  });

  /**
   * Сохраняем запуск крона для мониторинга
   */
  await saveCronLaunch('CHECK_ONE_DAY_DIFF_EVENING');
});

/**
 * Запускам отправку статистики за неделю один раз в субботу в 11:00
 */
const SATURDAY_REPEAT_INTERVAL = '0 8 * * 6';

cron.schedule(SATURDAY_REPEAT_INTERVAL, async () => {
  await save_stocks_picture_and_send_telegram({
    market: 'RUS',
    period: 'WEEK'
  });

  await save_stocks_picture_and_send_telegram({
    market: 'FOREIGN',
    period: 'WEEK'
  });

  await save_stocks_picture_and_send_telegram({
    market: 'FUNDS',
    period: 'WEEK'
  });

  /**
   * Сохраняем запуск крона для мониторинга
   */
  await saveCronLaunch('CHECK_ONE_WEEK_DIFF_EVENING');
});