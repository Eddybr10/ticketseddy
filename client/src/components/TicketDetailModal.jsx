import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Lock,
  Mail,
  User,
  Paperclip,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Tag,
  CreditCard,
  ShoppingBag,
  Store,
  Package,
  Layers,
  Sparkles,
  AlertOctagon,
  HelpCircle,
  Clock,
  Calendar,
  Terminal,
  Shield,
  Bug,
  ListChecks,
  Play,
  RotateCcw,
  CheckCheck,
  Smartphone,
  Laptop,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  CLOE_STAGES,
  STAGE_MAP,
  CLOE_PRIORITIES,
  CLOE_AREAS,
  CLOE_PLATFORMS,
  OFFICIAL_12_QA_ITEMS,
  normalizeStatus,
  isFridayToday,
  isMondayToday,
  getNextMondayFormatted
} from '../cloeWorkflow';

const DEV_MACROS = [
  { label: 'Revisando en VTEX', text: 'Hola, hemos recibido tu reporte y estamos investigando el comportamiento en VTEX y catálogo.' },
  { label: 'Listo en Workspace VTEX', text: 'Se aplicaron los cambios en el workspace de VTEX IO. Omar (QA) se encuentra validando el responsive y funcionalidad.' },
  { label: 'Hallazgo corregido', text: 'Se atendieron las observaciones reportadas en QA. Listo para re-validación.' },
  { label: 'Desplegado en Producción', text: 'La solución ha sido liberada exitosamente a Producción (.com / Outlet) este lunes y se encuentra bajo monitoreo de métricas y consola.' },
  { label: 'Datos adicionales', text: 'Para replicar la incidencia requerimos por favor nos compartas: 1) Captura con consola (F12), 2) Número de orden o 3) Enlace de Figma de referencia.' }
];

export default function TicketDetailModal({
  ticket,
  onClose,
  onUpdateTicket,
  isAdmin = false,
  adminPin = '',
  currentUserEmail = '',
  operator = 'eduardo',
  onToggleOperator
}) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' | 'qa' | 'findings' | 'conversation' | 'vtex_tools' | 'emails'
  const [emailsLog, setEmailsLog] = useState([]);
  const messagesEndRef = useRef(null);

  // Workflow Editable Fields
  const [vtexWorkspace, setVtexWorkspace] = useState(ticket.vtexWorkspace || '');
  const [estimationHours, setEstimationHours] = useState(ticket.estimationHours || 4);
  const [targetReleaseDate, setTargetReleaseDate] = useState(ticket.targetReleaseDate || '');
  const [area, setArea] = useState(ticket.area || 'eCommerce');
  const [figmaUrl, setFigmaUrl] = useState(ticket.figmaUrl || '');
  const [savingMeta, setSavingMeta] = useState(false);

  // QA Findings Form
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDesc, setFindingDesc] = useState('');
  const [findingSeverity, setFindingSeverity] = useState('major');
  const [findingDevice, setFindingDevice] = useState('Desktop Chrome');
  const [submittingFinding, setSubmittingFinding] = useState(false);
  const [notifyingOmar, setNotifyingOmar] = useState(false);

  // Active status
  const currentStage = STAGE_MAP[normalizeStatus(ticket.status)] || STAGE_MAP.backlog;
  const currentPrio = CLOE_PRIORITIES[ticket.priority] || CLOE_PRIORITIES.p3_medium;
  const platform = CLOE_PLATFORMS[ticket.store] || CLOE_PLATFORMS['cloe.com.mx'];

  useEffect(() => {
    fetchTicketData();
  }, [ticket.id]);

  const fetchTicketData = async () => {
    try {
      setLoadingMessages(true);
      const headers = {};
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticket.id}`, { headers });
      const data = await res.json();
      if (data.ticket) {
        Object.assign(ticket, data.ticket);
        setVtexWorkspace(data.ticket.vtexWorkspace || '');
        setEstimationHours(data.ticket.estimationHours || 4);
        setTargetReleaseDate(data.ticket.targetReleaseDate || '');
        setArea(data.ticket.area || 'eCommerce');
        setFigmaUrl(data.ticket.figmaUrl || '');
      }
      if (data.messages) setMessages(data.messages);
      if (data.emails) setEmailsLog(data.emails);
    } catch (err) {
      console.error('Error fetching ticket data:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'conversation') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const isOmar = operator === 'omar';
      const senderRole = isAdmin ? 'admin' : 'user';
      const senderEmail = isAdmin
        ? (isOmar ? 'adiaz@oemoda.com' : 'eyepez@oemoda.com')
        : (currentUserEmail || ticket.requesterEmail);
      const senderName = isAdmin
        ? (isOmar ? 'Omar Díaz (QA / Tester)' : 'Eduardo Yépez (Desarrollador)')
        : ticket.requesterName;

      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          senderEmail,
          senderName,
          senderRole,
          isInternalNote: isAdmin ? isInternalNote : false,
          content: replyText.trim(),
          source: 'web'
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setReplyText('');
        onUpdateTicket && onUpdateTicket();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (newStatus, customNote, extraFields = {}) => {
    if (updatingStatus) return;
    try {
      setUpdatingStatus(true);
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: newStatus,
          statusNote: customNote,
          ...extraFields
        })
      });

      if (res.ok) {
        const updated = await res.json();
        Object.assign(ticket, updated);
        onUpdateTicket && onUpdateTicket();
        fetchTicketData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Error al actualizar el estado del ticket');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveMeta = async () => {
    try {
      setSavingMeta(true);
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          vtexWorkspace: vtexWorkspace.trim(),
          estimationHours: Number(estimationHours) || 4,
          targetReleaseDate: targetReleaseDate.trim(),
          area,
          figmaUrl: figmaUrl.trim()
        })
      });

      if (res.ok) {
        const updated = await res.json();
        Object.assign(ticket, updated);
        onUpdateTicket && onUpdateTicket();
      }
    } catch (err) {
      console.error('Error saving meta:', err);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleNotifyOmar = async () => {
    if (notifyingOmar) return;
    try {
      setNotifyingOmar(true);
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin') || 'cloe2026';
      headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticket.id}/notify-qa`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientEmail: 'adiaz@oemoda.com',
          note: `Requerimiento en QA: por favor audita el workspace VTEX "${vtexWorkspace || ticket.vtexWorkspace || 'asignado'}" para verificar funcionalidad, responsive y consola.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Correo de notificación enviado exitosamente a Omar Díaz (adiaz@oemoda.com).`);
        fetchTicketData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al notificar a Omar Díaz');
      }
    } catch (err) {
      console.error('Error notifying Omar:', err);
      alert('Error de conexión al enviar notificación a Omar Díaz');
    } finally {
      setNotifyingOmar(false);
    }
  };

  const handleToggleChecklist = async (itemId, currentChecked) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const checkedBy = operator === 'omar' ? 'Omar Díaz (QA / Tester)' : 'Eduardo (Dev)';

      const res = await fetch(`/api/tickets/${ticket.id}/qa-checklist`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          itemId,
          checked: !currentChecked,
          checkedBy
        })
      });

      if (res.ok) {
        const updated = await res.json();
        ticket.qaChecklist = updated.qaChecklist;
        onUpdateTicket && onUpdateTicket();
        fetchTicketData();
      }
    } catch (err) {
      console.error('Error toggling checklist:', err);
    }
  };

  const handleAddFinding = async (e) => {
    e.preventDefault();
    if (!findingTitle.trim() || submittingFinding) return;

    try {
      setSubmittingFinding(true);
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const reportedBy = operator === 'omar' ? 'Omar Díaz (QA / Tester)' : 'Eduardo (Dev)';

      const res = await fetch(`/api/tickets/${ticket.id}/qa-findings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: findingTitle.trim(),
          description: findingDesc.trim(),
          severity: findingSeverity,
          device: findingDevice,
          reportedBy
        })
      });

      if (res.ok) {
        const updated = await res.json();
        ticket.qaFindings = updated.qaFindings;
        ticket.status = updated.status;
        setFindingTitle('');
        setFindingDesc('');
        setShowFindingForm(false);
        onUpdateTicket && onUpdateTicket();
        fetchTicketData();
      }
    } catch (err) {
      console.error('Error adding finding:', err);
    } finally {
      setSubmittingFinding(false);
    }
  };

  const handleToggleFindingStatus = async (findingId, newStatus) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticket.id}/qa-findings/${findingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        ticket.qaFindings = updated.qaFindings;
        onUpdateTicket && onUpdateTicket();
        fetchTicketData();
      }
    } catch (err) {
      console.error('Error updating finding status:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  // QA Checklist calculation
  const qaItems = ticket.qaChecklist || OFFICIAL_12_QA_ITEMS.map(i => ({ ...i, checked: false }));
  const checkedQaCount = qaItems.filter(i => i.checked).length;
  const qaPercentage = Math.round((checkedQaCount / qaItems.length) * 100);

  // QA Findings calculation
  const findings = ticket.qaFindings || [];
  const openFindings = findings.filter(f => f.status === 'open');

  // Workspace URL generator
  const getWorkspaceUrl = () => {
    if (!vtexWorkspace) return null;
    const cleanWorkspace = vtexWorkspace.trim().toLowerCase();
    if (ticket.store === 'cloefactorystore.com.mx') {
      return `https://${cleanWorkspace}--cloeoutlet.myvtex.com`;
    }
    return `https://${cleanWorkspace}--cloemx.myvtex.com`;
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
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
          maxWidth: '1080px',
          maxHeight: '94vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Top Workflow Pipeline Tracker */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Breadcrumb Steps */}
          <div className="mobile-scroll-x" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingBottom: '2px'
          }}>
            {CLOE_STAGES.map((st, idx) => {
              const isCurrent = currentStage.id === st.id;
              const isPassed = CLOE_STAGES.findIndex(s => s.id === currentStage.id) > idx;

              return (
                <React.Fragment key={st.id}>
                  <div
                    onClick={() => isAdmin && handleStatusChange(st.id, `Transición rápida al estado: ${st.name}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? st.bg : isPassed ? 'rgba(255,255,255,0.04)' : 'transparent',
                      border: `1px solid ${isCurrent ? st.border : isPassed ? 'var(--border-subtle)' : 'transparent'}`,
                      color: isCurrent ? st.color : isPassed ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: isAdmin ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                    title={`${st.name} (${st.role})`}
                  >
                    <span style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: isCurrent ? st.color : isPassed ? 'var(--text-muted)' : 'var(--border-medium)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 700
                    }}>
                      {st.stepNumber}
                    </span>
                    <span>{st.shortName}</span>
                    {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color }} />}
                  </div>

                  {idx < CLOE_STAGES.length - 1 && (
                    <ArrowRight size={10} style={{ color: isPassed ? 'var(--primary)' : 'var(--border-medium)', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Header: Title, Tags & Operator Action Bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--bg-surface)'
        }}>
          {/* Main Title Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'var(--primary-subtle)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {ticket.id}
                </span>

                {/* Platform Badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: platform.bg,
                  color: platform.color,
                  border: `1px solid ${platform.border}`
                }}>
                  {platform.label} &bull; {platform.fullName}
                </span>

                {/* Area Badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  Área: {area}
                </span>

                {/* Priority Badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: currentPrio.bg,
                  color: currentPrio.color,
                  border: `1px solid ${currentPrio.border}`
                }}>
                  {currentPrio.label} ({currentPrio.sla})
                </span>

                {/* Estimation */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={11} />
                  <span>{estimationHours}h estimadas</span>
                </span>

                {/* Current Stage Badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: currentStage.bg,
                  color: currentStage.color,
                  border: `1px solid ${currentStage.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span>Etapa: {currentStage.name}</span>
                </span>
              </div>

              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                {ticket.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Operator Contextual Action Bar */}
          {isAdmin && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              background: 'var(--bg-surface-elevated)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              {/* Operator switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operando como:</span>
                <button
                  type="button"
                  onClick={() => onToggleOperator && onToggleOperator()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: operator === 'omar' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(2, 132, 199, 0.2)',
                    color: operator === 'omar' ? '#C084FC' : '#38BDF8',
                    border: `1px solid ${operator === 'omar' ? '#9333EA' : '#0284C7'}`
                  }}
                  title="Haz clic para alternar entre Eduardo y Omar"
                >
                  {operator === 'omar' ? <Shield size={12} /> : <Terminal size={12} />}
                  <span>{operator === 'omar' ? '🔍 Omar Díaz (QA / Tester)' : '💻 Eduardo (Desarrollador)'}</span>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>(Cambiar)</span>
                </button>
              </div>

              {/* Smart Flow Progression Button according to Stage */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {currentStage.id === 'backlog' && (
                  <button
                    onClick={() => handleStatusChange('planned', 'Requerimiento clasificado y asignado al sprint semanal.')}
                    disabled={updatingStatus}
                    style={{
                      background: '#8B5CF6',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Play size={12} />
                    <span>Planear y Asignar Sprint</span>
                  </button>
                )}

                {currentStage.id === 'planned' && (
                  <button
                    onClick={() => handleStatusChange('in_progress', 'Eduardo comenzó el desarrollo en el workspace VTEX.')}
                    disabled={updatingStatus}
                    style={{
                      background: '#0284C7',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Terminal size={12} />
                    <span>Iniciar Desarrollo en Workspace</span>
                  </button>
                )}

                {currentStage.id === 'in_progress' && (
                  <button
                    onClick={() => {
                      if (!vtexWorkspace && !confirm('No has registrado nombre de workspace VTEX. ¿Enviar a QA de todos modos?')) return;
                      handleStatusChange('in_qa', 'Eduardo completó el desarrollo y pasó el ticket a QA con Omar Díaz (adiaz@oemoda.com) en workspace VTEX.');
                    }}
                    disabled={updatingStatus}
                    style={{
                      background: '#9333EA',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Shield size={12} />
                    <span>🚀 Enviar a QA con Omar</span>
                  </button>
                )}

                {currentStage.id === 'in_qa' && (
                  <>
                    <button
                      onClick={handleNotifyOmar}
                      disabled={notifyingOmar}
                      style={{
                        background: 'rgba(147, 51, 234, 0.2)',
                        color: '#C084FC',
                        border: '1px solid #9333EA',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Enviar recordatorio a Omar Díaz (adiaz@oemoda.com)"
                    >
                      <Mail size={12} />
                      <span>{notifyingOmar ? 'Notificando...' : '📧 Notificar a Omar'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('findings');
                        setShowFindingForm(true);
                      }}
                      style={{
                        background: 'rgba(217, 119, 6, 0.2)',
                        color: '#FBBF24',
                        border: '1px solid #D97706',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Bug size={12} />
                      <span>Registrar Hallazgo ({openFindings.length})</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('ready_release', 'Omar Díaz (QA) otorgó el Visto Bueno formal. Requerimiento validado y listo para liberación.', {
                        qaApprovedBy: 'Omar Díaz (QA / Tester)',
                        qaApprovedAt: new Date().toISOString()
                      })}
                      disabled={updatingStatus}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCheck size={12} />
                      <span>✅ Dar Visto Bueno de QA</span>
                    </button>
                  </>
                )}

                {currentStage.id === 'corrections' && (
                  <button
                    onClick={() => handleStatusChange('in_qa', 'Eduardo corrigió los hallazgos reportados. Ticket enviado nuevamente a revalidación de Omar Díaz (adiaz@oemoda.com).')}
                    disabled={updatingStatus}
                    style={{
                      background: '#9333EA',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Re-enviar a QA con Omar</span>
                  </button>
                )}

                {currentStage.id === 'ready_release' && (
                  <button
                    onClick={() => {
                      if (isFridayToday() && !confirm('⚠️ ATENCIÓN: Es VIERNES. La política CLOE prohíbe despliegues en fin de semana salvo emergencia P1. ¿Deseas forzar la liberación?')) {
                        return;
                      }
                      handleStatusChange('monitoring', 'Eduardo liberó a Producción. Ticket entra en periodo de monitoreo 24-48h.');
                    }}
                    disabled={updatingStatus}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>🎉 Liberar a Producción (Lunes)</span>
                  </button>
                )}

                {currentStage.id === 'monitoring' && (
                  <button
                    onClick={() => handleStatusChange('closed', 'Monitoreo satisfactorio post-release. Ticket cerrado exitosamente.')}
                    disabled={updatingStatus}
                    style={{
                      background: '#475569',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Cerrar Ticket & Lecciones</span>
                  </button>
                )}

                {/* Manual Override selector */}
                <select
                  value={currentStage.id}
                  onChange={(e) => handleStatusChange(e.target.value, `Cambio manual de etapa a: ${STAGE_MAP[e.target.value]?.name}`)}
                  disabled={updatingStatus}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer'
                  }}
                  title="Cambio manual de etapa"
                >
                  {CLOE_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.stepNumber}. {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Friday Release Caution Notice if today is Friday */}
          {isFridayToday() && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px dashed #EF4444',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '11px',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={13} />
              <span>
                <strong>Regla de Liberación CLOE:</strong> Hoy es VIERNES. No se realizan liberaciones a producción para no poner en riesgo las ventas del fin de semana. Día reservado para QA, correcciones y planeación.
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
          padding: '0 16px',
          gap: '8px',
          fontSize: '12px'
        }}>
          <button
            onClick={() => setActiveTab('workflow')}
            style={{
              padding: '8px 12px',
              fontWeight: activeTab === 'workflow' ? 700 : 500,
              color: activeTab === 'workflow' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'workflow' ? '2px solid var(--primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={13} />
            <span>Detalle & Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            style={{
              padding: '8px 12px',
              fontWeight: activeTab === 'qa' ? 700 : 500,
              color: activeTab === 'qa' ? '#9333EA' : 'var(--text-secondary)',
              borderBottom: activeTab === 'qa' ? '2px solid #9333EA' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ListChecks size={13} />
            <span>Checklist QA Omar ({checkedQaCount}/12)</span>
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            style={{
              padding: '8px 12px',
              fontWeight: activeTab === 'findings' ? 700 : 500,
              color: activeTab === 'findings' ? '#D97706' : 'var(--text-secondary)',
              borderBottom: activeTab === 'findings' ? '2px solid #D97706' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bug size={13} />
            <span>Hallazgos & Bugs ({openFindings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conversation')}
            style={{
              padding: '8px 12px',
              fontWeight: activeTab === 'conversation' ? 700 : 500,
              color: activeTab === 'conversation' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'conversation' ? '2px solid var(--primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Mail size={13} />
            <span>Conversación & M365 ({messages.length})</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('vtex_tools')}
                style={{
                  padding: '8px 12px',
                  fontWeight: activeTab === 'vtex_tools' ? 700 : 500,
                  color: activeTab === 'vtex_tools' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'vtex_tools' ? '2px solid var(--primary)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Terminal size={13} />
                <span>Accesos VTEX</span>
              </button>

              <button
                onClick={() => setActiveTab('emails')}
                style={{
                  padding: '8px 12px',
                  fontWeight: activeTab === 'emails' ? 700 : 500,
                  color: activeTab === 'emails' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'emails' ? '2px solid var(--primary)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Emails [{ticket.id}] ({emailsLog.length})</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: WORKFLOW & WORKSPACE DETAILS */}
          {activeTab === 'workflow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Technical Assignment Box (Eduardo & Omar Fields) */}
              {isAdmin && (
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <Terminal size={14} color="var(--primary)" />
                      <span>Gestión Técnica del Requerimiento (Eduardo & Omar)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveMeta}
                      disabled={savingMeta}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {savingMeta ? 'Guardando...' : 'Guardar Cambios Técnicos'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                    {/* VTEX Workspace */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Workspace VTEX IO:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          value={vtexWorkspace}
                          onChange={(e) => setVtexWorkspace(e.target.value)}
                          placeholder="ej. fix-checkout o hot-sale"
                          style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                        />
                        {getWorkspaceUrl() && (
                          <a
                            href={getWorkspaceUrl()}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 10px',
                              background: 'var(--primary-subtle)',
                              color: 'var(--primary)',
                              border: '1px solid var(--primary)',
                              borderRadius: 'var(--radius-sm)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                            title="Abrir workspace en navegador"
                          >
                            <span>Abrir</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {platform.workspaceDomain}
                      </span>
                    </div>

                    {/* Estimation Hours */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Estimación Esfuerzo (Horas):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={estimationHours}
                        onChange={(e) => setEstimationHours(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                      />
                    </div>

                    {/* Target Release Date (Mondays) */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Lanzamiento Meta (Lunes):
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          value={targetReleaseDate}
                          onChange={(e) => setTargetReleaseDate(e.target.value)}
                          placeholder="ej. Lun 29 Sep o Lun 6 Oct"
                          style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setTargetReleaseDate(getNextMondayFormatted())}
                          style={{
                            padding: '4px 8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-secondary)',
                            fontSize: '10px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Fijar próximo lunes"
                        >
                          Próx. Lun
                        </button>
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Área Solicitante:
                      </label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                      >
                        {CLOE_AREAS.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Figma URL */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Enlace de Figma / Referencias de Diseño:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="url"
                          value={figmaUrl}
                          onChange={(e) => setFigmaUrl(e.target.value)}
                          placeholder="https://www.figma.com/file/..."
                          style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                        />
                        {figmaUrl && (
                          <a
                            href={figmaUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 10px',
                              background: '#8B5CF6',
                              color: '#fff',
                              borderRadius: 'var(--radius-sm)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            <span>Figma</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Metadata Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                background: 'var(--bg-surface-elevated)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Solicitante:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <User size={13} />
                    <span>{ticket.requesterName}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{ticket.requesterEmail}</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Fecha de Solicitud:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                    <Calendar size={13} />
                    <span>{new Date(ticket.createdAt).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                {ticket.orderId && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>ID Orden VTEX:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                        {ticket.orderId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(ticket.orderId)}
                        title="Copiar ID"
                        style={{ padding: '2px', color: copiedOrder ? 'var(--status-resolved)' : 'var(--text-muted)' }}
                      >
                        {copiedOrder ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                )}

                {ticket.affectedUrl && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>URL en Producción:</span>
                    <a
                      href={ticket.affectedUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all'
                      }}
                    >
                      <span>{ticket.affectedUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Requirement Description */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Objetivo y Alcance del Requerimiento
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}>
                  {ticket.description}
                </div>

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Evidencias y Adjuntos:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {ticket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            color: 'var(--primary)',
                            textDecoration: 'none'
                          }}
                        >
                          <Paperclip size={12} />
                          <span>{att.originalName || att.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QA CHECKLIST (OMAR'S 12 POINTS) */}
          {activeTab === 'qa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Progress Summary Card */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Checklist Oficial de Calidad QA (Omar)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      12 puntos de control obligatorios antes de autorizar la liberación a producción.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: qaPercentage === 100 ? '#10B981' : '#9333EA'
                    }}>
                      {checkedQaCount} / 12 ({qaPercentage}%)
                    </span>

                    {ticket.qaApprovedBy && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        border: '1px solid #10B981'
                      }}>
                        Aprobado por {ticket.qaApprovedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${qaPercentage}%`,
                    height: '100%',
                    background: qaPercentage === 100 ? '#10B981' : '#9333EA',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* 12 Checklist Items */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '10px'
              }}>
                {qaItems.map((item, idx) => {
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        background: item.checked ? 'rgba(147, 51, 234, 0.08)' : 'var(--bg-surface)',
                        border: `1px solid ${item.checked ? '#9333EA' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: isAdmin ? 'pointer' : 'default',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled={!isAdmin}
                        onChange={() => handleToggleChecklist(item.id, item.checked)}
                        style={{ marginTop: '2px', accentColor: '#9333EA', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: item.checked ? 'var(--text-primary)' : 'var(--text-secondary)',
                          textDecoration: item.checked ? 'none' : 'none'
                        }}>
                          {idx + 1}. {item.label}
                        </div>
                        {item.checked && (
                          <div style={{ fontSize: '10px', color: '#C084FC', marginTop: '2px' }}>
                            Validado {item.checkedBy ? `por ${item.checkedBy}` : ''}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Fast Approvals */}
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      qaItems.forEach(i => {
                        if (!i.checked) handleToggleChecklist(i.id, false);
                      });
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-secondary)',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    Marcar todos como Validados
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('ready_release', 'Checklist de QA completado al 100%. Visto Bueno otorgado por Omar Díaz.', {
                      qaApprovedBy: operator === 'omar' ? 'Omar Díaz (QA / Tester)' : 'Eduardo (Dev)',
                      qaApprovedAt: new Date().toISOString()
                    })}
                    style={{
                      padding: '6px 14px',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CheckCheck size={13} />
                    <span>Dar Visto Bueno Formal de QA</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QA FINDINGS (BUGS) */}
          {activeTab === 'findings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Registro de Hallazgos y Observaciones de QA
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Incidencias detectadas durante las pruebas para que Eduardo las atienda.
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowFindingForm(!showFindingForm)}
                    style={{
                      padding: '6px 12px',
                      background: '#D97706',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Bug size={12} />
                    <span>{showFindingForm ? 'Cancelar' : '+ Registrar Nuevo Hallazgo'}</span>
                  </button>
                )}
              </div>

              {/* New Finding Form */}
              {showFindingForm && (
                <form onSubmit={handleAddFinding} style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid #D97706',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FBBF24' }}>
                    Documentar Hallazgo de QA (Omar)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Título del Error / Comportamiento Inesperado *
                      </label>
                      <input
                        type="text"
                        required
                        value={findingTitle}
                        onChange={(e) => setFindingTitle(e.target.value)}
                        placeholder="ej. Botón de checkout se desborda en iPhone 14 Safari"
                        style={{ width: '100%', padding: '7px 9px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Severidad
                      </label>
                      <select
                        value={findingSeverity}
                        onChange={(e) => setFindingSeverity(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                      >
                        <option value="blocker">🔴 Bloqueante (Impide compras o release)</option>
                        <option value="major">🟠 Mayor (Falla visual o funcional severa)</option>
                        <option value="minor">🟡 Menor (Alineación, copy, detalle menor)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Dispositivo / Navegador Afectado
                      </label>
                      <input
                        type="text"
                        value={findingDevice}
                        onChange={(e) => setFindingDevice(e.target.value)}
                        placeholder="ej. Mobile iOS Safari / Desktop Edge"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Pasos para replicar / Detalle
                    </label>
                    <textarea
                      rows={2}
                      value={findingDesc}
                      onChange={(e) => setFindingDesc(e.target.value)}
                      placeholder="Pasos para reproducir, URL específica o comportamiento esperado..."
                      style={{ width: '100%', padding: '7px 9px', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowFindingForm(false)}
                      style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingFinding || !findingTitle.trim()}
                      style={{
                        padding: '6px 14px',
                        background: '#D97706',
                        color: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {submittingFinding ? 'Guardando...' : 'Guardar y Mover a Corrección'}
                    </button>
                  </div>
                </form>
              )}

              {/* Findings List */}
              {findings.length === 0 ? (
                <div style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  <CheckCircle2 size={24} color="#10B981" style={{ margin: '0 auto 8px' }} />
                  <div>No hay hallazgos registrados. El requerimiento se encuentra limpio en QA.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {findings.map((f) => {
                    const isOpen = f.status === 'open';
                    return (
                      <div
                        key={f.id}
                        style={{
                          background: isOpen ? 'rgba(217, 119, 6, 0.08)' : 'var(--bg-surface)',
                          border: `1px solid ${isOpen ? '#D97706' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '3px',
                              background: f.severity === 'blocker' ? '#EF4444' : f.severity === 'major' ? '#F97316' : '#EAB308',
                              color: '#fff'
                            }}>
                              {f.severity.toUpperCase()}
                            </span>

                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {f.title}
                            </span>

                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              &bull; {f.device}
                            </span>

                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '10px',
                              background: isOpen ? '#D97706' : '#10B981',
                              color: '#fff',
                              fontWeight: 600
                            }}>
                              {isOpen ? 'Pendiente de Fix' : 'Corregido ✓'}
                            </span>
                          </div>

                          {f.description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {f.description}
                            </div>
                          )}

                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Reportado por {f.reportedBy} &bull; {new Date(f.reportedAt).toLocaleString('es-MX')}
                            {f.fixedAt && ` &bull; Corregido el ${new Date(f.fixedAt).toLocaleString('es-MX')}`}
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleFindingStatus(f.id, isOpen ? 'fixed' : 'open')}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: 'var(--radius-sm)',
                              background: isOpen ? '#059669' : 'var(--bg-surface-elevated)',
                              color: isOpen ? '#fff' : 'var(--text-secondary)',
                              border: `1px solid ${isOpen ? '#059669' : 'var(--border-medium)'}`,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isOpen ? 'Marcar Corregido' : 'Reabrir Bug'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONVERSATION */}
          {activeTab === 'conversation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Historial de Mensajes & Correo Corporativo
              </div>

              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Cargando mensajes...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No hay mensajes registrados.
                </div>
              ) : (
                messages.map((msg) => {
                  const isDev = msg.senderRole === 'admin';
                  const isNote = msg.isInternalNote;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        background: isNote
                          ? 'rgba(245, 158, 11, 0.08)'
                          : isDev
                          ? 'var(--bg-surface-elevated)'
                          : 'var(--bg-surface)',
                        border: isNote
                          ? '1px dashed #F59E0B'
                          : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '12px',
                            color: isNote ? '#F59E0B' : isDev ? 'var(--primary)' : 'var(--text-primary)'
                          }}>
                            {msg.senderName}
                          </span>
                          {isNote && (
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: '#F59E0B',
                              color: '#000000',
                              fontWeight: 700
                            }}>
                              NOTA INTERNA PRIVADA
                            </span>
                          )}
                          {msg.source === 'email' && (
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#3B82F6'
                            }}>
                              Respondido vía Correo
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(msg.createdAt).toLocaleString('es-MX')}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: isNote ? 'var(--font-mono)' : 'inherit'
                      }}>
                        {msg.content}
                      </div>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {msg.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-medium)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                color: 'var(--primary)',
                                textDecoration: 'none'
                              }}
                            >
                              <Paperclip size={11} />
                              <span>{att.originalName || att.filename}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* TAB 5: VTEX TOOLS */}
          {activeTab === 'vtex_tools' && isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Accesos Directos a Consola VTEX ({platform.label})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <a
                  href={`https://${ticket.store === 'cloefactorystore.com.mx' ? 'cloefactorystore' : 'cloe'}.myvtex.com/admin/orders`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '13px' }}>VTEX OMS (Pedidos)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Buscar orden {ticket.orderId || 'en OMS'}</div>
                </a>

                <a
                  href={`https://${ticket.store === 'cloefactorystore.com.mx' ? 'cloefactorystore' : 'cloe'}.myvtex.com/admin/rates-and-benefits`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '13px' }}>VTEX Promociones</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revisar cupones y descuentos</div>
                </a>

                <a
                  href={`https://${ticket.store === 'cloefactorystore.com.mx' ? 'cloefactorystore' : 'cloe'}.myvtex.com/admin/checkout`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '13px' }}>VTEX Checkout</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pasarelas y pagos</div>
                </a>

                <a
                  href={`https://${ticket.store === 'cloefactorystore.com.mx' ? 'cloefactorystore' : 'cloe'}.myvtex.com/admin/dynamic-storage`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '13px' }}>VTEX MasterData</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entidades y clientes</div>
                </a>
              </div>
            </div>
          )}

          {/* TAB 6: EMAILS LOG */}
          {activeTab === 'emails' && isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Trazabilidad de Correos con Token [{ticket.id}]
              </div>
              {emailsLog.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
                  No hay correos registrados para este ticket.
                </div>
              ) : (
                emailsLog.map(em => (
                  <div key={em.id} style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: em.type === 'inbound' ? '#3B82F6' : 'var(--primary)' }}>
                        {em.type === 'inbound' ? '⬅️ RECIBIDO (Respuesta Usuario)' : '➡️ ENVIADO (Notificación)'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {new Date(em.createdAt).toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {em.subject}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                      {em.bodyText}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Reply Composer */}
        <div
          className="modal-mobile-sticky-footer"
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {isAdmin && (
            <div className="mobile-scroll-x" style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Plantillas Rápidas:</span>
              {DEV_MACROS.map((macro, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(macro.text)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {macro.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                isAdmin
                  ? isInternalNote
                    ? `Nota interna privada como ${operator === 'omar' ? 'Omar (QA)' : 'Eduardo (Dev)'} (queries, notas de build, logs)...`
                    : `Respuesta para el solicitante como ${operator === 'omar' ? 'Omar (QA)' : 'Eduardo (Dev)'}...`
                  : 'Escribe tu respuesta o comentario para el equipo de desarrollo...'
              }
              style={{
                fontSize: '13px',
                resize: 'none'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isAdmin ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: isInternalNote ? '#F59E0B' : 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <Lock size={12} />
                  <span>Nota Interna Privada ({operator === 'omar' ? 'QA' : 'Dev'})</span>
                </label>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tu comentario se notificará al equipo de ingeniería.
                </div>
              )}

              <button
                type="submit"
                disabled={!replyText.trim() || sendingMessage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isInternalNote ? '#D97706' : 'var(--primary)',
                  color: '#ffffff',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <Send size={13} />
                <span>{sendingMessage ? 'Enviando...' : isInternalNote ? 'Guardar Nota' : 'Enviar Mensaje'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
