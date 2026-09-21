import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Send
} from 'lucide-react';

export default function SettingsModal({ onClose, adminPin, onUpdatePin }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState(adminPin || sessionStorage.getItem('cloe_admin_pin') || '');
  const [newPin, setNewPin] = useState('');
  const [m365Enabled, setM365Enabled] = useState(true);
  const [m365Host, setM365Host] = useState('smtp.office365.com');
  const [m365Port, setM365Port] = useState(587);
  const [m365User, setM365User] = useState('eyepez@oemoda.com');
  const [m365Pass, setM365Pass] = useState('');
  const [m365FromEmail, setM365FromEmail] = useState('eyepez@oemoda.com');
  const [allowAnyEmail, setAllowAnyEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch('/api/settings', {
      headers: { 'x-admin-pin': pin }
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.m365Config) {
          setM365Enabled(data.m365Config.enabled !== false);
          setM365Host(data.m365Config.host || 'smtp.office365.com');
          setM365Port(data.m365Config.port || 587);
          setM365User(data.m365Config.user || 'eyepez@oemoda.com');
          setM365Pass(data.m365Config.pass || '');
          setM365FromEmail(data.m365Config.fromEmail || 'eyepez@oemoda.com');
        }
        setAllowAnyEmail(data.allowAnyEmailInDev === true);
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));
  }, [pin]);

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      setTestResult(null);

      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ recipientEmail: m365User || 'eyepez@oemoda.com' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `¡Correo enviado exitosamente a ${data.recipient}! Revisa tu bandeja de entrada en Outlook/M365.`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Error al conectar con el servidor SMTP de Microsoft 365.'
        });
      }
    } catch (err) {
      console.error('Test email error:', err);
      setTestResult({
        success: false,
        message: 'Error de red al intentar enviar el correo de prueba.'
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg(null);

      const payload = {
        allowAnyEmailInDev: allowAnyEmail,
        m365Config: {
          enabled: m365Enabled,
          host: m365Host,
          port: Number(m365Port),
          user: m365User,
          pass: m365Pass,
          fromEmail: m365FromEmail || m365User,
          fromName: 'Eduardo Yepez | Cloe Tech'
        }
      };

      if (newPin.trim()) {
        payload.adminPin = newPin.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ success: true, text: 'Configuración guardada exitosamente.' });
        if (newPin.trim()) {
          setPin(newPin.trim());
          onUpdatePin && onUpdatePin(newPin.trim());
          setNewPin('');
        }
      } else {
        setStatusMsg({ success: false, text: data.error || 'Error al guardar configuración' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setStatusMsg({ success: false, text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay-mobile"
      style={{
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
      }}
    >
      <div
        className="modal-content-mobile"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Configuración & Servidor
            </h3>
          </div>

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

        {/* Form */}
        <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {statusMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: statusMsg.success ? 'var(--status-resolved-bg)' : 'rgba(239, 68, 68, 0.1)',
              color: statusMsg.success ? 'var(--status-resolved)' : '#EF4444'
            }}>
              {statusMsg.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Microsoft 365 SMTP Settings */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cuenta Corporativa Microsoft 365
                </h4>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: m365Enabled ? 'var(--status-resolved)' : 'var(--text-muted)', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={m365Enabled}
                  onChange={(e) => setM365Enabled(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span>{m365Enabled ? 'Envío Real Activo' : 'Simulador'}</span>
              </label>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Configuración para enviar correos usando tu cuenta de Microsoft 365 (<strong>eyepez@oemoda.com</strong>):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Servidor SMTP</label>
                  <input
                    type="text"
                    value={m365Host}
                    onChange={(e) => setM365Host(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Puerto</label>
                  <input
                    type="number"
                    value={m365Port}
                    onChange={(e) => setM365Port(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Correo de Envío (User)</label>
                  <input
                    type="email"
                    value={m365User}
                    onChange={(e) => setM365User(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Contraseña / App Password</label>
                  <input
                    type="password"
                    placeholder="Contraseña de M365..."
                    value={m365Pass}
                    onChange={(e) => setM365Pass(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Live Test Button */}
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Verifica si Microsoft 365 acepta el envío:
                  </span>
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'var(--bg-surface)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border-medium)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <Send size={12} />
                    <span>{testingEmail ? 'Probando conexión...' : 'Probar Envío a eyepez@oemoda.com'}</span>
                  </button>
                </div>

                {testResult && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: testResult.success ? 'var(--status-resolved-bg)' : 'rgba(239, 68, 68, 0.1)',
                    color: testResult.success ? 'var(--status-resolved)' : '#EF4444'
                  }}>
                    {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin PIN */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Key size={15} color="var(--primary)" />
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                PIN de Acceso a Consola TI
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              El PIN de acceso para la Consola Dev se encuentra protegido y activo. Ingresa uno nuevo solo si requieres cambiarlo:
            </p>
            <input
              type="password"
              placeholder="Ingresar nuevo PIN de 4-8 dígitos..."
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Footer Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Save size={14} />
              <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
