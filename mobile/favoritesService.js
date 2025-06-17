import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorites';

export async function getFavorites() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function addFavorite(id) {
  const favs = await getFavorites();
  if (!favs.includes(id)) {
    favs.push(id);
    await AsyncStorage.setItem(KEY, JSON.stringify(favs));
  }
}

export async function removeFavorite(id) {
  let favs = await getFavorites();
  favs = favs.filter((v) => v !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(favs));
}

export async function isFavorite(id) {
  const favs = await getFavorites();
  return favs.includes(id);
}
