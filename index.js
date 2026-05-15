const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Получение лунных данных для конкретной даты
async function getLunarDataForDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const url = `https://api.weatherapi.com/v1/astronomy.json?key=6e9b0f9c0d6e4f5f8b143631251904&q=Moscow&dt=${dateStr}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.astronomy) {
            return {
                moon_phase: data.astronomy.astro.moon_phase,
                moon_illumination: data.astronomy.astro.moon_illumination,
                sunrise: data.astronomy.astro.sunrise,
                sunset: data.astronomy.astro.sunset
            };
        }
    } catch (error) {
        console.log("Ошибка API, приблизительные данные");
    }
    return {
        moon_phase: "Растущая Луна",
        moon_illumination: "50%",
        sunrise: "05:00",
        sunset: "20:00"
    };
}

function translatePhase(phase) {
    const phases = {
        "New Moon": "🌑 Новолуние",
        "Waxing Crescent": "🌒 Растущий полумесяц",
        "First Quarter": "🌓 Первая четверть",
        "Waxing Gibbous": "🌔 Прибывающая Луна",
        "Full Moon": "🌕 Полнолуние",
        "Waning Gibbous": "🌖 Убывающая Луна",
        "Last Quarter": "🌗 Последняя четверть",
        "Waning Crescent": "🌘 Убывающий полумесяц"
    };
    return phases[phase] || phase;
}

function generateForecast(lunarData, date) {
    const dateStr = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
    let forecast = `🌙 *Астропрогноз на ${dateStr}*\n📍 *Москва*\n\n`;
    forecast += `*🌑 Фаза Луны:* ${translatePhase(lunarData.moon_phase)}\n`;
    forecast += `*✨ Освещённость:* ${lunarData.moon_illumination}%\n`;
    forecast += `*🌅 Рассвет:* ${lunarData.sunrise}\n*🌇 Закат:* ${lunarData.sunset}\n\n`;
    if (lunarData.moon_phase.includes("New")) {
        forecast += `🌟 *Рекомендация:* Время для планирования. Загадай желание! ✨\n`;
    } else if (lunarData.moon_phase.includes("Full")) {
        forecast += `🌟 *Рекомендация:* Полнолуние — пик энергии. Будь внимательна к эмоциям.\n`;
    } else {
        forecast += `🌟 *Рекомендация:* Хороший день для обычных дел. Доверяй интуиции.\n`;
    }
    return forecast;
}

async function sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return await response.json();
}

async function main() {
    console.log("🚀 Запуск...");
    // Прогноз на ЗАВТРА
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lunarData = await getLunarDataForDate(tomorrow);
    const forecast = generateForecast(lunarData, tomorrow);
    const result = await sendToTelegram(forecast);
    if (result.ok) console.log("✅ Отправлено");
    else console.log("❌ Ошибка:", result.description);
}
main();
