import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL, mediaUrl } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import { FiShoppingBag, FiTag } from 'react-icons/fi';
import './VendorDetailScreen.css';

export default function VendorDetailScreen() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [stories, setStories] = useState([]);
  const [storyIndex, setStoryIndex] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/${id}`);
        setVendor(res.data);
      } catch (e) {
        console.error('Erro ao carregar vendedor:', e);
        setError('Vendedor não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    loadVendor();
  }, [id]);

  useEffect(() => {
    if (!vendor) return;
    const loadStories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/stories`);
        setStories(res.data);
      } catch (e) {
        console.error('Erro ao carregar stories:', e);
      }
    };
    loadStories();
  }, [vendor]);

  useEffect(() => {
    if (!vendor) return;
    const loadProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/products`);
        setProducts(res.data);
      } catch (e) {
        console.error('Erro ao carregar produtos:', e);
      }
    };
    loadProducts();
  }, [vendor]);


  if (loading) {
    return (
      <div className="page-wrapper">
        <BackHomeButton />
        <p className="page-empty">A carregar...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="page-wrapper">
        <BackHomeButton />
        <p className="page-empty">{error || 'Vendedor não encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <BackHomeButton />

      <div className="vds-header">
        {vendor.profile_photo ? (
          <img
            src={mediaUrl(vendor.profile_photo)}
            alt="Foto do vendedor"
            className={"card-photo vds-photo" + (stories.length > 0 ? " vds-clickable" : "")}
            onClick={() => stories.length > 0 && setStoryIndex(0)}
          />
        ) : (
          <div
            className="card-photo vds-photo vds-placeholder"
            style={{ background: vendor.pin_color || '#ccc' }}
          >
            {vendor.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <h2 className="vds-name">{vendor.name}</h2>
        <p className="vds-product">{vendor.product}</p>
      </div>

      {stories.length > 0 && storyIndex !== null && (
        <div
          className="vds-story-overlay"
          onClick={() => {
            if (storyIndex < stories.length - 1) {
              setStoryIndex(storyIndex + 1);
            } else {
              setStoryIndex(null);
            }
          }}
        >
          <img
            src={mediaUrl(stories[storyIndex].media_url)}
            alt="Story"
            className="vds-story-full"
          />
        </div>
      )}

      {stories.length > 0 && (
        <div className="vds-stories-row">
          {stories.map((s, i) => (
            <img
              key={s.id}
              src={mediaUrl(s.media_url)}
              onClick={() => setStoryIndex(i)}
              alt="Story"
              className="vds-story-thumb"
            />
          ))}
        </div>
      )}

      <div className="vds-products">
        <h3 className="vds-products-title"><FiShoppingBag /> Produtos disponíveis</h3>
        {products.length === 0 ? (
          <p className="vds-products-empty">Este vendedor ainda não tem produtos publicados.</p>
        ) : (
          <ul className="vds-products-list">
            {products.map((p) => (
              <li key={p.id} className="vds-product-item">
                {p.photo ? (
                  <img src={mediaUrl(p.photo)} alt={p.name} className="vds-product-photo" />
                ) : (
                  <div className="vds-product-photo vds-product-photo-placeholder">
                    <FiShoppingBag />
                  </div>
                )}
                <div className="vds-product-body">
                  <span className="vds-product-name">{p.name}</span>
                  <span className="vds-product-price"><FiTag /> {p.price.toFixed(2)} €</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
