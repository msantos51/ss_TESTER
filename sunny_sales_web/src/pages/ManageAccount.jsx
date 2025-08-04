// (em português) Página Web para gestão de conta (alterar/remover conta)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import ImageCropper from '../components/ImageCropper';

// Página para o vendedor atualizar ou remover a sua conta
export default function ManageAccount() {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [pinColor, setPinColor] = useState('#FFB6C1');
  const [photo, setPhoto] = useState(null); // blob da foto cortada
  const [cropSrc, setCropSrc] = useState(null);
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

  // Abre a interface de corte ao selecionar uma imagem
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropSrc(url);
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropComplete = (blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPhoto(blob);
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
      if (photo) {
        const file = new File([photo], 'profile.jpg', { type: 'image/jpeg' });
        data.append('profile_photo', file);
      }
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
      console.error(err);
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'black' }}>{success}</p>}
        <span className="input-span">
          <label className="label">Nome</label>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </span>
        <span className="input-span">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </span>
        <span className="input-span">
          <label className="label">Palavra-passe atual</label>
          <input
            type="password"
            placeholder="Palavra-passe atual"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </span>
        <span className="input-span">
          <label className="label">Nova palavra-passe</label>
          <input
            type="password"
            placeholder="Nova palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </span>
        <span className="input-span">
          <label className="label">Produto</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="Bolas de Berlim">Bolas de Berlim</option>
            <option value="Gelados">Gelados</option>
            <option value="Acessórios">Acessórios</option>
          </select>
        </span>
        <span className="input-span">
          <label className="label">Cor do Pin</label>
          <input
            type="color"
            value={pinColor}
            onChange={(e) => setPinColor(e.target.value)}
            style={{ backgroundColor: pinColor }}
          />
        </span>
        <span className="input-span">
          <label className="label">Foto</label>
          <input type="file" onChange={handlePhotoChange} />
        </span>
        <button type="submit" className="submit">Guardar</button>
      </form>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

