import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text, TextInput } from 'react-native-paper';
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
  getNotificationRadius,
  setNotificationRadius,
} from '../settingsService';
import { theme } from '../theme';
import t from '../i18n';

export default function AccountSettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [radius, setRadius] = useState('20');

  useEffect(() => {
    const load = async () => {
      setEnabled(await isNotificationsEnabled());
      const r = await getNotificationRadius();
      setRadius(String(r));
    };
    load();
  }, []);

  const toggleNotifications = async () => {
    const val = !enabled;
    setEnabled(val);
    await setNotificationsEnabled(val);
  };

  const changeRadius = async (value) => {
    setRadius(value);
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      await setNotificationRadius(num);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('accountSettingsTitle')}</Text>
      <View style={styles.row}>
        <Text>{t('notificationsEnabled')}</Text>
        <Switch value={enabled} onValueChange={toggleNotifications} />
      </View>
      <TextInput
        mode="outlined"
        style={styles.input}
        label={t('notificationRadius')}
        keyboardType="numeric"
        value={radius}
        onChangeText={changeRadius}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  input: { marginBottom: 16 },
});
