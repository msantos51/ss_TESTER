import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import { theme } from '../theme';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Sobre e Ajuda" titleStyle={styles.title} />
        <Divider />
        <Card.Content>
          <Button
            mode="contained"
            icon="file-document-outline"
            onPress={() => navigation.navigate('Terms')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Termos e Condições
          </Button>

          <Button
            mode="contained"
            icon="email-outline"
            onPress={() => Linking.openURL('mailto:suporte@sunnysales.com')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Contactar Suporte
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  card: {
    padding: 8,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});
