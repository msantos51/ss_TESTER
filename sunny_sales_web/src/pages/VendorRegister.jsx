// (em português) Página Web para registo de vendedores
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import ImageCropper from '../components/ImageCropper';

// Formulário de registo para novos vendedores
export default function VendorRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState(null); // blob da foto cortada
  const [cropSrc, setCropSrc] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Abre o recorte ao selecionar uma foto
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
      const file = new File([photo], 'profile.jpg', { type: 'image/jpeg' });
      formData.append('profile_photo', file);
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
      <h2 className="title auth-title">Registo de Vendedor</h2>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'black', marginBottom: '1rem' }}>{success}</p>}

      <form onSubmit={handleRegister} className="form login-form auth-form">
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
          <label className="label">Palavra-passe</label>
          <input
            type="password"
            placeholder="Palavra-passe"
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
            <option value="">Selecione um produto</option>
            <option value="Bolas de Berlim">Bolas de Berlim</option>
            <option value="Gelados">Gelados</option>
            <option value="Acessórios">Acessórios</option>
          </select>
        </span>
        <span className="input-span">
          <label className="label">Foto</label>
          <input type="file" onChange={handlePhotoChange} />
        </span>
        <button type="submit" className="submit">Registar</button>
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

