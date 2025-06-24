import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

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
    clearFavorites: 'Clear favorites',
    proximityMenu: 'Proximity notifications',
    manageAccount: 'Manage account',
    aboutHelp: 'About/Help',
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
    clearFavorites: 'Limpar favoritos',
    proximityMenu: 'Notificações de proximidade',
    manageAccount: 'Definições',
    aboutHelp: 'Sobre/Ajuda',
  },
  'pt-PT': {
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
    clearFavorites: 'Limpar favoritos',
    proximityMenu: 'Notificações de proximidade',
    manageAccount: 'Definições',
    aboutHelp: 'Sobre/Ajuda',
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
// Forçar português de Portugal por omissão
i18n.locale = Localization.locale.startsWith('pt') ? 'pt-PT' : 'en';

export default function t(key) {
  return i18n.t(key);
}
