import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/vendor-login');
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/vendors/me/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data);
    } catch (e) {
      if (e.response && e.response.status === 401) navigate('/vendor-login');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const terminate = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${BASE_URL}/vendors/me/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSessions();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Sessões Ativas</h2>
      {sessions.length === 0 && <p>Sem sessões ativas.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sessions.map((s) => (
          <li key={s.id} style={{ marginBottom: '1rem' }}>
            <div>{s.user_agent || 'Dispositivo'} {s.current ? '(Atual)' : ''}</div>
            <button onClick={() => terminate(s.id)}>Terminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
