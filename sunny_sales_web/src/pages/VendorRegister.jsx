// (em português) Página Web para registo de vendedores
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

// Formulário de registo para novos vendedores
export default function VendorRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Guarda a imagem de perfil selecionada
  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // Envia os dados de registo do vendedor
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
    <div className="form-box">
      <h2 className="title">Registo de Vendedor</h2>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

      <form onSubmit={handleRegister} className="form">
        <div className="form-container">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="input"
          >
            <option value="">Selecione um produto</option>
            <option value="Bolas de Berlim">Bolas de Berlim</option>
            <option value="Gelados">Gelados</option>
            <option value="Acessórios">Acessórios</option>
          </select>

          <input type="file" onChange={handlePhotoChange} className="input" />
        </div>
        <button type="submit">Registar</button>
      </form>
    </div>
  );
}

