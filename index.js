const fs = require('fs');
const path = require('path');

console.log('Рабочая директория:', __dirname);
const files = fs.readdirSync(__dirname);
console.log('Все файлы:', files);
const pngFiles = files.filter(f => f.endsWith('.png'));
console.log('PNG файлы:', pngFiles);
    console.error('❌ Критическая ошибка:', err);
    process.exit(1);
});
