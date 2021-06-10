/**
 * Если есть хоть какие-нибудь отклонения на графиках (с начала дня, недели, за неделю суммарно), тогда
 * отправляет оповещения в телеграме о росте котировок
 */
import { debug } from '../../helpers/debug';
import { saveNotificationStateToStocksDataFile } from './saveNotificationStateToStocksDataFile';
import { sendDayChangesNotification } from './sendDayChangesNotification';

// TODO ADD WEEKLY AND MONTHLY
export const sendChangesTelegramNotification = async ({ dayStartChanges }) => {
  debug('🔹 4. Save changes telegram notification start.');

  const hasDayStartChanges = dayStartChanges && dayStartChanges.length;

  if (hasDayStartChanges) {
    // Отправляем оповещения в телеграме
    await sendDayChangesNotification(dayStartChanges);

    // Записываем флаг в файл с котировками, чтобы не отправлять эти оповещения повторно
    await saveNotificationStateToStocksDataFile(dayStartChanges);
  }
};