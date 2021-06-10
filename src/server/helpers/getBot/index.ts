const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TELEGRAM_API_TOKEN;
const AvdeevStocksBot = new TelegramBot(token, {
  polling: true
});

export default AvdeevStocksBot;