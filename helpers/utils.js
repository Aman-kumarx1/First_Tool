const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');

/**
 * Ensure directory exists, create if not
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get formatted date for folder organization
 */
const getDateFolder = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Save message to JSON file
 */
const saveMessage = (backupDir, chatId, messageData) => {
  try {
    const chatsDir = path.join(backupDir, 'chats');
    ensureDir(chatsDir);

    const chatFile = path.join(chatsDir, `${chatId}.json`);
    let messages = [];

    if (fs.existsSync(chatFile)) {
      const data = fs.readFileSync(chatFile, 'utf8');
      messages = JSON.parse(data);
    }

    messages.push(messageData);
    fs.writeFileSync(chatFile, JSON.stringify(messages, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
};

/**
 * Save media file with metadata
 */
const saveMedia = (backupDir, chatId, mediaData, filename) => {
  try {
    const dateFolder = getDateFolder();
    const mediaDir = path.join(backupDir, 'media', dateFolder, chatId);
    ensureDir(mediaDir);

    const filepath = path.join(mediaDir, filename);
    fs.writeFileSync(filepath, mediaData.data, 'base64');

    // Save metadata
    const metaFile = path.join(mediaDir, `${filename}.meta.json`);
    const metadata = {
      filename: filename,
      mimetype: mediaData.mimetype,
      timestamp: new Date().toISOString(),
      chatId: chatId,
      size: Buffer.byteLength(mediaData.data, 'base64')
    };
    fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));

    return true;
  } catch (error) {
    console.error('Error saving media:', error);
    return false;
  }
};

/**
 * Format message object for storage
 */
const formatMessage = (message, isSentByMe = false) => {
  return {
    id: message.id?.id || 'unknown',
    from: message.from,
    to: message.to,
    body: message.body,
    type: message.type,
    timestamp: new Date(message.timestamp * 1000).toISOString(),
    isSentByMe: isSentByMe,
    hasMedia: message.hasMedia,
    isGroupMsg: message.isGroupMsg,
    author: message.author || null,
    isForwarded: message.isForwarded || false
  };
};

/**
 * Get mime type for media
 */
const getMimeType = (mediaData) => {
  return mediaData.mimetype || 'application/octet-stream';
};

/**
 * Log with timestamp
 */
const log = (level, message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
};

module.exports = {
  ensureDir,
  getDateFolder,
  saveMessage,
  saveMedia,
  formatMessage,
  getMimeType,
  log
};
