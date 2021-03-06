import * as fs from 'fs';
import { debug_console } from '../project_helpers/debug_console';

const { DateTime } = require('luxon');

/**
 * Просто записываем в файл сам факт запуска крона
 */
export const saveCronLaunch = (message: string) => {
  const now = DateTime.now().setZone('Europe/Moscow').toString();
  const appendData = `\n[${now}] [cron_script] launch ${message}.`;

  fs.appendFile('src/logs/cron_launches.txt', appendData, (err: Error) => {
    if (err) {
      debug_console('saveCronLaunch error.' + err.message);
      return;
    }
  });
};