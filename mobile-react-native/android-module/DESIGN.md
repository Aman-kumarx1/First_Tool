WhatsApp Watcher - Architecture

Overview
--------
This module captures WhatsApp incoming notifications, outgoing messages via AccessibilityService, and media files from the WhatsApp media folders. It stores media and messages under the app's external files directory in a per-chat folder with a JSONL log (`chat_log.jsonl`).

Components
----------
- `WhatsAppNotificationListener` — listens to notifications from `com.whatsapp`, writes incoming message metadata via `MediaSaver.saveMessage(...)`, and updates `last_sender` in SharedPreferences.
- `WhatsAppAccessibilityService` — best-effort capture of outgoing message text from WhatsApp UI and writes via `MediaSaver.saveMessage(...)` with direction `sent`.
- `FileObserverModule` — starts `FileObserver`s for `/storage/emulated/0/WhatsApp/Media` and its subfolders; on new media events it calls `MediaSaver.saveMedia(...)`.
- `MediaSaver` — central helper that copies media into `getExternalFilesDir(null)/WhatsAppArchive/<chat>/` using a timestamped filename and records a JSON object per line in `chat_log.jsonl` describing the event.

Heuristics
----------
- Media association: uses the most recent notification sender saved in SharedPreferences (`last_sender`) if it is within two minutes of the media file event; otherwise assigns `Unknown`.
- Outgoing messages: heuristics scan the active window for message composer resource ids; results are best-effort and may miss some messages.

Storage layout
--------------
App external files:

- WhatsAppArchive/
  - <sanitized_chat_name>/
    - <timestamp>_<original_filename>   (copied media)
    - chat_log.jsonl                     (one JSON per line, message or media event)

Privacy & Permissions
---------------------
- This module requires explicit user consent:
  - AccessibilityService must be enabled manually in system settings.
  - Notification listener permission must be granted.
  - Reading `/storage/emulated/0/WhatsApp/Media` requires file access permissions and may need `MANAGE_EXTERNAL_STORAGE` or scoped-storage strategies on Android 11+.

Next steps
----------
- Add a small RN bridge to start/stop observers and expose status.
- Add runtime permission request UI in React Native and guidance for enabling Accessibility and Notification access.
