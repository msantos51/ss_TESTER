import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mediaUrl } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import ImageCropper from '../components/ImageCropper';
import { FiShoppingBag, FiPlus, FiTrash2, FiTag, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
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

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editCropSrc, setEditCropSrc] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

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

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditPhoto(null);
    setEditPhotoPreview(product.photo ? mediaUrl(product.photo) : null);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setEditError('');
  };

  const handleEditPhotoChange = (e) => {
    if (e.target.files?.[0]) {
      setEditCropSrc(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleEditCropCancel = () => {
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setEditCropSrc(null);
  };

  const handleEditCropComplete = (blob) => {
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setEditCropSrc(null);
    setEditPhoto(blob);
    setEditPhotoPreview(URL.createObjectURL(blob));
  };

  const handleEditSubmit = async (e, productId) => {
    e.preventDefault();
    if (!vendor) return;
    setEditSaving(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', editName);
      data.append('price', editPrice);
      if (editPhoto) {
        data.append('photo', new File([editPhoto], 'product.jpg', { type: 'image/jpeg' }));
      }
      const res = await axios.put(
        `${BASE_URL}/vendors/${vendor.id}/products/${productId}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      setProducts(prev => prev.map(p => (p.id === productId ? res.data : p)));
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Erro ao guardar alterações');
    } finally {
      setEditSaving(false);
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
              editingId === p.id ? (
                <li key={p.id} className="ps-item ps-item-editing">
                  <form className="ps-edit-form" onSubmit={(e) => handleEditSubmit(e, p.id)}>
                    <div className="ps-form-photo-section">
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt="Pré-visualização" className="ps-form-photo" />
                      ) : (
                        <div className="ps-form-photo ps-form-photo-placeholder">
                          <FiShoppingBag />
                        </div>
                      )}
                      <label className="ps-photo-btn">
                        Mudar foto
                        <input type="file" accept="image/*" hidden onChange={handleEditPhotoChange} />
                      </label>
                    </div>

                    <div className="ps-form-field">
                      <label className="ps-form-label">Nome do produto</label>
                      <input
                        className="ps-form-input"
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
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
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        required
                      />
                    </div>

                    {editError && <p className="ps-form-error">{editError}</p>}

                    <div className="ps-edit-actions">
                      <button type="button" className="ps-edit-cancel" onClick={cancelEdit} disabled={editSaving}>
                        <FiX /> Cancelar
                      </button>
                      <button type="submit" className="ps-edit-save" disabled={editSaving}>
                        <FiCheck /> {editSaving ? 'A guardar…' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
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
                    className="ps-item-edit"
                    onClick={() => startEdit(p)}
                    aria-label="Editar produto"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="ps-item-delete"
                    onClick={() => handleDelete(p.id)}
                    aria-label="Remover produto"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              )
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

        {editCropSrc && (
          <ImageCropper
            src={editCropSrc}
            onCancel={handleEditCropCancel}
            onComplete={handleEditCropComplete}
          />
        )}
      </div>
    </div>
  );
}
