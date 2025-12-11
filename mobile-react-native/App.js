import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, Button, PermissionsAndroid, Platform, NativeModules, StyleSheet, FlatList} from 'react-native';
import RNFS from 'react-native-fs';

const {WhatsAppWatcher} = NativeModules || {};

export default function App() {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    // nothing for now
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>WhatsApp Archiver (Prototype)</Text>
      <Text style={styles.line}>Status: {status}</Text>
      <View style={styles.row}>
        <Button title="Start Watcher" onPress={startWatching} />
      </View>
      <View style={{marginTop:20}}>
        <Text style={styles.h2}>Saved chats folder:</Text>
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
