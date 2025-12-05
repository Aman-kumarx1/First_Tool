const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  ensureDir,
  saveMessage,
  saveMedia,
  formatMessage,
  log
} = require('./helpers/utils');

// Load config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const SESSION_FILE_PATH = './session.json';
let sessionData;

// Load session if it exists
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

const puppeteerConfig = {
  headless: config.HEADLESS,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  timeout: 30000
};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: puppeteerConfig
});

// Ensure backup directory exists
ensureDir(config.BACKUP_DIR);

/**
 * QR Code Event - Display QR for initial login
 */
client.on('qr', (qr) => {
  log('INFO', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('INFO', '📱 Scan this QR code with WhatsApp:');
  log('INFO', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  qrcode.generate(qr, { small: true });
});

/**
 * Ready Event - Client is ready
 */
client.on('ready', () => {
  log('INFO', '✅ WhatsApp client is ready!');
  log('INFO', '🔄 Starting backup service...');
  log('INFO', `📁 Backup directory: ${config.BACKUP_DIR}`);
  log('INFO', `💾 Save Messages: ${config.SAVE_MESSAGES}`);
  log('INFO', `📎 Save Media: ${config.SAVE_MEDIA}`);
  log('INFO', `👥 Save Groups: ${config.SAVE_GROUPS}`);
});

/**
 * Message Received - Backup incoming messages
 */
client.on('message', async (message) => {
  if (!config.SAVE_MESSAGES) return;

  try {
    const chatId = message.from;
    const isSentByMe = message.fromMe;

    // Format and save message
    const formattedMessage = formatMessage(message, isSentByMe);
    const saved = saveMessage(config.BACKUP_DIR, chatId, formattedMessage);

    if (saved) {
      const indicator = isSentByMe ? '📤' : '📥';
      log('INFO', `${indicator} [${chatId}] ${message.body.substring(0, 50)}...`);
    }

    // Download and save media if present
    if (message.hasMedia && config.SAVE_MEDIA) {
      try {
        const media = await message.downloadMedia();
        const filename = `${Date.now()}_${message.id.id}`;
        const success = saveMedia(config.BACKUP_DIR, chatId, media, filename);

        if (success) {
          log('INFO', `  📎 Media saved: ${filename}`);
        }
      } catch (error) {
        log('ERROR', `Failed to download media: ${error.message}`);
      }
    }
  } catch (error) {
    log('ERROR', `Error processing message: ${error.message}`);
  }
});

/**
 * Message Create - Backup sent messages
 */
client.on('message_create', async (message) => {
  if (!config.SAVE_MESSAGES || !message.fromMe) return;

  try {
    const chatId = message.to;

    // Format and save message
    const formattedMessage = formatMessage(message, true);
    const saved = saveMessage(config.BACKUP_DIR, chatId, formattedMessage);

    if (saved) {
      log('INFO', `📤 [${chatId}] Message sent: ${message.body.substring(0, 50)}...`);
    }

    // Download and save media if present
    if (message.hasMedia && config.SAVE_MEDIA) {
      try {
        const media = await message.downloadMedia();
        const filename = `${Date.now()}_${message.id.id}`;
        const success = saveMedia(config.BACKUP_DIR, chatId, media, filename);

        if (success) {
          log('INFO', `  📎 Media saved: ${filename}`);
        }
      } catch (error) {
        log('ERROR', `Failed to download media: ${error.message}`);
      }
    }
  } catch (error) {
    log('ERROR', `Error processing sent message: ${error.message}`);
  }
});

/**
 * Authenticated - Session saved
 */
client.on('authenticated', (session) => {
  sessionData = session;
  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
  log('INFO', '✅ Session authenticated and saved!');
});

/**
 * Disconnected - Client disconnected
 */
client.on('disconnected', (reason) => {
  log('INFO', `🔌 Client disconnected: ${reason}`);
  log('INFO', 'Attempting to reconnect...');
});

/**
 * Error handling
 */
client.on('error', (error) => {
  log('ERROR', `Client error: ${error.message}`);
});

/**
 * Initialize the client
/**
 * Error handling
 */
client.on('error', (error) => {
  log('ERROR', `Client error: ${error.message}`);
  if (error.message.includes('ENOENT') || error.message.includes('chrome')) {
    log('ERROR', '❌ Browser launch failed. Retrying in 5 seconds...');
    setTimeout(() => {
      client.initialize();
    }, 5000);
  }
});
/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  log('INFO', '🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

module.exports = client;
