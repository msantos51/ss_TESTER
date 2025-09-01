import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  // Campo para o produto vendido
  const [product, setProduct] = useState('');
  // URI da foto de perfil escolhida
  const [photo, setPhoto] = useState<string | null>(null);

  // Função de registo disponibilizada pelo contexto
  const { register } = useContext(AuthContext);

  // Abre a galeria para o utilizador escolher uma foto
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Trata o envio do formulário
  const handleRegister = async () => {
    try {
      if (!photo) {
        throw new Error('É necessária uma foto de perfil.');
      }
      await register(name, email, password, product, photo);
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

      {/* Campo para o produto */}
      <TextInput
        style={styles.input}
        placeholder="Product"
        value={product}
        onChangeText={setProduct}
      />

      {/* Botão para escolher a foto de perfil */}
      <Button title="Selecionar Foto" onPress={pickPhoto} />

      {/* Pré-visualização da foto escolhida */}
      {photo && (
        <Image
          source={{ uri: photo }}
          style={{ width: 100, height: 100, marginVertical: 10 }}
        />
      )}

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
