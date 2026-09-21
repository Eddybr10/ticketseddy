import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Send,
  ShoppingBag,
  Store,
  Building,
  CreditCard,
  Database,
  Cpu,
  Terminal,
  Activity,
  Server,
  Shield,
  FileCode,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

const CATEGORIES = [
  { id: 'rendimiento_performance', name: 'Rendimiento & Optimización (Velocidad, Core Web Vitals, latencia)', icon: Activity },
  { id: 'nuevo_modulo_feature', name: 'Nuevo Módulo / Feature (Desarrollo de componentes o funcionalidades)', icon: Layers },
  { id: 'bases_datos_dba', name: 'Bases de Datos & DBA (Consultas SQL, esquemas, indexación, queries)', icon: Database },
  { id: 'integraciones_apis', name: 'Integraciones & APIs (Conectores ERP, CRM, Webhooks, endpoints)', icon: Cpu },
  { id: 'vtex_backend_io', name: 'VTEX IO & Microservicios (Apps personalizadas, MasterData, GraphQL)', icon: Terminal },
  { id: 'checkout_pagos_tech', name: 'Checkout & Pasarelas (Fallas técnicas de pago, error 500, APIs)', icon: CreditCard },
  { id: 'bug_codigo', name: 'Bug / Error de Código (Excepciones JavaScript, errores de lógica)', icon: FileCode },
  { id: 'infraestructura_devops', name: 'Infraestructura & Servidores (Cloud, Render, SSL, DNS, caídas)', icon: Server },
  { id: 'seguridad_accesos', name: 'Seguridad & Credenciales (Tokens de API, llaves, permisos técnicos)', icon: Shield },
  { id: 'extraccion_scripts', name: 'Scripts de Automatización & ETL (Migraciones masivas, procesos batch)', icon: Terminal },
  { id: 'other_tech', name: 'Otro Requerimiento de Ingeniería', icon: Terminal }
];

export default function NewTicketModal({ onClose, onSuccess, initialStore = 'cloe.com.mx' }) {
  const [store, setStore] = useState(initialStore);
  const [area, setArea] = useState('Marketing');
  const [category, setCategory] = useState('rendimiento_performance');
  const [priority, setPriority] = useState('p3_medium');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [title, setTitle] = useState('');
  const [requesterName, setRequesterName] = useState(localStorage.getItem('cloe_user_name') || '');
  const [requesterEmail, setRequesterEmail] = useState(localStorage.getItem('cloe_user_email') || '');
  const [department, setDepartment] = useState(localStorage.getItem('cloe_user_dept') || 'Marketing');
  const [affectedUrl, setAffectedUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setAttachments(prev => [...prev, ...data.files]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !requesterEmail.trim() || !description.trim()) {
      setErrorMsg('Por favor completa los campos requeridos: Título, Correo y Descripción.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          store,
          area,
          category,
          priority,
          figmaUrl: figmaUrl.trim(),
          requesterName: requesterName.trim() || requesterEmail.split('@')[0],
          requesterEmail: requesterEmail.trim(),
          department: area,
          affectedUrl: affectedUrl.trim(),
          orderId: orderId.trim(),
          description: description.trim(),
          attachments
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Error al registrar el ticket');
        return;
      }

      localStorage.setItem('cloe_user_name', requesterName);
      localStorage.setItem('cloe_user_email', requesterEmail);
      localStorage.setItem('cloe_user_dept', department);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setCreatedTicket(data);
      onSuccess && onSuccess(data);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setErrorMsg('Error de conexión al registrar el ticket.');
    } finally {
      setSubmitting(false);
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
          maxWidth: '740px',
          maxHeight: '92vh',
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
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Nuevo Requerimiento de Ingeniería & Desarrollo
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              cloe.com.mx &bull; Cloe Factory Store &bull; Desarrollo de Software
            </span>
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

        {/* Success Screen */}
        {createdTicket ? (
          <div style={{
            padding: '40px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--status-resolved-bg)',
              color: 'var(--status-resolved)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'block',
                marginBottom: '4px'
              }}>
                {createdTicket.id}
              </span>
              <h4 style={{ fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>
                Ticket técnico registrado
              </h4>
            </div>

            <p style={{ maxWidth: '440px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              El desarrollador a cargo ha recibido tu requerimiento técnico.
              Te enviamos confirmación por correo y podrás dar seguimiento respondiendo directamente a dicho email o desde este portal.
            </p>

            <button
              onClick={onClose}
              style={{
                marginTop: '10px',
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '9px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              Entendido / Cerrar
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                color: '#EF4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scope Notice */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Ámbito de Ingeniería:</strong> Este portal atiende exclusivamente desarrollo de software, arquitectura técnica, bases de datos (DBA), rendimiento, APIs y corrección de código.
              </span>
            </div>

            {/* Tienda */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Entorno / Tienda *
              </label>
              <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStore('cloe.com.mx')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: store === 'cloe.com.mx' ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                    background: store === 'cloe.com.mx' ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: store === 'cloe.com.mx' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>cloe.com.mx</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStore('cloefactorystore.com.mx')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: store === 'cloefactorystore.com.mx' ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                    background: store === 'cloefactorystore.com.mx' ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: store === 'cloefactorystore.com.mx' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <Store size={16} />
                  <span>Factory Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStore('both')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: store === 'both' ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                    background: store === 'both' ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: store === 'both' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <Building size={16} />
                  <span>Ambos / Infra</span>
                </button>
              </div>
            </div>

            {/* Área Solicitante & Prioridad CLOE */}
            <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Área Solicitante *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <option value="Marketing">Marketing / Campañas</option>
                  <option value="eCommerce">eCommerce / Ventas</option>
                  <option value="UX">UX / Diseño de Experiencia</option>
                  <option value="CRM">CRM / Fidelización (SalesManago)</option>
                  <option value="Analytics">Analytics / Medición (GA4)</option>
                  <option value="Comercial">Comercial / Compras</option>
                  <option value="Tecnología">Tecnología / Sistemas</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Criterio de Prioridad CLOE *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <option value="p1_critical">🔴 P1 - Urgente (Afecta ventas/pago - Hoy mismo)</option>
                  <option value="p2_high">🟠 P2 - Alta (Impacto en conversión/lanzamiento - 1 a 2 días)</option>
                  <option value="p3_medium">🟡 P3 - Media (Mejora UX/componentes - 3 a 5 días)</option>
                  <option value="p4_low">⚪ P4 - Baja (Ajuste menor/copy - Backlog &gt; 5 días)</option>
                </select>
              </div>
            </div>

            {/* Enlace de Figma / Referencias */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Enlace a Figma / Referencias Visuales (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://www.figma.com/file/... o enlace a drive/carpeta"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Solicitante */}
            <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Tu Correo Corporativo *
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@oemoda.com"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Tu Nombre
                </label>
                <input
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Departamento
                </label>
                <input
                  type="text"
                  placeholder="TI, E-Commerce, Dirección..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            {/* Título */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Resumen Técnico del Requerimiento *
              </label>
              <input
                type="text"
                placeholder="ej. Optimización de latencia en Checkout o Endpoint de webhook ERP devuelve 504"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* URL & Endpoint / Orden */}
            <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  URL o Endpoint Afectado (opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://cloe.com.mx/api/... o ruta"
                  value={affectedUrl}
                  onChange={(e) => setAffectedUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  ID de Orden VTEX / Ref (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. vtex-123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Detalles Técnicos & Contexto *
              </label>
              <textarea
                rows={4}
                placeholder="Incluye logs, pasos técnicos para reproducir, endpoints involucrados o especificaciones técnicas del módulo requerido..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Adjuntos */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Adjuntar Evidencia Técnica (Logs, capturas de consola, JSON)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}>
                  <Upload size={14} />
                  <span>{uploadingFiles ? 'Subiendo...' : 'Adjuntar archivos'}</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {attachments.length > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {attachments.length} archivo(s) listo(s)
                  </span>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div
              className="modal-mobile-sticky-footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px'
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingFiles}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <Send size={14} />
                <span>{submitting ? 'Creando...' : 'Crear Ticket Técnico'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
