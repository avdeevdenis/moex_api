/**
 * Возвращает разницу между двумя числами в процентах
 */
export const getPercentageDiff = (value1, value2, NUMBER_ROUNDING_ORDER = 2) => {
  let valuesDiffInPercents = value2 * 100 / value1 - 100;

  // Округляем до порядка 'NUMBER_ROUNDING_ORDER' и приводим к числу
  valuesDiffInPercents = Number(valuesDiffInPercents.toFixed(NUMBER_ROUNDING_ORDER));

  return valuesDiffInPercents;
};