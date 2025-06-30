// (em português) Página Web para registo de vendedores
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function VendorRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // # Função para selecionar imagem
  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // # Função para registar
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !product) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (password.length < 8 || password.toLowerCase() === password) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres e uma letra maiúscula');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('product', product);

    if (photo) {
      formData.append('profile_photo', photo);
    }

    try {
      await axios.post(`${BASE_URL}/vendors/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Registo efetuado com sucesso! Verifique o seu email.');
      setName('');
      setEmail('');
      setPassword('');
      setProduct('');
      setPhoto(null);
    } catch (err) {
      console.error('Erro:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Erro ao registar. Tente novamente.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registo de Vendedor</h2>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          style={styles.input}
        >
          <option value="">Selecione um produto</option>
          <option value="Bolas de Berlim">Bolas de Berlim</option>
          <option value="Gelados">Gelados</option>
          <option value="Acessórios">Acessórios</option>
        </select>

        <input type="file" onChange={handlePhotoChange} style={styles.input} />
        <button type="submit" style={styles.button}>Registar</button>
      </form>
    </div>
  );
}

// # Estilos simples para layout Web
const styles = {
  container: { padding: '2rem', maxWidth: '500px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    padding: '0.75rem',
    marginBottom: '1rem',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#f9c200',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  error: { color: 'red', marginBottom: '1rem' },
  success: { color: 'green', marginBottom: '1rem' },
};
