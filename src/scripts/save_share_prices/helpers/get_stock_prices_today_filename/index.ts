const { DateTime } = require('luxon');

/**
 * Возвращает имя для файла в формате (DD_MM_YYYY)
 */
type StockPricesTodayOptions = {
  /**
   * Начало пути к файлу
   */
  pathStart?: string;
  /**
   * Расширение файла
   */
  extension: 'json' | 'txt';
};

export const getToday = () => {
  const now = DateTime.now().setZone('Europe/Moscow');

  const value = (number) => {
    return number < 10 ? '0' + number : number;
  }

  const today = [
    value(now.c.day),
    value(now.c.month),
    value(now.c.year),
  ].join('_');

  return today;
};

export const getStockPricesTodayFileName = ({ pathStart, extension }: StockPricesTodayOptions) => {
  const filename = getToday();

  const pathName = pathStart ? pathStart + '/' : '';

  return pathName + filename + '.' + extension;
};