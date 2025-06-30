// (em português) Página de registo do cliente na versão web

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

export default function ClientRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const register = async () => {
    if (!name || !email || !password) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (password.length < 8 || password.toLowerCase() === password) {
      setError('Palavra-passe deve ter 8 caracteres e uma letra maiúscula');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('password', password);
      if (profilePhoto) {
        data.append('profile_photo', profilePhoto);
      }

      await axios.post(`${BASE_URL}/clients/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Registo efetuado! Verifique o seu email para confirmar.');
      navigate('/login');
    } catch (err) {
      console.error('Erro no registo:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocorreu um erro ao registar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Registo de Cliente</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        style={styles.input}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Palavra-passe"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        style={styles.input}
      />

      <input type="file" accept="image/*" onChange={pickImage} style={styles.fileInput} />

      {profilePhoto && (
        <img
          src={URL.createObjectURL(profilePhoto)}
          alt="Pré-visualização"
          style={styles.imagePreview}
        />
      )}

      <button onClick={register} style={styles.button} disabled={loading}>
        {loading ? 'A enviar...' : 'Registar'}
      </button>
    </div>
  );
}

// (em português) Estilos embutidos
const styles = {
  container: {
    maxWidth: '400px',
    margin: '5rem auto',
    padding: '2rem',
    backgroundColor: '#f6f6f6',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  fileInput: {
    marginBottom: '1rem',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#f9c200',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
};
