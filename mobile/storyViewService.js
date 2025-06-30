// Serviço para guardar stories vistos localmente
import AsyncStorage from '@react-native-async-storage/async-storage';

// KEY
const KEY = 'seenStories';

export async function getSeenStories() {
  // data
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function markStoriesSeen(ids) {
  // seen
  const seen = await getSeenStories();
  // merged
  const merged = Array.from(new Set([...seen, ...ids]));
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
