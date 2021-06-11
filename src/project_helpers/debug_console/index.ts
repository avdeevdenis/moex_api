/**
 * В режиме разработки 'NODE_ENV=dev' выводит в консоль сообщения с текстом 'message'
 */
export const debug_console = (...messages) => {
  const isDev = process.env.NODE_ENV === 'dev';

  if (!isDev) return;

  const colors = {
    cyan: '\x1b[36m%s\x1b[0m'
  };

  const color = colors.cyan;

  console.log(color, ...messages);
};