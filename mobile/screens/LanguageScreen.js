import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import t, { setLanguage, getLanguage } from '../i18n';

export default function LanguageScreen() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    getLanguage().then(setLang);
  }, []);

  const onChange = async (value) => {
    setLang(value);
    await setLanguage(value);
  };

  return (
    <View style={styles.container} accessible accessibilityLabel={t('languageTitle')}>
      <Text style={styles.title}>{t('languageTitle')}</Text>
      <RadioButton.Group onValueChange={onChange} value={lang}>
        <RadioButton.Item label={t('english')} value="en" />
        <RadioButton.Item label={t('portuguese')} value="pt" />
      </RadioButton.Group>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 16 },
});
