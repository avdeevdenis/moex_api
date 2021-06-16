import { debug_log } from '../../../../project_helpers/debug_log';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH } from '../../../save_share_prices/common_params';
import { saveNotificationStateToStocksDataFile } from '../save_notification_state_to_stocks_data_file';
import { sendDayChangesNotification } from '../send_day_changes_notification';

/**
 * Если есть хоть какие-нибудь отклонения на графиках (с начала дня, недели, за неделю суммарно), тогда
 * отправляет оповещения в телеграме о росте котировок
 */
// TODO ADD WEEKLY AND MONTHLY
export const sendChangesToTelegramNotification = async ({ dayStartChanges }) => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] sendChangesToTelegramNotification start.');

  const hasDayStartChanges = dayStartChanges && dayStartChanges.length;

  if (hasDayStartChanges) {
    // Отправляем оповещения в телеграме
    await sendDayChangesNotification(dayStartChanges);

    await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] sendDayChangesNotification end.');

    // Записываем флаг в файл с котировками, чтобы не отправлять эти оповещения повторно
    await saveNotificationStateToStocksDataFile(dayStartChanges);
  }
};