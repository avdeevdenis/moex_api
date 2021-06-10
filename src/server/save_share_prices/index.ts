import { getFilteredOnlyRequiredStocksData } from './helpers/getFilteredOnlyRequiredStocksData';
import { getRequiredStocksDataWithColumnNames } from './helpers/getRequiredStocksDataWithColumnNames';
import { getResponseDataFromAPI } from './helpers/getResponseDataFromAPI';
import { mergeStocksDateIntoFile } from './helpers/mergeStocksDateIntoFile';

export default async () => {
  // 1. Получаем информацию по всем бумагам Российских эмитентов и зарубежных, доступных на MOEX
  const { stocksResponseData, stocksForeignResponseData, columns } = await getResponseDataFromAPI();

  // 2. Фильтруем из всех бумаг только те, информацию по которым получить необходимо
  const requiredStocksData = getFilteredOnlyRequiredStocksData(stocksResponseData, stocksForeignResponseData);

  // 3. Преобразуем массив с последовательными данными в массив с объектами с понятными ключами
  const requiredStocksDataWithColumnNames = getRequiredStocksDataWithColumnNames(requiredStocksData, columns);

  // 4. Полученный массив считаем полным и достаточным для записи в файл, далее происходит мерж полученного массива с имеющимся (если таковой имеется)
  const isSaved = await mergeStocksDateIntoFile(requiredStocksDataWithColumnNames);

  isSaved ?
    console.log('OK') :
    console.log('NOT OK');
};