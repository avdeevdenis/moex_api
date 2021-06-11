import { debug_console } from '../project_helpers/debug_console';
import check_difference_in_share_prices from '../scripts/check_difference_in_share_prices';
import save_share_prices from '../scripts/save_share_prices';

const cron = require('node-cron');
const fs = require('fs');
const { DateTime } = require('luxon');

/**
 * Время работы cron-скрипта  - каждые 5 минут с 7:00 до 23:00 пт-пт включительно
 */
// cron.schedule('*/5 * * * * *', async () => {
cron.schedule('*/5 7-23 * * 1-5', async () => {
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

export const saveCronLaunch = () => {
  const now = DateTime.now().setZone('Europe/Moscow').toISOTime();
  const appendData = `\n[${now}] [save_share_prices_and_check_difference_in_share_prices] launch.`;

  fs.appendFile('src/logs/cron_launches/save_share_prices_and_check_difference_in_share_prices.txt', appendData, (err: Error) => {
    if (err) {
      debug_console('saveCronLaunch error.' + err.message);
      return;
    }
  });
};