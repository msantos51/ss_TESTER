import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';

export default function VendorDetailScreen() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [stories, setStories] = useState([]);
  const [storyIndex, setStoryIndex] = useState(null);
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

  const baseUrl = BASE_URL.replace(/\/$/, '');

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

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {vendor.profile_photo ? (
          <img
            src={`${baseUrl}/${vendor.profile_photo}`}
            alt="Foto do vendedor"
            className="card-photo"
            style={{ width: 96, height: 96, cursor: stories.length > 0 ? 'pointer' : 'default' }}
            onClick={() => stories.length > 0 && setStoryIndex(0)}
          />
        ) : (
          <div
            className="card-photo"
            style={{
              width: 96,
              height: 96,
              background: vendor.pin_color || '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {vendor.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <h2 style={{ margin: '12px 0 4px', wordBreak: 'break-word' }}>{vendor.name}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{vendor.product}</p>
      </div>

      {stories.length > 0 && storyIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (storyIndex < stories.length - 1) {
              setStoryIndex(storyIndex + 1);
            } else {
              setStoryIndex(null);
            }
          }}
        >
          <img
            src={`${baseUrl}/${stories[storyIndex].media_url}`}
            alt="Story"
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      )}

      {stories.length > 0 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {stories.map((s, i) => (
            <img
              key={s.id}
              src={`${baseUrl}/${s.media_url}`}
              onClick={() => setStoryIndex(i)}
              alt="Story"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2.5px solid var(--primary-light-solid)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
