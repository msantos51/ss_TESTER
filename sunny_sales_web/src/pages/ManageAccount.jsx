// (em português) Página Web para gestão de conta (alterar/remover conta)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

// Página para o vendedor atualizar ou remover a sua conta
export default function ManageAccount() {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [pinColor, setPinColor] = useState('#FFB6C1');
  const [photo, setPhoto] = useState(null);
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const v = JSON.parse(stored);
      setVendor(v);
      setName(v.name || '');
      setEmail(v.email || '');
      setProduct(v.product || '');
      setPinColor(v.pin_color || '#FFB6C1');
    }
  }, []);

  // Guarda a foto enviada no formulário
  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // Envia as alterações do formulário para o backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    try {
      const data = new FormData();
      if (name !== vendor.name) data.append('name', name);
      if (email !== vendor.email) data.append('email', email);
      if (password) {
        data.append('new_password', password);
        data.append('old_password', oldPassword);
      }
      if (product !== vendor.product) data.append('product', product);
      if (pinColor !== (vendor.pin_color || '#FFB6C1'))
        data.append('pin_color', pinColor);
      if (photo) data.append('profile_photo', photo);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.setItem('user', JSON.stringify(res.data));
      setVendor(res.data);
      setSuccess('Dados atualizados com sucesso');
      setError('');
      setPassword('');
      setOldPassword('');
      setPhoto(null);
    } catch (err) {
      setError('Erro ao atualizar');
      setSuccess('');
    }
  };

  if (!vendor) {
    return (
      <div className="form-box">
        <h2 className="title">Definições de Conta</h2>
        <p>Utilizador não autenticado.</p>
      </div>
    );
  }

  return (
    <div className="form-box">
      <h2 className="title">Definições de Conta</h2>
      <form onSubmit={handleUpdate} className="form">
        <div className="form-container">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
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
            placeholder="Palavra-passe atual"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Nova palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="input"
          >
            <option value="Bolas de Berlim">Bolas de Berlim</option>
            <option value="Gelados">Gelados</option>
            <option value="Acessórios">Acessórios</option>
          </select>
          <label style={{ marginTop: '0.5rem' }}>Cor do Pin:</label>
          <input
            type="color"
            value={pinColor}
            onChange={(e) => setPinColor(e.target.value)}
            className="input"
          />
          <input type="file" onChange={handlePhotoChange} className="input" />
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

