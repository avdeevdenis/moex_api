const cron = require('node-cron');

import start from '../../server/save_share_prices';

cron.schedule('*/5 * * * *', () => {
  console.log('running a task every 5 minute');

  start();
});