const fs = require('fs').promises;
const path = require('path');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Ошибка: BOT_TOKEN или CHAT_ID не заданы в Secrets');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const CARDS_DIR = path.join(__dirname, 'images', 'cards');

async function getRandomCard() {
    const files = await fs.readdir(CARDS_DIR);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    if (pngFiles.length === 0) throw new Error('Нет PNG в папке');
    const randomIndex = Math.floor(Math.random() * pngFiles.length);
    return path.join(CARDS_DIR, pngFiles[randomIndex]);
}

async function sendDailyCard() {
    try {
        const cardPath = await getRandomCard();
        await bot.telegram.sendPhoto(
            CHAT_ID,
            { source: cardPath },
            { caption: '✨ Ваша метафорическая карта дня ✨' }
        );
        console.log(`✅ Отправлено: ${path.basename(cardPath)}`);
    } catch (err) {
        console.error('❌ Ошибка:', err);
    }
}

if (require.main === module) {
    sendDailyCard().then(() => process.exit(0));
}

module.exports = { sendDailyCard };
