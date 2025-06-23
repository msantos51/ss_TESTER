import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'notifications_enabled';
const RADIUS_KEY = 'notification_radius';

export async function isNotificationsEnabled() {
  const val = await AsyncStorage.getItem(ENABLED_KEY);
  return val !== 'false';
}

export async function setNotificationsEnabled(enabled) {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getNotificationRadius() {
  const val = await AsyncStorage.getItem(RADIUS_KEY);
  return val ? parseInt(val, 10) : 20;
}

export async function setNotificationRadius(radius) {
  await AsyncStorage.setItem(RADIUS_KEY, String(radius));
}
