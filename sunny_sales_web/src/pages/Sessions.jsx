import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FiMonitor } from 'react-icons/fi';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const fetchSessions = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const terminate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BASE_URL}/vendors/me/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      if (e.response && e.response.status === 401) navigate('/vendor-login');
    } finally {
      fetchSessions();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-icon"><FiMonitor /></div>
        <div>
          <h2>Sessões Ativas</h2>
          <p className="page-header-subtitle">Os dispositivos com sessão iniciada na tua conta</p>
        </div>
      </div>
      {sessions.length === 0 && (
        <p className="page-empty">Sem sessões ativas.</p>
      )}
      <ul className="page-list">
        {sessions.map((s) => (
          <li key={s.id} className="page-list-item no-hover">
            <div className="page-list-item-main">
              <span className="page-list-item-title">
                {s.user_agent || 'Dispositivo desconhecido'}
              </span>
              {s.current && (
                <span className="page-list-item-desc">Sessão atual</span>
              )}
            </div>
            {!s.current && (
              <button className="page-danger-btn" onClick={() => terminate(s.id)}>
                Terminar
              </button>
            )}
            {s.current && (
              <span className="page-list-item-badge">Atual</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
