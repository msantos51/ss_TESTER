import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    statsTitle: 'Stats',
    noRoutes: 'No routes recorded',
    favorites: 'Favorites',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove favorite',
    paidWeeksTitle: 'Paid weeks',
    languageTitle: 'Language',
    english: 'English',
    portuguese: 'Portuguese',
    accountSettingsTitle: 'Account Settings',
    notificationsEnabled: 'Enable notifications',
    notificationRadius: 'Notification radius (m)',
  },
  pt: {
    statsTitle: 'Estatísticas',
    noRoutes: 'Nenhum trajeto registado',
    favorites: 'Favoritos',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover favorito',
    paidWeeksTitle: 'Semanas Pagas',
    languageTitle: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
    accountSettingsTitle: 'Definições de Conta',
    notificationsEnabled: 'Ativar notificações',
    notificationRadius: 'Raio para notificações (m)',
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;

export async function loadLanguage() {
  const stored = await AsyncStorage.getItem('language');
  i18n.locale = stored || Localization.locale;
}

export async function setLanguage(lang) {
  i18n.locale = lang;
  await AsyncStorage.setItem('language', lang);
}

export async function getLanguage() {
  const stored = await AsyncStorage.getItem('language');
  return stored || Localization.locale;
}

export default function t(key) {
  return i18n.t(key);
}
