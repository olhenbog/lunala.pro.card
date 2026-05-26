const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new Telegraf(BOT_TOKEN);

async function sendRandomCard() {
    try {
        // Читаем все файлы в текущей папке (где index.js)
        const files = fs.readdirSync(__dirname);
        const pngFiles = files.filter(f => f.endsWith('.png'));
        console.log('Найдено PNG:', pngFiles);
        
        if (pngFiles.length === 0) {
            console.error('Нет PNG файлов в корне!');
            return;
        }
        
        const randomFile = pngFiles[Math.floor(Math.random() * pngFiles.length)];
        const filePath = path.join(__dirname, randomFile);
        console.log('Выбран файл:', randomFile);
        
        // Отправляем фото
        await bot.telegram.sendPhoto(CHAT_ID, { source: filePath }, { caption: '✨ Ваша метафорическая карта дня ✨' });
        console.log('Отправлено успешно!');
    } catch (err) {
        console.error('Ошибка:', err.message);
    }
}

sendRandomCard();
