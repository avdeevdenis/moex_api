export const debug = (message: string) => {
  const isDev = process.env.NODE_ENV === 'dev';

  if (!isDev) return;

  const colors = {
    cyan: '\x1b[36m%s\x1b[0m'
  };

  console.log(colors.cyan, message);
};