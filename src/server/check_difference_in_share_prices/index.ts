// https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
process.env.NTBA_FIX_319 = '1';

require('dotenv').config();

import { getChangesFromDayStart } from './helpers/getChangesFromDayStart';
import { sendChangesTelegramNotification } from './helpers/sendChangesTelegramNotification';

/**
 * Функциональность следующая - проверяем изменение цены каждой конкретно акции, и если
 * - стоимость акции увеличилась/уменьшилась на определенный процент за определенное время - сигнализировать
 */
export default async () => {
  // Смотрим изменение цен с начала дня
  const dayStartChanges = await getChangesFromDayStart();

  // Смотрим изменение цен с начала недели
  // TODO ADD
  // const weekStartChanges = await getChangesFromWeekStart();

  /**
   * Если есть хоть какие-нибудь отклонения на графиках (с начала дня, недели, за неделю суммарно), тогда
   * отправляем оповещения в телеграме о росте котировок
   */
  await sendChangesTelegramNotification({ dayStartChanges });

  console.log('OK');
};