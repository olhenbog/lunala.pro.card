const fs = require('fs');
console.log('📁 Содержимое корня:');
fs.readdirSync('.').forEach(file => {
    console.log(' -', file);
});
