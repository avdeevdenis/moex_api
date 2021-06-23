import check_difference_in_share_prices from '../scripts/check_difference_in_share_prices';
import check_one_day_diff_once from '../scripts/check_one_day_diff_once';
import save_share_prices from '../scripts/save_share_prices';

import { saveCronLaunch } from './helpers';

const cron = require('node-cron');

// Оставляем для тестирования
// const DAILY_REPEAT_INTERVALS = '*/5 * * * * *';
const DAILY_REPEAT_INTERVALS = '*/5 4-20 * * 1-5';

/**
 * Время работы cron-скрипта  - каждые 5 минут с 7:00 до 23:00 пт-пт включительно
 * (важно не забыть UTC+3)
 */
cron.schedule(DAILY_REPEAT_INTERVALS, async () => {
  /**
   * 1. Последовательность важна! Сначала запускам скрипт сохранения
   */
  await save_share_prices();

  /**
   * 2. Последовательность важна! Затем запускам скрипт сравнения
   */
  await check_difference_in_share_prices();

  /**
   * Сохраняем запуск крона для мониторинга
   */
  await saveCronLaunch('SAVE_SHARE_PRICES_AND_CHECK_DIFFERENCT_IN_SHARE_PRICES');
});

/**
 * Запускам отправку статистики за текущий день один раз в день (в 23:00 каждый рабочий день)
 */
const ONLY_EVENING_REPEAT_INTERVAL = '0 20 * * 1-5';

cron.schedule(ONLY_EVENING_REPEAT_INTERVAL, async () => {
  await check_one_day_diff_once();

  /**
   * Сохраняем запуск крона для мониторинга
   */
  await saveCronLaunch('CHECK_ONE_DAY_DIFF_ONCE');
});