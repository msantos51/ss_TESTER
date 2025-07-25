// Tela de recuperação de palavra-passe
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import LoadingDots from '../LoadingDots';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // requestReset
  const requestReset = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BASE_URL}/password-reset-request`, { email });
      Alert.alert('Pedido enviado', 'Verifique o seu e-mail para definir nova palavra-passe.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      setError('Falha ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Email"
        value={email}
        onChangeText={(t) => setEmail(t)}
        autoCapitalize="none"
      />
      {loading ? (
        <LoadingDots />
      ) : (
        <Button mode="contained" onPress={requestReset} disabled={!email}>
          <Text>Enviar</Text>
        </Button>
      )}
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
});
