import { debug_log } from '../../project_helpers/debug_log';
import { SAVE_SHARE_PRICES_TODAY_LOG_PATH } from './common_params';
import { getFilteredOnlyRequiredStocksData } from './helpers/get_filtered_only_required_stocks_data';
import { getRequiredStocksDataWithColumnNames } from './helpers/get_required_stocks_data_with_column_names';
import { getResponseDataFromAPI } from './helpers/get_response_data_from_API';
import { mergeStocksDataIntoFile } from './helpers/merge_stocks_data_into_file';

export default async () => {
  await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] Start.', {
    isFirstLogMessage: true
  });

  // 1. Получаем информацию по всем бумагам Российских эмитентов и зарубежных, доступных на MOEX
  const responseDataFromAPI = await getResponseDataFromAPI();
  if (!responseDataFromAPI) return;

  const { stocksResponseData, stocksForeignResponseData, stocksFundsResponseData, columns } = responseDataFromAPI;

  // 2. Фильтруем из всех бумаг только те, информацию по которым получить необходимо
  const requiredStocksData = await getFilteredOnlyRequiredStocksData({ stocksResponseData, stocksForeignResponseData, stocksFundsResponseData });

  // 3. Преобразуем массив с последовательными данными в массив с объектами с понятными ключами
  const requiredStocksDataWithColumnNames = getRequiredStocksDataWithColumnNames(requiredStocksData, columns);
  
  // 4. Полученный массив считаем полным и достаточным для записи в файл, далее происходит мерж полученного массива с имеющимся (если таковой имеется)
  const isSaved = await mergeStocksDataIntoFile(requiredStocksDataWithColumnNames);

  isSaved ?
    await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] End ok.') :
    await debug_log(SAVE_SHARE_PRICES_TODAY_LOG_PATH, '[save_share_prices] End not ok.');
};