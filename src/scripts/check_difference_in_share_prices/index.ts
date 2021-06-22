// https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
process.env.NTBA_FIX_319 = '1';

require('dotenv').config();

import { debug_log } from '../../project_helpers/debug_log';
import { GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH } from '../save_share_prices/common_params';
import { IAvaliableTickerName } from '../save_share_prices/typings';
import { getChangesFromDayStart } from './helpers/get_changes_from_day_start';
import { sendChangesToTelegramNotification } from './helpers/send_changes_to_telegram_notification';

export type StocksChangesItem = {
  tickerName: IAvaliableTickerName;
  isSignificantValue: boolean;
  stockPercentageDiff: number;
  updateTimeFirst: string;
  updateTimeRecent: string;
}

/**
 * Функциональность следующая - проверяем изменение цены каждой конкретно акции, и если
 * - стоимость акции увеличилась/уменьшилась на определенный процент за определенное время - сигнализировать
 */
export default async () => {
  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] Start.', {
    isFirstLogMessage: true
  });

  // Смотрим изменение цен с начала дня
  const dayStartChanges: StocksChangesItem[] = await getChangesFromDayStart();

  if (!dayStartChanges) return;

  // Смотрим изменение цен с начала недели
  // TODO ADD
  // const weekStartChanges = await getChangesFromWeekStart();

  /**
   * Если есть хоть какие-нибудь отклонения на графиках (с начала дня, недели, за неделю суммарно), тогда
   * отправляем оповещения в телеграме о росте котировок
   */
  await sendChangesToTelegramNotification({ dayStartChanges });

  await debug_log(GET_CHECK_DIFFERENCE_IN_SHARE_PRICES_LOG_PATH(), '[check_difference_in_share_prices] End.');
};