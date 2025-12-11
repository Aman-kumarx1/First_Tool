package com.firsttool.whatsappwatcher

import android.content.Context
import android.os.FileObserver
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.Locale

class FileObserverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var observer: FileObserver? = null

    override fun getName(): String {
        return "WhatsAppWatcher"
    }

    @ReactMethod
    fun startFileObserver() {
        val whatsappMediaPath = File("/storage/emulated/0/WhatsApp/Media")
        val targetBase = File(reactApplicationContext.getExternalFilesDir(null), "WhatsAppArchive")
        if (!targetBase.exists()) targetBase.mkdirs()

        if (observer != null) return

        observer = object : FileObserver(whatsappMediaPath.absolutePath, CREATE or MOVED_TO) {
            override fun onEvent(event: Int, path: String?) {
                try {
                    if (path == null) return
                    val src = File(whatsappMediaPath, path)
                    if (!src.exists()) return

                    // Determine a per-contact folder using the last sender heuristic saved by NotificationListener.
                    val prefs = reactApplicationContext.getSharedPreferences("whatsapp_watcher", Context.MODE_PRIVATE)
                    val lastSender = prefs.getString("last_sender", null)
                    val lastSenderTime = prefs.getLong("last_sender_time", 0)
                    val now = System.currentTimeMillis()

                    // If last sender is recent (2 minutes), assign into that sender folder; otherwise Unknown
                    val senderFolderName = if (lastSender != null && (now - lastSenderTime) <= 120_000L) {
                        sanitizeForFolder(lastSender)
                    } else {
                        "Unknown"
                    }

                    val destDir = File(targetBase, senderFolderName)
                    if (!destDir.exists()) destDir.mkdirs()

                    // Keep original file name when copying
                    val dest = File(destDir, src.name)
                    copyFile(src, dest)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
        observer?.startWatching()
    }

    @ReactMethod
    fun stopFileObserver() {
        observer?.stopWatching()
        observer = null
    }

    private fun copyFile(src: File, dest: File) {
        try {
            val ins = FileInputStream(src)
            val outs = FileOutputStream(dest)
            ins.copyTo(outs)
            ins.close()
            outs.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sanitizeForFolder(s: String): String {
        val cleaned = s.replace(Regex("[^A-Za-z0-9 _.-]"), "_")
        return if (cleaned.length > 64) cleaned.substring(0, 64) else cleaned
    }
}
