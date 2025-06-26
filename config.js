require('dotenv').config();

const config = {
    // Cookie for authentication
    cookie: process.env.GOBLIN_COOKIE || '',
    
    // API Configuration
    api: {
        baseUrl: 'https://www.goblin.meme/api',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 2000
    },
    
    // Scheduler Configuration
    scheduler: {
        // Cron expression for daily run (9 AM)
        dailySchedule: '0 9 * * *',
        // Cron expression to check ready boxes (every 4 hours)
        checkReadySchedule: '0 */4 * * *',
        // Timezone
        timezone: 'Asia/Jakarta'
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        debug: process.env.DEBUG === 'true',
        maxLogSize: 10 * 1024 * 1024, // 10MB
        maxLogFiles: 5
    },
    
    // Box Processing Configuration
    processing: {
        // Delay between processing boxes (in milliseconds)
        delayBetweenBoxes: 2000,
        // Delay between checking ready boxes (in milliseconds)
        delayBetweenChecks: 1000,
        // Auto start boxes that haven't been started
        autoStart: process.env.AUTO_START !== 'false',
        // Auto open boxes that are ready
        autoOpen: process.env.AUTO_OPEN !== 'false'
    },
    
    // Notification Configuration (for future enhancement)
    notification: {
        enabled: process.env.NOTIFICATION_ENABLED === 'true',
        webhookUrl: process.env.WEBHOOK_URL || '',
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
        telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
    }
};

// Validation
if (!config.cookie) {
    console.error('ERROR: Cookie not found! Set GOBLIN_COOKIE in environment variables or edit config.js');
    process.exit(1);
}

// Display configuration (without cookie for security)
console.log('Goblin Box Automation Configuration:');
console.log('- API Base URL:', config.api.baseUrl);
console.log('- Daily Schedule:', config.scheduler.dailySchedule);
console.log('- Check Ready Schedule:', config.scheduler.checkReadySchedule);
console.log('- Timezone:', config.scheduler.timezone);
console.log('- Auto Start:', config.processing.autoStart);
console.log('- Auto Open:', config.processing.autoOpen);
console.log('- Debug Mode:', config.logging.debug);

module.exports = config;
