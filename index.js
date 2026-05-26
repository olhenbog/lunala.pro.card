const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.telegram.sendMessage(process.env.CHAT_ID, 'Привет! Бот работает.')
  .then(() => console.log('Сообщение отправлено'))
  .catch(err => console.error('Ошибка:', err.message));
