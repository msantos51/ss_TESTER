import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config.js';
import '../styles/InvoicesScreen.css';

const FileIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const DownloadIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function InvoicesScreen({ auth, onClose }) {
  const { token, vendorId } = auth;
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${BASE_URL}/vendors/${vendorId}/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Não foi possível carregar faturas');
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : data.invoices || []);
      } catch (err) {
        setError(err.message);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [vendorId, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownload = (invoiceId) => {
    const url = `${BASE_URL}/vendors/${vendorId}/invoices/${invoiceId}/download`;
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
        ) : invoices.length === 0 ? (
          <div className="invoices-empty">
            <div className="invoices-empty-icon"><FileIcon size={40} /></div>
            <h3>Nenhuma fatura registada</h3>
            <p>As tuas faturas aparecerão aqui assim que realizares o primeiro pagamento.</p>
          </div>
        ) : (
          <div className="invoices-list">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="invoice-item">
                <div className="invoice-item-icon">
                  <FileIcon size={20} />
                </div>
                <div className="invoice-item-content">
                  <div className="invoice-item-number">Fatura #{invoice.number || invoice.id}</div>
                  <div className="invoice-item-date">
                    {formatDate(invoice.date || invoice.created_at)}
                  </div>
                  {invoice.description && (
                    <div className="invoice-item-desc">{invoice.description}</div>
                  )}
                </div>
                <div className="invoice-item-amount">
                  €{parseFloat(invoice.amount || invoice.total).toFixed(2).replace('.', ',')}
                </div>
                {invoice.download_url && (
                  <button
                    className="btn-icon invoice-download-btn"
                    onClick={() => handleDownload(invoice.id)}
                    title="Descarregar fatura"
                  >
                    <DownloadIcon size={18} />
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
