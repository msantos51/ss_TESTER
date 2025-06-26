// Ecrã para gestão de conta com mudança e remoção de utilizador
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function ManageAccountScreen() {
  const [password, setPassword] = React.useState('');

  const changePassword = () => {
    Alert.alert('Funcionalidade indisponível');
  };

  const deleteAccount = () => {
    Alert.alert('Funcionalidade indisponível');
  };

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <Text style={styles.title}>Definições</Text>
      <TextInput
        mode="outlined"
        label="Nova palavra-passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {/* Botão para alterar a palavra-passe */}
      <Button mode="contained" onPress={changePassword} style={styles.button}>
        <Text>Alterar Palavra-passe</Text>
      </Button>
      {/* Botão para apagar a conta */}
      <Button mode="contained" onPress={deleteAccount} style={styles.button}>
        <Text>Apagar Conta</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginBottom: 12 },
  back: { position: 'absolute', top: 16, left: 16 },
});
