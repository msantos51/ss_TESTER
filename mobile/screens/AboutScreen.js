import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { theme } from '../theme';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre e Ajuda</Text>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Terms')}
        style={styles.button}
      >
        Termos e Condições
      </Button>
      <Button
        mode="outlined"
        onPress={() => Linking.openURL('mailto:suporte@sunnysales.com')}
        style={styles.button}
      >
        Contactar Suporte
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  button: { marginBottom: 12 },
});
