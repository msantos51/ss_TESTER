import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    statsTitle: 'Stats',
    noRoutes: 'No routes recorded',
    favorites: 'Favorites',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove favorite',
  },
  pt: {
    statsTitle: 'Estatísticas',
    noRoutes: 'Nenhum trajeto registado',
    favorites: 'Favoritos',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover favorito',
  },
};

const i18n = new I18n(translations);
i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default (key) => i18n.t(key);
