import React, { useState, useEffect, useRef } from 'react';
import {
  FiPlus, FiX, FiTrash2, FiEdit2, FiCheck, FiImage, FiCamera, FiAlertTriangle,
} from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config.js';
import ImageCropper from '../components/ImageCropper';
import '../styles/ProductsScreen.css';

const MAX_PRODUCTS = 10;

export default function ProductsScreen({ auth, onClose }) {
  // Sem `onClose` o ecrã é um separador de página inteira; com ele mantém-se
  // como bottom sheet (usado a partir de outros ecrãs).
  const asTab = typeof onClose !== 'function';
  const { token, vendorId } = auth;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulário de adição
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const addFileRef = useRef(null);
  const addCameraRef = useRef(null);

  // Edição inline
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editCropSrc, setEditCropSrc] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const editFileRef = useRef(null);
  const editCameraRef = useRef(null);

  // Apagar é destrutivo e chama a API: confirma-se na própria linha.
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/vendors/${vendorId}/products`, {
          headers: authHeader,
        });
        if (!response.ok) throw new Error('Não foi possível carregar produtos');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, token]);

  // ---------- Adicionar ----------
  const handlePhotoChange = (e) => {
    if (e.target.files?.[0]) setCropSrc(URL.createObjectURL(e.target.files[0]));
    e.target.value = '';
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
    setFormError('');
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) closeForm();
    else { resetForm(); setShowForm(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const data = new FormData();
      data.append('name', name);
      data.append('price', price);
      if (photo) data.append('photo', new File([photo], 'product.jpg', { type: 'image/jpeg' }));
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/products`, {
        method: 'POST',
        headers: authHeader,
        body: data,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || 'Erro ao adicionar produto');
      setProducts((prev) => [body, ...prev]);
      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Editar ----------
  const startEdit = (product) => {
    setConfirmingDelete(null);
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
    if (e.target.files?.[0]) setEditCropSrc(URL.createObjectURL(e.target.files[0]));
    e.target.value = '';
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
    setEditSaving(true);
    setEditError('');
    try {
      const data = new FormData();
      data.append('name', editName);
      data.append('price', editPrice);
      if (editPhoto) data.append('photo', new File([editPhoto], 'product.jpg', { type: 'image/jpeg' }));
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/products/${productId}`, {
        method: 'PUT',
        headers: authHeader,
        body: data,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || 'Erro ao guardar alterações');
      setProducts((prev) => prev.map((p) => (p.id === productId ? body : p)));
      cancelEdit();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // ---------- Remover ----------
  const handleDelete = async (productId) => {
    setConfirmingDelete(null);
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/products/${productId}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      if (!res.ok) throw new Error('Erro ao remover produto');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPrice = (value) => `${parseFloat(value).toFixed(2).replace('.', ',')} €`;
  const atLimit = products.length >= MAX_PRODUCTS;

  const photoFields = (preview, cameraRef, fileRef, onChange) => (
    <div className="product-form-photo">
      {preview ? (
        <img src={preview} alt="" className="product-form-thumb" />
      ) : (
        <span className="product-form-thumb is-placeholder"><FiImage size={22} /></span>
      )}
      <div className="product-form-photo-btns">
        <button type="button" className="product-photo-btn" onClick={() => cameraRef.current?.click()}>
          <FiCamera size={14} /> Tirar foto
        </button>
        <button type="button" className="product-photo-btn is-ghost" onClick={() => fileRef.current?.click()}>
          <FiImage size={14} /> Galeria
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onChange} style={{ display: 'none' }} />
      <input ref={fileRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div className={asTab ? 'products-screen' : 'products-overlay'}>
      <div className={asTab ? 'products-panel' : 'products-sheet'}>
        <div className="screen-head">
          <div className="screen-head-text">
            <h2 className="screen-title">Produtos</h2>
            <p className="screen-subtitle">
              {products.length} de {MAX_PRODUCTS} · visíveis no teu perfil
            </p>
          </div>
          {asTab ? (
            <button
              type="button"
              className={`product-add-fab${showForm ? ' is-open' : ''}`}
              onClick={toggleForm}
              disabled={atLimit && !showForm}
              aria-label={showForm ? 'Fechar formulário' : 'Adicionar produto'}
              aria-expanded={showForm}
            >
              {showForm ? <FiX size={20} /> : <FiPlus size={20} />}
            </button>
          ) : (
            <button type="button" className="ss-sheet-close" onClick={onClose} aria-label="Fechar">
              <FiX size={18} />
            </button>
          )}
        </div>

        <div className="products-body">
          {error && (
            <div className="ss-error">
              <FiAlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}

          {atLimit && (
            <p className="products-limit">
              Atingiste o limite de {MAX_PRODUCTS} produtos. Remove um para adicionar outro.
            </p>
          )}

          {showForm && !atLimit && (
            <form className="product-form" onSubmit={handleSubmit}>
              <span className="product-form-title">Novo produto</span>
              {photoFields(photoPreview, addCameraRef, addFileRef, handlePhotoChange)}

              <input
                className="product-input"
                type="text"
                placeholder="Nome do produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="product-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço (€)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              {formError && (
                <div className="ss-error">
                  <FiAlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="product-form-actions">
                <button type="button" className="product-btn-cancel" onClick={closeForm} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="product-btn-save" disabled={saving}>
                  {saving ? 'A guardar…' : 'Guardar'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="products-list">
              {[0, 1, 2].map((i) => <span key={i} className="ss-skeleton product-skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            !error && (
              <div className="ss-empty">
                <span className="ss-empty-icon"><FiImage size={22} /></span>
                <h3>Ainda não tens produtos</h3>
                <p>Os produtos que adicionares aqui aparecem no teu perfil público.</p>
                {!showForm && (
                  <button type="button" className="ss-empty-cta" onClick={toggleForm}>
                    Adicionar o primeiro
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="products-list">
              {products.map((product) => (
                editingId === product.id ? (
                  <form
                    key={product.id}
                    className="product-form"
                    onSubmit={(e) => handleEditSubmit(e, product.id)}
                  >
                    <span className="product-form-title">Editar produto</span>
                    {photoFields(editPhotoPreview, editCameraRef, editFileRef, handleEditPhotoChange)}

                    <input
                      className="product-input"
                      type="text"
                      placeholder="Nome do produto"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <input
                      className="product-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Preço (€)"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                    />

                    {editError && (
                      <div className="ss-error">
                        <FiAlertTriangle size={17} />
                        <span>{editError}</span>
                      </div>
                    )}

                    <div className="product-form-actions">
                      <button type="button" className="product-btn-cancel" onClick={cancelEdit} disabled={editSaving}>
                        Cancelar
                      </button>
                      <button type="submit" className="product-btn-save" disabled={editSaving}>
                        <FiCheck size={15} /> {editSaving ? 'A guardar…' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="product-row" key={product.id}>
                    {product.photo ? (
                      <img src={mediaUrl(product.photo)} alt="" className="product-thumb" />
                    ) : (
                      <span className="product-thumb is-placeholder"><FiImage size={22} /></span>
                    )}

                    <div className="product-row-main">
                      <span className="product-row-name">{product.name}</span>
                      <span className="product-row-price">{formatPrice(product.price)}</span>
                    </div>

                    {confirmingDelete === product.id ? (
                      <div className="product-row-confirm">
                        <span className="product-row-confirm-text">Apagar?</span>
                        <button
                          type="button"
                          className="product-row-btn is-danger"
                          onClick={() => handleDelete(product.id)}
                          aria-label={`Confirmar apagar ${product.name}`}
                        >
                          <FiCheck size={17} />
                        </button>
                        <button
                          type="button"
                          className="product-row-btn"
                          onClick={() => setConfirmingDelete(null)}
                          aria-label="Cancelar"
                        >
                          <FiX size={17} />
                        </button>
                      </div>
                    ) : (
                      <div className="product-row-actions">
                        <button
                          type="button"
                          className="product-row-btn"
                          onClick={() => startEdit(product)}
                          aria-label={`Editar ${product.name}`}
                        >
                          <FiEdit2 size={17} />
                        </button>
                        <button
                          type="button"
                          className="product-row-btn is-danger"
                          onClick={() => setConfirmingDelete(product.id)}
                          aria-label={`Remover ${product.name}`}
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropper src={cropSrc} onCancel={handleCropCancel} onComplete={handleCropComplete} />
      )}
      {editCropSrc && (
        <ImageCropper src={editCropSrc} onCancel={handleEditCropCancel} onComplete={handleEditCropComplete} />
      )}
    </div>
  );
}
