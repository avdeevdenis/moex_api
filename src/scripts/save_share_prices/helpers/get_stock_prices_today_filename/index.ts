/**
 * Возвращает имя для файла в формате (DD_MM_YYYY)
 */
export const getStockPricesTodayFileName = () => {
  const date = new Date();

  const value = (number) => {
    return number < 10 ? '0' + number : number;
  }

  return [
    value(date.getDate()),
    value(date.getMonth() + 1),
    value(date.getFullYear())
  ].join('_');
};