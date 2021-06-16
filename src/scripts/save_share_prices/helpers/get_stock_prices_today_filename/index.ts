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

export const getStockPricesTodayFileName = ({ pathStart, extension }: StockPricesTodayOptions) => {
  const now = DateTime.now().setZone('Europe/Moscow');

  const value = (number) => {
    return number < 10 ? '0' + number : number;
  }

  const filename = [
    value(now.c.day),
    value(now.c.month),
    value(now.c.year),
  ].join('_');

  const pathName = pathStart ? pathStart + '/' : '';

  return pathName + filename + '.' + extension;
};