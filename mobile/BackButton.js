import React from 'react';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { theme } from './theme';

export default function BackButton({ style }) {
  // navigation
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <IconButton
      icon="arrow-left"
      size={28}
      onPress={navigation.goBack}
      style={style}
      accessibilityLabel="Voltar"
      iconColor={theme.colors.primary}
    />
  );
}

