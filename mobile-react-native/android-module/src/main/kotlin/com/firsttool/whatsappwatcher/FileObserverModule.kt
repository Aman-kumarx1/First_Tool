package com.firsttool.whatsappwatcher

import android.content.Context
import android.os.FileObserver
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import java.io.File

class FileObserverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val observers: MutableMap<String, FileObserver> = mutableMapOf()

    override fun getName(): String {
        return "WhatsAppWatcher"
    }

    @ReactMethod
    fun startFileObserver() {
        val whatsappMediaPath = File("/storage/emulated/0/WhatsApp/Media")
        if (!whatsappMediaPath.exists()) return

        // Start observers for base and existing subfolders
        scanAndStart(whatsappMediaPath)

        // Watch base folder for newly created directories and start observers for them
        val baseObserver = object : FileObserver(whatsappMediaPath.absolutePath, FileObserver.CREATE or FileObserver.MOVED_TO) {
            override fun onEvent(event: Int, path: String?) {
                try {
                    if (path == null) return
                    val candidate = File(whatsappMediaPath, path)
                    if (candidate.isDirectory) {
                        startObserverForDir(candidate)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
        observers[whatsappMediaPath.absolutePath] = baseObserver
        baseObserver.startWatching()
    }

    @ReactMethod
    fun stopFileObserver() {
        for ((_, obs) in observers) {
            try { obs.stopWatching() } catch (e: Exception) { e.printStackTrace() }
        }
        observers.clear()
    }

    @ReactMethod
    fun isWatching(promise: Promise) {
        try {
            promise.resolve(observers.isNotEmpty())
        } catch (e: Exception) {
            promise.reject("error", e)
        }
    }

    @ReactMethod
    fun listChats(promise: Promise) {
        try {
            val base = reactApplicationContext.getExternalFilesDir(null) ?: reactApplicationContext.filesDir
            val archive = File(base, "WhatsAppArchive")
            val arr = Arguments.createArray()
            if (archive.exists() && archive.isDirectory) {
                val children = archive.listFiles()
                if (children != null) {
                    for (c in children) {
                        if (c.isDirectory) arr.pushString(c.name)
                    }
                }
            }
            promise.resolve(arr)
        } catch (e: Exception) {
            promise.reject("error", e)
        }
    }

    private fun scanAndStart(base: File) {
        startObserverForDir(base)
        val children = base.listFiles() ?: return
        for (c in children) {
            if (c.isDirectory) startObserverForDir(c)
        }
    }

    private fun startObserverForDir(dir: File) {
        try {
            val key = dir.absolutePath
            if (observers.containsKey(key)) return

            val obs = object : FileObserver(dir.absolutePath, FileObserver.CREATE or FileObserver.MOVED_TO or FileObserver.CLOSE_WRITE) {
                override fun onEvent(event: Int, path: String?) {
                    try {
                        if (path == null) return
                        val src = File(dir, path)
                        if (!src.exists()) return

                        val prefs = reactApplicationContext.getSharedPreferences("whatsapp_watcher", Context.MODE_PRIVATE)
                        val lastSender = prefs.getString("last_sender", null)
                        val lastSenderTime = prefs.getLong("last_sender_time", 0)
                        val now = System.currentTimeMillis()
                        val sender = if (lastSender != null && (now - lastSenderTime) <= 120_000L) lastSender else "Unknown"

                        // Use MediaSaver helper to copy and record metadata
                        MediaSaver.saveMedia(reactApplicationContext, src, sender)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }

            observers[key] = obs
            obs.startWatching()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
