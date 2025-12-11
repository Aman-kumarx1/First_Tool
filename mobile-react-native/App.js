import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, Button, PermissionsAndroid, Platform, NativeModules, StyleSheet, FlatList} from 'react-native';
import RNFS from 'react-native-fs';

const {WhatsAppWatcher, AccessibilityModule} = NativeModules || {};

export default function App() {
  const [status, setStatus] = useState('idle');
  const [chats, setChats] = useState([]);

  useEffect(() => {}, []);

  async function requestStoragePermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);
      return (granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async function startWatching() {
    const ok = await requestStoragePermission();
    if (!ok) {
      setStatus('storage-permission-denied');
      return;
    }
    if (WhatsAppWatcher && WhatsAppWatcher.startFileObserver) {
      WhatsAppWatcher.startFileObserver();
      setStatus('watching-files');
    } else {
      setStatus('native-module-missing');
    }
  }

  function stopWatching() {
    if (WhatsAppWatcher && WhatsAppWatcher.stopFileObserver) {
      WhatsAppWatcher.stopFileObserver();
      setStatus('stopped');
    }
  }

  function openAccessibilitySettings() {
    if (AccessibilityModule && AccessibilityModule.openAccessibilitySettings) {
      AccessibilityModule.openAccessibilitySettings();
    } else {
      console.warn('Accessibility native module not available')
    }
  }

  function requestAllFilesAccess() {
    if (AccessibilityModule && AccessibilityModule.openManageAllFilesAccess) {
      AccessibilityModule.openManageAllFilesAccess();
    } else {
      console.warn('All-files-access native method not available')
    }
  }

  function openNotificationAccess() {
    if (AccessibilityModule && AccessibilityModule.openNotificationAccessSettings) {
      AccessibilityModule.openNotificationAccessSettings();
    } else {
      console.warn('Notification access native method not available')
    }
  }

  async function checkAllFilesAccess() {
    if (AccessibilityModule && AccessibilityModule.isAllFilesAccessGranted) {
      try {
        const granted = await AccessibilityModule.isAllFilesAccessGranted();
        setStatus(granted ? 'all-files-access:granted' : 'all-files-access:denied');
      } catch (e) {
        console.warn(e);
      }
    }
  }

  async function checkStatus() {
    if (WhatsAppWatcher && WhatsAppWatcher.isWatching) {
      try {
        const res = await WhatsAppWatcher.isWatching();
        setStatus(res ? 'watching' : 'idle');
      } catch (e) {
        console.warn(e);
      }
    }
  }

  async function fetchChats() {
    if (WhatsAppWatcher && WhatsAppWatcher.listChats) {
      try {
        const arr = await WhatsAppWatcher.listChats();
        setChats(arr || []);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>WhatsApp Archiver (Prototype)</Text>
      <Text style={styles.line}>Status: {status}</Text>
      <View style={styles.row}>
        <Button title="Start Watcher" onPress={startWatching} />
        <View style={{width:8}} />
        <Button title="Stop Watcher" onPress={stopWatching} />
      </View>
        <View style={styles.row}>
        <Button title="Check Status" onPress={checkStatus} />
        <View style={{width:8}} />
        <Button title="Open Accessibility Settings" onPress={openAccessibilitySettings} />
        <View style={{width:8}} />
        <Button title="Open Notification Access" onPress={openNotificationAccess} />
      </View>
      <View style={styles.row}>
        <Button title="Request All Files Access" onPress={requestAllFilesAccess} />
        <View style={{width:8}} />
        <Button title="Check All Files Access" onPress={checkAllFilesAccess} />
      </View>

      <View style={{marginTop:20}}>
        <Text style={styles.h2}>Saved chats:</Text>
        <Button title="Refresh Chats" onPress={fetchChats} />
        <FlatList data={chats} keyExtractor={(i) => i} renderItem={({item}) => <Text style={styles.line}>{item}</Text>} />
      </View>

      <View style={{marginTop:20}}>
        <Text style={styles.h2}>Saved folder (app external):</Text>
        <Text style={styles.mono}>{RNFS.ExternalDirectoryPath}/WhatsAppArchive</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  title: {fontSize: 20, fontWeight: '600'},
  line: {marginTop: 8},
  row: {marginTop: 16},
  h2: {fontWeight: '600'},
  mono: {fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier'}
});
