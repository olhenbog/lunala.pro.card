const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Перенаправляем вывод в файл для отладки
const logFile = '/tmp/debug.log';
async function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `${timestamp} ${msg}\n`;
    await fs.appendFile(logFile, line);
    console.log(msg);
}

async function main() {
    await log('🚀 Старт скрипта');
    await log(`BOT_TOKEN задан? ${!!BOT_TOKEN}`);
    await log(`CHAT_ID задан? ${!!CHAT_ID}`);
    
    if (!BOT_TOKEN || !CHAT_ID) {
        await log('❌ Ошибка: нет токена или CHAT_ID');
        process.exit(1);
    }
    
    const bot = new Telegraf(BOT_TOKEN);
    const CARDS_DIR = path.join(__dirname, 'images', 'cards');
    await log(`📁 Путь к картам: ${CARDS_DIR}`);
    
    // Проверяем существование папки
    try {
        const stat = await fs.stat(CARDS_DIR);
        await log(`✅ Папка существует, isDirectory: ${stat.isDirectory()}`);
    } catch (err) {
        await log(`❌ Папка не найдена: ${err.message}`);
        process.exit(1);
    }
    
    // Читаем файлы
    const files = await fs.readdir(CARDS_DIR);
    await log(`📄 Все файлы в папке: ${files.join(', ')}`);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    await log(`🖼️ PNG файлы: ${pngFiles.join(', ')}`);
    
    if (pngFiles.length === 0) {
        await log('❌ Нет PNG файлов');
        process.exit(1);
    }
    
    const randomIndex = Math.floor(Math.random() * pngFiles.length);
    const selected = pngFiles[randomIndex];
    const cardPath = path.join(CARDS_DIR, selected);
    await log(`🎲 Выбрана карта: ${selected}, полный путь: ${cardPath}`);
    
    // Проверяем существование файла
    if (!fsSync.existsSync(cardPath)) {
        await log(`❌ Файл не найден: ${cardPath}`);
        process.exit(1);
    }
    await log(`✅ Файл существует, размер: ${fsSync.statSync(cardPath).size} байт`);
    
    // Отправляем в Telegram
    await log(`📤 Отправляем фото в Telegram...`);
    try {
        await bot.telegram.sendPhoto(
            CHAT_ID,
            { source: cardPath },
            { caption: '✨ Ваша метафорическая карта дня ✨' }
        );
        await log(`✨ Карта успешно отправлена!`);
    } catch (err) {
        await log(`❌ Ошибка отправки: ${err.message}`);
        if (err.response) {
            await log(`📡 Ответ Telegram: ${JSON.stringify(err.response)}`);
        }
        throw err;
    }
    
    // Выводим содержимое лога в stdout, чтобы GitHub Actions его показал
    const logContent = await fs.readFile(logFile, 'utf-8');
    console.log('\n=== ПОДРОБНЫЙ ЛОГ ===\n');
    console.log(logContent);
    console.log('\n=== КОНЕЦ ЛОГА ===\n');
}

main().catch(async err => {
    console.error('❌ Критическая ошибка:', err);
    process.exit(1);
});
