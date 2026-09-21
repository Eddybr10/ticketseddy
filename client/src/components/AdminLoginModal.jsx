import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function AdminLoginModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });

      if (res.ok) {
        sessionStorage.setItem('cloe_admin_auth', 'true');
        sessionStorage.setItem('cloe_admin_pin', pin.trim());
        onSuccess(pin.trim());
      } else {
        setErrorMsg('PIN de acceso incorrecto');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Error de conexión al verificar PIN');
    } finally {
      setLoading(false);
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'var(--primary-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Shield size={22} color="var(--primary)" />
        </div>

        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
          Consola Desarrollador Cloe
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Ingresa tu PIN de acceso para gestionar tickets y notas técnicas.
        </p>

        {errorMsg && (
          <div style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            color: '#EF4444',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
              PIN de Acceso TI
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Ingresa PIN..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '13px', textAlign: 'center' }}
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                border: '1px solid var(--border-medium)'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>{loading ? 'Accediendo...' : 'Entrar'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
