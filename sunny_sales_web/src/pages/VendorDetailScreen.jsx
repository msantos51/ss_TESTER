// (em português) Versão web da página de detalhes de vendedor com favoritos, reviews e stories
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './VendorDetailScreen.css'; // Deves criar este ficheiro com os estilos CSS

export default function VendorDetailScreen({ vendor }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [stories, setStories] = useState([]);
  const [storyIndex, setStoryIndex] = useState(null);

  // (em português) Carrega as reviews do vendedor
  const loadReviews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/reviews`);
      setReviews(res.data);
    } catch (e) {
      console.error('Erro ao carregar reviews:', e);
    }
  };

  // (em português) Carrega os stories
  const loadStories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/stories`);
      setStories(res.data);
    } catch (e) {
      console.error('Erro ao carregar stories:', e);
    }
  };

  useEffect(() => {
    loadReviews();
    loadStories();
    const storedFavorites = localStorage.getItem('favorites') || '[]';
    setFavorite(JSON.parse(storedFavorites).includes(vendor.id));
  }, [vendor.id]);

  // (em português) Envia nova avaliação
  const submitReview = async () => {
    const token = localStorage.getItem('clientToken');
    if (!token) return alert('Inicie sessão para avaliar');

    try {
      await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(0);
      setComment('');
      loadReviews();
    } catch (e) {
      alert('Erro ao enviar avaliação');
      console.error(e);
    }
  };

  // (em português) Alterna favoritos
  const toggleFavorite = () => {
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (stored.includes(vendor.id)) {
      updated = stored.filter(id => id !== vendor.id);
      setFavorite(false);
    } else {
      updated = [...stored, vendor.id];
      setFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const baseUrl = BASE_URL.replace(/\/$/, '');

  return (
    <div className="vendor-container">
      <div className="vendor-header">
        {vendor.profile_photo && (
          <img
            className="vendor-photo"
            src={`${baseUrl}/${vendor.profile_photo}`}
            alt="Foto do vendedor"
            onClick={() => setStoryIndex(0)}
          />
        )}
        <h2>{vendor.name}</h2>
        <button onClick={toggleFavorite}>
          {favorite ? '★ Remover dos Favoritos' : '☆ Adicionar aos Favoritos'}
        </button>
        <p>Produto: {vendor.product}</p>
      </div>

      {stories.length > 0 && storyIndex !== null && (
        <div className="story-modal" onClick={() => {
          if (storyIndex < stories.length - 1) {
            setStoryIndex(storyIndex + 1);
          } else {
            setStoryIndex(null);
          }
        }}>
          <img
            className="story-full"
            src={`${baseUrl}/${stories[storyIndex].media_url}`}
            alt="Story"
          />
        </div>
      )}

      <div className="story-thumbs">
        {stories.map((s, i) => (
          <img
            key={s.id}
            className="story-thumb"
            src={`${baseUrl}/${s.media_url}`}
            onClick={() => setStoryIndex(i)}
            alt="Thumb"
          />
        ))}
      </div>

      <div className="review-section">
        <h3>Avaliações</h3>
        {reviews.map(r => (
          <div key={r.id} className="review-item">
            <strong>⭐ {r.rating}</strong>
            <p>{r.comment}</p>
          </div>
        ))}

        <h4>Nova Avaliação</h4>
        <input
          type="number"
          max={5}
          min={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentário"
        />
        <button onClick={submitReview}>Enviar</button>
      </div>
    </div>
  );
}
