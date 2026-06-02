import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackHomeButton() {
  const navigate = useNavigate();
  return (
    <button className="back-btn" onClick={() => navigate(-1)}>
      ← Voltar
    </button>
  );
}
