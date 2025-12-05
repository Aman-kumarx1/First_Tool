# 🟢 WhatsApp Local Backup Tool

A Node.js-based tool that uses WhatsApp Web to automatically save:

✔ **All messages you receive**

✔ **All messages you send**

✔ **Group chats**

✔ **Media files** (images, videos, audio, documents)

✔ **Message metadata** (time, sender, type)

Everything is stored **locally on your computer only** — nothing is uploaded online.

## ⭐ Why This Tool Is Useful

- **WhatsApp disappearing messages** remove chats automatically
- You **cannot recover deleted messages** normally
- WhatsApp does not allow automatic backup of all media through official APIs
- This tool acts like a **local black box recorder** for your WhatsApp

## 🛠️ How the Tool Works Internally

### 1️⃣ Uses `whatsapp-web.js`
- Opens a hidden (headless) WhatsApp Web session
- No GUI, runs in the background

### 2️⃣ Scans QR Code Once
- You log in once → Session saved locally
- Next time you run it, it auto-logs in

### 3️⃣ Every Message Event is Captured
- **Outgoing messages** (`message_create`)
- **Incoming messages** (`message`)
- **Group messages** (with author ID)

### 4️⃣ Messages are Appended to JSON Files
For each chat:
```
backup/chats/919876543210@c.us.json
```

### 5️⃣ Every Media File is Saved with Metadata
Organized by date and chat ID:
```
backup/media/2025-12-05/919876543210@c.us/1733358000000.jpg
backup/media/2025-12-05/919876543210@c.us/1733358000000.jpg.meta.json
```

### 6️⃣ The Tool Runs Continuously
- As long as Node.js is running, backups happen automatically
- Press `Ctrl+C` to stop gracefully

## 📁 Folder Structure

```
whatsapp-backup-tool/
├── index.js              # Main backup logic
├── config.json           # User settings (what to backup)
├── package.json          # Dependencies
├── helpers/
│   └── utils.js          # Utility functions
├── backup/               # All saved messages & media (auto-created)
│   ├── chats/            # JSON chat logs
│   │   └── 919876543210@c.us.json
│   └── media/            # Media files organized by date
│       └── 2025-12-05/
│           └── 919876543210@c.us/
│               ├── 1733358000000.jpg
│               └── 1733358000000.jpg.meta.json
├── .wwebjs_auth/         # Session data (auto-created)
└── README.md             # This file
```

## 🔍 What is Saved Exactly?

### ✔ Message Content
```json
{
  "id": "ABCD1234",
  "from": "919876543210@c.us",
  "to": "919999999999@c.us",
  "body": "Hello!",
  "type": "text",
  "timestamp": "2025-12-05T10:40:00Z",
  "isSentByMe": false,
  "hasMedia": false,
  "isGroupMsg": false,
  "author": null,
  "isForwarded": false
}
```

### ✔ Media Files
- Saved in **original quality**
- Images, videos, audio, documents all supported

### ✔ Media Metadata
```json
{
  "filename": "1733358000000_ABC123",
  "mimetype": "image/jpeg",
  "timestamp": "2025-12-05T10:40:00Z",
  "chatId": "919876543210@c.us",
  "size": 245632
}
```

## ⚙️ Configuration (config.json)

Customize backup behavior:

```json
{
  "BACKUP_DIR": "./backup",
  "SAVE_MEDIA": true,
  "SAVE_MESSAGES": true,
  "SAVE_GROUPS": true,
  "HEADLESS": true,
  "LOG_LEVEL": "info"
}
```

### 🔧 Options Meaning

| Option | Type | Description |
|--------|------|-------------|
| `BACKUP_DIR` | string | Where to save backups (default: `./backup`) |
| `SAVE_MEDIA` | boolean | Save images/docs/videos/audio (default: `true`) |
| `SAVE_MESSAGES` | boolean | Save text messages (default: `true`) |
| `SAVE_GROUPS` | boolean | Include group chats (default: `true`) |
| `HEADLESS` | boolean | Run browser in background (default: `true`) |
| `LOG_LEVEL` | string | Logging level: `debug`, `info`, `warn`, `error` (default: `info`) |

## 🚀 How to Run the Tool

### Requirements
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Step 1: Install Node.js
Download from: https://nodejs.org

### Step 2: Clone or Download This Repository
```bash
git clone https://github.com/YOUR_USERNAME/whatsapp-backup-tool.git
cd whatsapp-backup-tool
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the Tool
```bash
npm start
```

Or with auto-reload during development:
```bash
npm run dev
```

### Step 5: Scan QR Code
1. A QR code will appear in the terminal
2. Open **WhatsApp** on your phone
3. Go to **Settings → Linked Devices → Link a Device**
4. **Scan the QR code** from the terminal
5. Done! Your session is now saved

### Step 6: Keep Running
- Leave the tool running to backup messages in real-time
- Press `Ctrl+C` to stop

## 🌟 Features Summary

✔ Full message backup (sent + received)
✔ Group chat backup
✔ Automatic media download
✔ Daily folder organization (YYYY-MM-DD)
✔ Metadata storage (.json files)
✔ Local-only storage (no cloud)
✔ Session auto-login (no QR every time)
✔ Works with disappearing messages
✔ Zero WhatsApp API cost
✔ Handles media of all types
✔ Graceful shutdown with `Ctrl+C`

## 🛡️ Safety & Privacy

- ✅ **All data stays locally** on your computer
- ✅ **No data is uploaded** to GitHub or cloud
- ✅ **Session is stored only** on your machine
- ✅ **Open source** — you can audit the code
- ✅ Uses only **official WhatsApp Web** (not hacking)

## 📊 Storage Estimates

Approximate storage usage:

| Content Type | 1 Month | 1 Year |
|--------------|---------|--------|
| Text messages only | ~5 MB | ~60 MB |
| With photos (10/day) | ~500 MB | ~5 GB |
| With videos (2/day) | ~2 GB | ~20 GB |

## 🐛 Troubleshooting

### Problem: QR Code not scanning
- Make sure your phone's camera is working
- Try moving closer to the terminal
- Restart the tool with `Ctrl+C` and `npm start`

### Problem: "Cannot find module 'whatsapp-web.js'"
```bash
npm install
```

### Problem: "Port already in use"
- Another instance is running
- Kill it: `npx lsof -i :PORT` (find the PID and kill it)
- Or use a different port in config.json

### Problem: Media not downloading
- Check your internet connection
- Check available disk space
- Enable `SAVE_MEDIA: true` in config.json

### Problem: Tool exits unexpectedly
- Check logs for errors
- Restart: `npm start`
- If persists, check internet connection

## 📝 Example Usage

### Start backup
```bash
$ npm start
[2025-12-05T10:30:00.000Z] [INFO] Initializing WhatsApp Backup Tool...
[2025-12-05T10:30:00.000Z] [INFO] ⏳ Please wait while connecting to WhatsApp...
[2025-12-05T10:30:05.000Z] [INFO] 📱 Scan this QR code with WhatsApp:
███████████████████████████████
█ ▄▄▄▄▄ ██ █  ▀█▄▀▄ ▄▀█ ▄▄▄▄▄ █
█ █   █ ██ ▀▄▀▀▀▀▀  ▄█ █   █ █
█ █▄▄▄█ ████ ██▀ █ ▀▄  █▄▄▄█ █
█▄▄▄▄▄▄▄█▀▄▀▄█ █ █ █ █▄▄▄▄▄▄▄█
█ ▀█▄▀ ▀█ ▀▀▀▀▄ ▀▄▀  █▀▀▀ ▀▀█
███████████████████████████████

[2025-12-05T10:30:30.000Z] [INFO] ✅ WhatsApp client is ready!
[2025-12-05T10:30:30.000Z] [INFO] 🔄 Starting backup service...
[2025-12-05T10:30:35.000Z] [INFO] 📥 [919876543210@c.us] Hey! How are you?
[2025-12-05T10:30:36.000Z] [INFO]   📎 Media saved: 1733358236000_ABCD1234
```

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

- This tool is for **personal use only**
- WhatsApp's Terms of Service prohibit automated use
- Use at your own risk
- Not affiliated with WhatsApp/Meta

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Enable debug mode: Change `LOG_LEVEL` to `debug` in config.json
3. Check GitHub Issues: https://github.com/YOUR_USERNAME/whatsapp-backup-tool/issues

---

**Happy backing up! 🎉**
