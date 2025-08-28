// (em português) Botão reutilizável que leva sempre à página inicial
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackHomeButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/')} style={styles.back}>⬅ Voltar</button>
  );
}

const styles = {
  back: {
    marginBottom: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#000',
  },
};
