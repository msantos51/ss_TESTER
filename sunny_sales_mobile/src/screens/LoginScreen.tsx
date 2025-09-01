import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

/**
 * Ecrã responsável pelo login do utilizador.
 * Contém formulário e utiliza o contexto de autenticação para iniciar a sessão.
 */
export default function LoginScreen({ navigation }: any) {
  // Estados locais para email e palavra-passe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Função de login disponibilizada pelo contexto
  const { login } = useContext(AuthContext);

  // Trata o envio do formulário
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Após login, volta ao mapa
      navigation.navigate('Map');
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    // Estrutura principal do ecrã
    <View style={styles.container}>
      {/* Título do formulário */}
      <Text style={styles.title}>Login</Text>

      {/* Campo para inserir o email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Campo para inserir a palavra-passe */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botão que executa o login */}
      <Button title="Login" onPress={handleLogin} />

      {/* Botão que navega para o ecrã de registo */}
      <Button title="Registar" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

// Estilos utilizados neste ecrã
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});
