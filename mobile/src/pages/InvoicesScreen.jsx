import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config.js';
import '../styles/InvoicesScreen.css';

const FileIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const ReceiptIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function InvoicesScreen({ auth, onClose }) {
  const { token, vendorId } = auth;
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaidWeeks = async () => {
      try {
        // (em português) O modelo de faturação do projeto são as "semanas pagas"
        // (/vendors/{id}/paid-weeks), cada uma com o respetivo recibo do Stripe.
        const response = await fetch(`${BASE_URL}/vendors/${vendorId}/paid-weeks`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Não foi possível carregar faturas');
        const data = await response.json();
        setWeeks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setWeeks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidWeeks();
  }, [vendorId, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openReceipt = (url) => {
    window.open(url, '_system');
  };

  return (
    <div className="invoices-overlay">
      <div className="invoices-sheet">
        <div className="invoices-header">
          <h2>Faturas</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="invoices-loading">
            <span className="loading-dots"><span /><span /><span /></span>
            <p>A carregar faturas…</p>
          </div>
        ) : weeks.length === 0 ? (
          <div className="invoices-empty">
            <div className="invoices-empty-icon"><FileIcon size={40} /></div>
            <h3>Nenhuma fatura registada</h3>
            <p>As tuas faturas aparecerão aqui assim que realizares o primeiro pagamento.</p>
          </div>
        ) : (
          <div className="invoices-list">
            {weeks.map((week) => (
              <div key={week.id} className="invoice-item">
                <div className="invoice-item-icon">
                  <FileIcon size={20} />
                </div>
                <div className="invoice-item-content">
                  <div className="invoice-item-number">
                    {formatDate(week.start_date)} – {formatDate(week.end_date)}
                  </div>
                  <div className="invoice-item-date">Semana de subscrição paga</div>
                </div>
                {week.receipt_url && (
                  <button
                    className="btn-icon invoice-download-btn"
                    onClick={() => openReceipt(week.receipt_url)}
                    title="Ver recibo"
                  >
                    <ReceiptIcon size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
