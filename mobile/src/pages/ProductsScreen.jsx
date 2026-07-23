import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL, mediaUrl } from '../config.js';
import ImageCropper from '../components/ImageCropper';
import '../styles/ProductsScreen.css';

const MAX_PRODUCTS = 10;

const ShoppingBagIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const PlusIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ProductsScreen({ auth, onClose }) {
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

  const formatPrice = (value) => `€${parseFloat(value).toFixed(2).replace('.', ',')}`;
  const atLimit = products.length >= MAX_PRODUCTS;

  return (
    <div className="products-overlay">
      <div className="products-sheet">
        <div className="products-header">
          <h2>Produtos</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <CloseIcon size={22} />
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="products-loading">
            <span className="loading-dots"><span /><span /><span /></span>
            <p>A carregar produtos…</p>
          </div>
        ) : (
          <div className="products-body">
            <p className="products-limit-info">
              {products.length}/{MAX_PRODUCTS} produtos
            </p>

            {/* Adicionar produto */}
            {atLimit ? (
              <p className="products-limit-warning">
                Atingiste o limite de {MAX_PRODUCTS} produtos. Remove um para adicionar outro.
              </p>
            ) : showForm ? (
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="product-form-photo-row">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Pré-visualização" className="product-form-photo" />
                  ) : (
                    <div className="product-form-photo product-form-photo-placeholder">
                      <ShoppingBagIcon size={22} />
                    </div>
                  )}
                  <button
                    type="button"
                    className="product-photo-btn"
                    onClick={() => addFileRef.current?.click()}
                  >
                    Escolher foto
                  </button>
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="product-form-field">
                  <label className="product-form-label">Nome do produto</label>
                  <input
                    className="product-form-input"
                    type="text"
                    placeholder="Ex: Gelado de morango"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="product-form-field">
                  <label className="product-form-label">Preço (€)</label>
                  <input
                    className="product-form-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                {formError && <div className="product-form-error">{formError}</div>}

                <div className="product-form-actions">
                  <button type="button" className="product-form-cancel" onClick={closeForm} disabled={saving}>
                    <CloseIcon size={15} /> Cancelar
                  </button>
                  <button type="submit" className="product-form-submit" disabled={saving}>
                    <PlusIcon size={15} /> {saving ? 'A adicionar…' : 'Adicionar'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="btn btn-primary product-add-btn"
                onClick={() => setShowForm(true)}
              >
                <PlusIcon size={16} /> Adicionar produto
              </button>
            )}

            {/* Lista de produtos */}
            {products.length === 0 ? (
              <div className="products-empty">
                <div className="products-empty-icon"><ShoppingBagIcon size={40} /></div>
                <h3>Nenhum produto adicionado</h3>
                <p>Começa a adicionar produtos para aumentar a visibilidade das tuas ofertas.</p>
              </div>
            ) : (
              <div className="products-list">
                {products.map((product) =>
                  editingId === product.id ? (
                    <div key={product.id} className="product-item product-item-editing">
                      <form className="product-form" onSubmit={(e) => handleEditSubmit(e, product.id)}>
                        <div className="product-form-photo-row">
                          {editPhotoPreview ? (
                            <img src={editPhotoPreview} alt="Pré-visualização" className="product-form-photo" />
                          ) : (
                            <div className="product-form-photo product-form-photo-placeholder">
                              <ShoppingBagIcon size={22} />
                            </div>
                          )}
                          <button
                            type="button"
                            className="product-photo-btn"
                            onClick={() => editFileRef.current?.click()}
                          >
                            Mudar foto
                          </button>
                          <input
                            ref={editFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoChange}
                            style={{ display: 'none' }}
                          />
                        </div>

                        <div className="product-form-field">
                          <label className="product-form-label">Nome do produto</label>
                          <input
                            className="product-form-input"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="product-form-field">
                          <label className="product-form-label">Preço (€)</label>
                          <input
                            className="product-form-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            required
                          />
                        </div>

                        {editError && <div className="product-form-error">{editError}</div>}

                        <div className="product-form-actions">
                          <button type="button" className="product-form-cancel" onClick={cancelEdit} disabled={editSaving}>
                            <CloseIcon size={15} /> Cancelar
                          </button>
                          <button type="submit" className="product-form-submit" disabled={editSaving}>
                            <CheckIcon size={15} /> {editSaving ? 'A guardar…' : 'Guardar'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div key={product.id} className="product-item">
                      {product.photo ? (
                        <div className="product-item-image">
                          <img src={mediaUrl(product.photo)} alt={product.name} />
                        </div>
                      ) : (
                        <div className="product-item-image product-item-image-placeholder">
                          <ShoppingBagIcon size={22} />
                        </div>
                      )}
                      <div className="product-item-content">
                        <h3 className="product-item-name">{product.name}</h3>
                        <div className="product-item-price">{formatPrice(product.price)}</div>
                      </div>
                      <div className="product-item-actions">
                        <button
                          type="button"
                          className="product-item-action"
                          onClick={() => startEdit(product)}
                          aria-label="Editar produto"
                        >
                          <EditIcon size={17} />
                        </button>
                        <button
                          type="button"
                          className="product-item-action product-item-action-danger"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Remover produto"
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
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
