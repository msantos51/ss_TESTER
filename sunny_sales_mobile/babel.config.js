// (em português) Usa apenas o preset oficial do Expo e deixa o plugin do Reanimated por último.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin' // manter sempre por último
    ],
  };
};
