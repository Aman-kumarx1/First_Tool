package com.firsttool.whatsappwatcher

import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.app.Notification
import java.io.File

class WhatsAppNotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            if (sbn.packageName != "com.whatsapp") return

            val extras = sbn.notification.extras
            val title = extras.getString(Notification.EXTRA_TITLE) ?: "unknown"
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

            // Save message text as before
            saveMessageToFile(title, text)

            // Also store last-sender info into SharedPreferences so the FileObserver can associate
            // incoming media files with the most-recent sender (best-effort heuristic).
            try {
                val prefs = applicationContext.getSharedPreferences("whatsapp_watcher", Context.MODE_PRIVATE)
                val now = System.currentTimeMillis()
                prefs.edit().putString("last_sender", title).putLong("last_sender_time", now).apply()
            } catch (e: Exception) {
                e.printStackTrace()
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun saveMessageToFile(title: String, message: String) {
        try {
            val dir = File(getExternalFilesDir(null), "WhatsAppArchive")
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, "${sanitize(title)}.txt")
            file.appendText("${System.currentTimeMillis()}: $message\n")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sanitize(s: String): String {
        return s.replace(Regex("[^A-Za-z0-9_.-]"), "_")
    }
}
