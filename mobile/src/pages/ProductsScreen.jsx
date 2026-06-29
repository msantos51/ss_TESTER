import React, { useState, useEffect } from 'react';
import { BASE_URL, mediaUrl } from '../config.js';
import '../styles/ProductsScreen.css';

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

export default function ProductsScreen({ auth, onClose }) {
  const { token, vendorId } = auth;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/vendors/${vendorId}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Não foi possível carregar produtos');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId, token]);

  return (
    <div className="products-overlay">
      <div className="products-sheet">
        <div className="products-header">
          <h2>Produtos</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="products-loading">
            <span className="loading-dots"><span /><span /><span /></span>
            <p>A carregar produtos…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <div className="products-empty-icon"><ShoppingBagIcon size={40} /></div>
            <h3>Nenhum produto adicionado</h3>
            <p>Começa a adicionar produtos para aumentar a visibilidade das tuas ofertas.</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              <PlusIcon size={16} />
              Adicionar Produto
            </button>
          </div>
        ) : (
          <div className="products-list">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                {product.image && (
                  <div className="product-item-image">
                    <img src={mediaUrl(product.image)} alt={product.name} />
                  </div>
                )}
                <div className="product-item-content">
                  <h3 className="product-item-name">{product.name}</h3>
                  {product.description && (
                    <p className="product-item-desc">{product.description}</p>
                  )}
                  {product.price && (
                    <div className="product-item-price">
                      €{parseFloat(product.price).toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
