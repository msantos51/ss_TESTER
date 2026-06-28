import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mediaUrl } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import ImageCropper from '../components/ImageCropper';
import { FiShoppingBag, FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import './ProductsScreen.css';

const MAX_PRODUCTS = 10;

export default function ProductsScreen() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { setLoading(false); return; }
    setVendor(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!vendor) return;
    axios.get(`${BASE_URL}/vendors/${vendor.id}/products`)
      .then(res => setProducts(res.data))
      .catch(e => console.error('Erro ao carregar produtos:', e))
      .finally(() => setLoading(false));
  }, [vendor]);

  const handlePhotoChange = (e) => {
    if (e.target.files?.[0]) {
      setCropSrc(URL.createObjectURL(e.target.files[0]));
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
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(blob));
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', name);
      data.append('price', price);
      if (photo) {
        data.append('photo', new File([photo], 'product.jpg', { type: 'image/jpeg' }));
      }
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/products`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      setProducts(prev => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao adicionar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!vendor) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BASE_URL}/vendors/${vendor.id}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Erro ao remover produto:', err);
    }
  };

  return (
    <div className="ps-wrapper">
      <BackHomeButton />
      <div className="ps-container">

        <div className="ps-header">
          <div className="ps-header-icon"><FiShoppingBag /></div>
          <div>
            <h1 className="ps-title">Produtos</h1>
            <p className="ps-subtitle">Adiciona e gere os produtos que vendes</p>
          </div>
        </div>

        <p className="ps-limit-info">
          Podes adicionar até <strong>{MAX_PRODUCTS} produtos</strong> ({products.length}/{MAX_PRODUCTS})
        </p>

        {products.length >= MAX_PRODUCTS && (
          <p className="ps-limit-warning">
            Atingiste o limite de {MAX_PRODUCTS} produtos. Remove um produto para adicionar outro.
          </p>
        )}

        {products.length < MAX_PRODUCTS && (
        <form className="ps-form" onSubmit={handleSubmit}>
          <div className="ps-form-photo-section">
            {photoPreview ? (
              <img src={photoPreview} alt="Pré-visualização" className="ps-form-photo" />
            ) : (
              <div className="ps-form-photo ps-form-photo-placeholder">
                <FiShoppingBag />
              </div>
            )}
            <label className="ps-photo-btn">
              Escolher foto
              <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="ps-form-field">
            <label className="ps-form-label">Nome do produto</label>
            <input
              className="ps-form-input"
              type="text"
              placeholder="Ex: Gelado de morango"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="ps-form-field">
            <label className="ps-form-label">Preço (€)</label>
            <input
              className="ps-form-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          {error && <p className="ps-form-error">{error}</p>}

          <button type="submit" className="ps-form-submit" disabled={saving}>
            <FiPlus /> {saving ? 'A adicionar…' : 'Adicionar produto'}
          </button>
        </form>
        )}

        {loading && (
          <div className="ps-loading">
            <div className="ps-spinner" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="ps-empty">
            <FiShoppingBag className="ps-empty-icon" />
            <p>Ainda não tens produtos adicionados.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <ul className="ps-list">
            {products.map((p) => (
              <li key={p.id} className="ps-item">
                {p.photo ? (
                  <img src={mediaUrl(p.photo)} alt={p.name} className="ps-item-photo" />
                ) : (
                  <div className="ps-item-photo ps-item-photo-placeholder">
                    <FiShoppingBag />
                  </div>
                )}
                <div className="ps-item-body">
                  <span className="ps-item-name">{p.name}</span>
                  <span className="ps-item-price"><FiTag /> {p.price.toFixed(2)} €</span>
                </div>
                <button
                  type="button"
                  className="ps-item-delete"
                  onClick={() => handleDelete(p.id)}
                  aria-label="Remover produto"
                >
                  <FiTrash2 />
                </button>
              </li>
            ))}
          </ul>
        )}

        {cropSrc && (
          <ImageCropper
            src={cropSrc}
            onCancel={handleCropCancel}
            onComplete={handleCropComplete}
          />
        )}
      </div>
    </div>
  );
}
