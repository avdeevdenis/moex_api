export const getUnixTimeFromDateString = (dateString: string) => {
  const now = new Date();

  let [hours, minutes, seconds] = dateString.split(':');

  now.setHours(Number(hours), Number(minutes), Number(seconds), 0);

  return +now;
}
