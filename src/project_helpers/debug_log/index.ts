import { appendFile } from 'fs';
import { createFileIfNotExists } from '../create_file_if_not_exists';
import { debug_console } from '../debug_console';

const { DateTime } = require('luxon');

/**
 * Метод записывает входящие данные 'logData' в файл с названием 'logFilePath'
 * Если файла не существует - создает по пути
 */
type DebugLogOptions = {
  /**
   * Если первое сообщение в логах - выставляем delimiter
   */
  isFirstLogMessage: boolean;
};

export const debug_log = async (logFilePath: string, logData: string, options?: DebugLogOptions) => {
  const isCorrectLogData = (
    logData &&
    typeof logData === 'string'
  );

  if (!isCorrectLogData) {
    debug_console(`Invalid logData '${logData}' to file '${logFilePath}'`);
    return;
  }

  const isCorrectLogFilePath = (
    logFilePath &&
    typeof logFilePath === 'string'
  );

  if (!isCorrectLogFilePath) {
    debug_console(`Invalid logFilePath '${logFilePath}'`);
    return;
  }

  await createFileIfNotExists(logFilePath);

  debug_console(logData);

  return new Promise(resolve => {
    const preparedLogData = prepareLogData(logData, options);

    appendFile(logFilePath, preparedLogData, (error: Error) => {
      if (error) {
        debug_console('debug_log appendFile error', error.message);
        resolve(false);
      }

      resolve(true);
    });
  });
};

/**
 * Обогащаем сообщение, добавляем к нему:
 * - перенос на новую строку
 * - UNIX_TIMESTAMP
 */
export const prepareLogData = (logData: string, options?: DebugLogOptions) => {
  const isFirstLogMessage = options && options.isFirstLogMessage;

  /**
   * Если первое сообщение в логах - выставляем delimiter
   */
  const newLine = isFirstLogMessage ? '\n\n' : '\n';

  const now = DateTime.now().setZone('Europe/Moscow').toISOTime();

  return newLine + `[${now}] ` + logData;
};