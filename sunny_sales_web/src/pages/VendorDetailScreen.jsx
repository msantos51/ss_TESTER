// (em português) Página de detalhes do vendedor com stories
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './VendorDetailScreen.css'; // Deves criar este ficheiro com os estilos CSS

// Página de detalhes de um vendedor específico
export default function VendorDetailScreen({ vendor }) {
  const [stories, setStories] = useState([]);
  const [storyIndex, setStoryIndex] = useState(null);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/stories`);
        setStories(res.data);
      } catch (e) {
        console.error('Erro ao carregar stories:', e);
      }
    };
    loadStories();
  }, [vendor.id]);


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

    </div>
  );
}
