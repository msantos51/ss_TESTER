// (em português) Ecrã que lista semanas pagas e respetivos recibos (versão web)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { Link, useNavigate } from 'react-router-dom';

// Mostra ao vendedor as semanas já pagas
export default function PaidWeeksScreen() {
  const [weeks, setWeeks] = useState([]);
  const navigate = useNavigate();

  // Carrega as semanas pagas do vendedor
  const loadWeeks = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/paid-weeks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setWeeks(res.data);
    } catch (e) {
      console.error('Erro ao carregar semanas:', e);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, []);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>
      <h2>Semanas Pagas</h2>
      <ul style={styles.list}>
        {weeks.map((item) => {
          const start = new Date(item.start_date).toLocaleDateString();
          const end = new Date(item.end_date).toLocaleDateString();
          return (
            <li key={item.id} style={styles.item}>
              <span>{start} - {end}</span>
              {item.receipt_url && (
                <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  Recibo
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// (em português) Estilos simples para a versão web
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    padding: '1rem 0',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
  },
  link: {
    marginLeft: '1rem',
    textDecoration: 'none',
    color: '#19a0a4',
    fontWeight: 'bold',
  },
  back: {
    marginBottom: '1rem',
    background: 'none',
    border: 'none',
    color: '#19a0a4',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
