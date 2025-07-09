// (em português) Página de registo do cliente na versão web

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import LoadingDots from '../components/LoadingDots';

// Componente de registo de novos clientes
export default function ClientRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Trata a seleção de uma foto de perfil
  const pickImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  // Envia os dados de registo para o servidor
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
    <div className="form-box">
      <h2 className="title">Registo de Cliente</h2>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <div className="form login-form">
        <div className="form-container login-container">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className="input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="input"
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="input"
          />
          <input type="file" accept="image/*" onChange={pickImage} className="input" />
        </div>
        {profilePhoto && (
          <img
            src={URL.createObjectURL(profilePhoto)}
            alt="Pré-visualização"
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '1rem auto',
            }}
          />
        )}
        <button onClick={register} disabled={loading}>
          {loading ? <LoadingDots /> : 'Registar'}
        </button>
      </div>
    </div>
  );
}

