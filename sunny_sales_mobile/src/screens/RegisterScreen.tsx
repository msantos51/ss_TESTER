import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

/**
 * Ecrã responsável pelo registo de novos utilizadores.
 * Contém formulário com nome, email e palavra-passe.
 */
export default function RegisterScreen({ navigation }: any) {
  // Estados locais para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Função de registo disponibilizada pelo contexto
  const { register } = useContext(AuthContext);

  // Trata o envio do formulário
  const handleRegister = async () => {
    try {
      await register(name, email, password);
      // Após registo, o token é guardado e o utilizador fica autenticado
    } catch (error) {
      console.error('Erro no registo:', error);
    }
  };

  return (
    // Estrutura principal do ecrã
    <View style={styles.container}>
      {/* Título do formulário */}
      <Text style={styles.title}>Registo</Text>

      {/* Campo para o nome do utilizador */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Campo para o email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Campo para a palavra-passe */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botão que executa o registo */}
      <Button title="Registar" onPress={handleRegister} />

      {/* Botão para voltar ao ecrã de login */}
      <Button title="Voltar ao Login" onPress={() => navigation.navigate('Login')} />
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
