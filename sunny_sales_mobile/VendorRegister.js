import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from './src/config';

export default function VendorRegister({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    if (!name || !email || !password || !product) {
      setError('Preencha todos os campos');
      return;
    }
    try {
      await axios.post(`${BASE_URL}/vendors/`, {
        name,
        email,
        password,
        product,
      });
      setSuccess('Registo efetuado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setProduct('');
    } catch (e) {
      setError('Erro ao registar');
    }
  };

  return (
    <View>
      <Text style={styles.title}>Registo de Vendedor</Text>
      <TextInput
        placeholder="Nome"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Palavra-passe"
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Produto"
        style={styles.input}
        value={product}
        onChangeText={setProduct}
      />
      <Button title="Registar" onPress={handleRegister} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Button title="Voltar" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, marginBottom: 20, color: '#FDF38A' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  error: { color: 'red', marginTop: 10 },
  success: { color: 'green', marginTop: 10 },
});
