const cron = require('node-cron');
const fs = require('fs');

import check_difference_in_share_prices from '../server/check_difference_in_share_prices';
import save_share_prices from '../server/save_share_prices';
import { debug } from '../server/helpers/debug';

const saveCronLaunch = () => {
  const now = new Date().toUTCString();
  const appendData = '\n' + now;

  fs.appendFile('src/data/cron_working_test.txt', appendData, function (err) {
    if (err) throw err;

    console.log('Saved!');
  });
};

// Время работы cron-скрипта  - каждые 5 минут с 7:00 до 23:00 пт-пт включительно
cron.schedule('*/5 7-23 * * 1-5', async () => {
  saveCronLaunch();

  debug('running a task every 5 minute');

  /**
   * 1. Последовательность важна! Сначала запускам скрипт сохранения
   */
  await save_share_prices();

  /**
   * 2. Последовательность важна! Затем запускам скрипт сравнения
   */
  await check_difference_in_share_prices();
});