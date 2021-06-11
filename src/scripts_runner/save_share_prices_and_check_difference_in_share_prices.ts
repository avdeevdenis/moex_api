import check_difference_in_share_prices from '../scripts/check_difference_in_share_prices';
import save_share_prices from '../scripts/save_share_prices';

(async () => {
  /**
     * 1. Последовательность важна! Сначала запускам скрипт сохранения
     */
  await save_share_prices();

  /**
   * 2. Последовательность важна! Затем запускам скрипт сравнения
   */
  await check_difference_in_share_prices();
})();
