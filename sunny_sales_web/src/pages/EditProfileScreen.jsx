import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedVendor = localStorage.getItem('user');
    const storedClient = localStorage.getItem('client');
    if (storedVendor) {
      const v = JSON.parse(storedVendor);
      setUser(v);
      setIsClient(false);
      setName(v.name || '');
      setEmail(v.email || '');
      setProduct(v.product || '');
    } else if (storedClient) {
      const c = JSON.parse(storedClient);
      setUser(c);
      setIsClient(true);
      setName(c.name || '');
      setEmail(c.email || '');
    }
  }, []);

  const handlePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!user) return;
    const data = new FormData();
    if (name !== user.name) data.append('name', name);
    if (email !== user.email) data.append('email', email);
    if (!isClient && product !== user.product) data.append('product', product);
    if (photo) data.append('profile_photo', photo);
    const token = localStorage.getItem(isClient ? 'clientToken' : 'token');
    try {
      const url = isClient
        ? `${BASE_URL}/clients/${user.id}/profile`
        : `${BASE_URL}/vendors/${user.id}/profile`;
      const res = await axios.patch(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem(isClient ? 'client' : 'user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch {
      setError('Erro ao atualizar');
    }
  };

  if (!user) return <p>Utilizador não autenticado.</p>;

  return (
    <div className="form-box">
      <h2 className="title">Editar Perfil</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={save} className="form">
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
          {!isClient && (
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="input"
            >
              <option value="Bolas de Berlim">Bolas de Berlim</option>
              <option value="Gelados">Gelados</option>
              <option value="Acessórios">Acessórios</option>
            </select>
          )}
          <input type="file" onChange={handlePhoto} className="input" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/dashboard')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
