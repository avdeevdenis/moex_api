// https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
process.env.NTBA_FIX_319 = '1';

// https://github.com/yagop/node-telegram-bot-api/issues/482
process.env.NTBA_FIX_350 = '1';