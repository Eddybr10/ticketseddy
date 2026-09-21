import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function EmailDrawer({ onClose, onEmailProcessed, tickets = [], adminPin = '' }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simTicketId, setSimTicketId] = useState(tickets[0]?.id || '');
  const [simSenderName, setSimSenderName] = useState('');
  const [simSenderEmail, setSimSenderEmail] = useState('');
  const [simReplyText, setSimReplyText] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const pin = adminPin || sessionStorage.getItem('cloe_admin_pin') || '';

  useEffect(() => {
    fetchEmails();
  }, [pin]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/emails', {
        headers: { 'x-admin-pin': pin }
      });
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateReply = async (e) => {
    e.preventDefault();
    if (!simReplyText.trim() || simulating) return;

    try {
      setSimulating(true);
      setSimResult(null);

      const res = await fetch('/api/emails/simulate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({
          ticketId: simTicketId,
          senderName: simSenderName,
          senderEmail: simSenderEmail,
          replyText: simReplyText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSimResult({
          success: true,
          message: `Respuesta procesada para ${data.ticketId}. El mensaje fue añadido automáticamente al hilo.`
        });
        fetchEmails();
        onEmailProcessed && onEmailProcessed(data.ticketId);
      } else {
        setSimResult({ success: false, error: data.error || 'Error al procesar respuesta' });
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setSimResult({ success: false, error: 'Error de conexión' });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1000
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        height: '100vh',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '1px solid var(--border-subtle)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Buzón & Sincronización de Correo
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={fetchEmails}
              title="Refrescar"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)'
              }}
            >
              <RefreshCw size={15} />
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Simulator Box */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Simular Respuesta Inbound por Correo
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
              Prueba cómo el sistema recibe un correo de un usuario y lo inserta en la conversación del ticket:
            </p>

            <form onSubmit={handleSimulateReply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                  Ticket:
                </label>
                <select
                  value={simTicketId}
                  onChange={(e) => setSimTicketId(e.target.value)}
                  style={{ fontSize: '12px' }}
                >
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                    Remitente (Nombre):
                  </label>
                  <input
                    type="text"
                    value={simSenderName}
                    onChange={(e) => setSimSenderName(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                    Remitente (Correo):
                  </label>
                  <input
                    type="email"
                    value={simSenderEmail}
                    onChange={(e) => setSimSenderEmail(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                  Texto de Respuesta:
                </label>
                <textarea
                  rows={2}
                  value={simReplyText}
                  onChange={(e) => setSimReplyText(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {simResult && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: simResult.success ? 'var(--status-resolved-bg)' : 'rgba(239, 68, 68, 0.1)',
                  color: simResult.success ? 'var(--status-resolved)' : '#EF4444'
                }}>
                  {simResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{simResult.message || simResult.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={simulating}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Send size={12} />
                <span>{simulating ? 'Procesando...' : 'Enviar Respuesta Simulada'}</span>
              </button>
            </form>
          </div>

          {/* Email Activity Log */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Historial ({emails.length})
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Cargando...
              </div>
            ) : emails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                No hay correos en el registro.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {emails.map(em => (
                  <div key={em.id} style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        fontWeight: 600,
                        color: em.type === 'inbound' ? '#3B82F6' : 'var(--primary)'
                      }}>
                        {em.type === 'inbound' ? '⬅️ ENTRANTE (Usuario)' : '➡️ SALIENTE (Sistema)'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {new Date(em.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' }}>
                      {em.subject}
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                      {em.from} &rarr; {em.to}
                    </div>

                    <div style={{
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface)',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '60px',
                      overflowY: 'auto',
                      fontSize: '11px'
                    }}>
                      {em.bodyText}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
