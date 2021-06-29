import { subscribeOnMessages } from "../subscribe_on_messages";

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TELEGRAM_API_TOKEN;
const AvdeevStocksBot = new TelegramBot(token, {
  polling: true
});

/**
 * Подписыватся на принятие сообщений от бота и их обработку
 */
subscribeOnMessages(AvdeevStocksBot);

export default AvdeevStocksBot;