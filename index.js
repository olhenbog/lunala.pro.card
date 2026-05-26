const fs = require('fs').promises;
const path = require('path');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

console.log('🔍 Проверка переменных окружения:');
console.log('BOT_TOKEN задан?', !!BOT_TOKEN);
console.log('CHAT_ID задан?', !!CHAT_ID);

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Ошибка: BOT_TOKEN или CHAT_ID не заданы в Secrets');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const CARDS_DIR = path.join(__dirname, 'images', 'cards');
console.log('📁 Путь к картам:', CARDS_DIR);

async function getRandomCard() {
    console.log('📂 Читаем папку...');
    const files = await fs.readdir(CARDS_DIR);
    console.log('📄 Все файлы:', files);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    console.log('🖼️ PNG файлы:', pngFiles);
    if (pngFiles.length === 0) throw new Error('Нет PNG в папке');
    const randomIndex = Math.floor(Math.random() * pngFiles.length);
    const selected = pngFiles[randomIndex];
    console.log('🎲 Выбрана карта:', selected);
    return path.join(CARDS_DIR, selected);
}

async function sendDailyCard() {
    try {
        console.log('🚀 Начинаем отправку...');
        const cardPath = await getRandomCard();
        console.log('🔍 Полный путь:', cardPath);
        
        // Дополнительная проверка существования файла
        const fsSync = require('fs');
        if (!fsSync.existsSync(cardPath)) {
            console.error('❌ Файл не найден по пути:', cardPath);
            return;
        }
        console.log('✅ Файл существует');
        
        console.log('📤 Отправляем фото в Telegram...');
        await bot.telegram.sendPhoto(
            CHAT_ID,
            { source: cardPath },
            { caption: '✨ Ваша метафорическая карта дня ✨' }
        );
        console.log('✨ Карта успешно отправлена!');
    } catch (err) {
        console.error('❌ ОШИБКА:', err.message);
        console.error('📚 Стек ошибки:', err.stack);
    }
}

if (require.main === module) {
    sendDailyCard().then(() => process.exit(0));
}

module.exports = { sendDailyCard };
