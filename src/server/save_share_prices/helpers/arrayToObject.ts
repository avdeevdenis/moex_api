export const arrayToObject = (array) => {
  return array.reduce((result, item) => {
    result[item[0]] = item;

    return result;
  }, {});
}