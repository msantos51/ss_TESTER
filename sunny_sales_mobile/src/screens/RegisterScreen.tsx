import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleRegister = async () => {
    setError(null);
    try {
      if (!photo) {
        setError('É necessária uma foto de perfil.');
        return;
      }
      await register(name, email, password, product, photo);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Registo efetuado!</Text>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          Verifique o seu email para confirmar a conta antes de iniciar sessão.
        </Text>
        <Button title="Ir para o Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registo</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Produto"
        value={product}
        onChangeText={setProduct}
      />

      <Button title="Selecionar Foto" onPress={pickPhoto} />

      {photo && (
        <Image
          source={{ uri: photo }}
          style={{ width: 100, height: 100, marginVertical: 10 }}
        />
      )}

      <Button title="Registar" onPress={handleRegister} />

      <Button title="Voltar ao Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
});
