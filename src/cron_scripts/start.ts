import check_difference_in_share_prices from '../scripts/check_difference_in_share_prices';
import save_share_prices from '../scripts/save_share_prices';
import { saveCronLaunch } from './helpers';

const cron = require('node-cron');

// Оставляем для тестирования
const REPEAT_INTERVALS = '*/5 * * * * *';
// const REPEAT_INTERVALS = '*/5 4-20 * * 1-5';

/**
 * Время работы cron-скрипта  - каждые 5 минут с 7:00 до 23:00 пт-пт включительно
 * (важно не забыть UTC+3)
 */
cron.schedule(REPEAT_INTERVALS, async () => {
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
  await saveCronLaunch();
});