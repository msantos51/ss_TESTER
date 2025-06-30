// Ecrã de configurações de conta onde o utilizador ajusta notificações
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
  getNotificationRadius,
  setNotificationRadius,
} from '../settingsService';
import { theme } from '../theme';
import t from '../i18n';
import BackButton from '../BackButton';

export default function AccountSettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [radius, setRadius] = useState('20');

  useEffect(() => {
    // load
    const load = async () => {
      setEnabled(await isNotificationsEnabled());
      // r
      const r = await getNotificationRadius();
      setRadius(String(r));
    };
    load();
  }, []);

  // toggleNotifications
  const toggleNotifications = async () => {
    // val
    const val = !enabled;
    setEnabled(val);
    await setNotificationsEnabled(val);
  };

  // changeRadius
  const changeRadius = async (value) => {
    setRadius(String(value));
    await setNotificationRadius(value);
  };

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <Text style={styles.title}>{t('accountSettingsTitle')}</Text>
      {/* Interruptor para ativar ou desativar notificações */}
      <View style={styles.row}>
        <Text>{t('notificationsEnabled')}</Text>
        <Switch value={enabled} onValueChange={toggleNotifications} />
      </View>
      <Text>{t('notificationRadius')}</Text>
      {/* Menu suspenso para escolher o raio de alertas */}
      <Picker
        selectedValue={parseInt(radius, 10)}
        onValueChange={changeRadius}
        style={styles.picker}
      >
        <Picker.Item label="20" value={20} />
        <Picker.Item label="50" value={50} />
        <Picker.Item label="100" value={100} />
      </Picker>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  picker: { marginBottom: 16 },
  back: { position: 'absolute', top: 16, left: 16 },
});
