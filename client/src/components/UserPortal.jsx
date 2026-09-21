import React, { useState } from 'react';
import TicketCard from './TicketCard';
import {
  PlusCircle,
  Search,
  Mail,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Store,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function UserPortal({ onOpenNewTicket, onSelectTicket, tickets = [], onEmailChange }) {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('cloe_user_email') || '');
  const [searchQuery, setSearchQuery] = useState('');

  const myTickets = userEmail
    ? tickets.filter(t => t.requesterEmail.toLowerCase() === userEmail.toLowerCase())
    : tickets;

  const displayedTickets = myTickets.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  const handleEmailSave = (email) => {
    const trimmed = email.trim();
    setUserEmail(trimmed);
    localStorage.setItem('cloe_user_email', trimmed);
    if (onEmailChange) {
      onEmailChange(trimmed);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '16px 14px' }}>
      {/* Clean Minimalist Hero */}
      <div
        className="mobile-hero-stack"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px'
          }}>
            Ingeniería de Software & Soporte Técnico Cloe
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: 0
          }}>
            Canal técnico exclusivo para reportar requerimientos de código, rendimiento, bases de datos (DBA), APIs, módulos nuevos e integraciones de <strong>cloe.com.mx</strong> y <strong>Cloe Factory Store</strong>.
          </p>
        </div>

        <button
          onClick={onOpenNewTicket}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <PlusCircle size={16} />
          <span>Crear Nuevo Ticket</span>
        </button>
      </div>

      {/* Email Identification & Search Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <Mail size={16} color="var(--primary)" />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
              Tu correo corporativo (@oemoda.com / @cloe.com.mx)
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo para ver el estado de tus tickets..."
              value={userEmail}
              onChange={(e) => handleEmailSave(e.target.value)}
              style={{
                fontSize: '13px',
                padding: '7px 10px'
              }}
            />
          </div>
        </div>

        {/* Search */}
        <div style={{ minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por ID (ej. CLOE-1006) o texto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '13px', padding: '7px 10px 7px 32px' }}
            />
          </div>
        </div>
      </div>

      {/* Header section for user tickets */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Mis Solicitudes de Ingeniería
          </span>
          {userEmail && (
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-elevated)',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)'
            }}>
              {userEmail}
            </span>
          )}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {displayedTickets.length} solicitud(es)
        </span>
      </div>

      {/* Tickets List */}
      {displayedTickets.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '48px 20px',
          textAlign: 'center',
          borderRadius: 'var(--radius-md)'
        }}>
          <CheckCircle2 size={36} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {!userEmail
              ? 'Ingresa tu correo institucional arriba para ver tus tickets'
              : 'No tienes solicitudes activas registradas con este correo'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            {!userEmail
              ? 'Introduce tu cuenta de OE Moda o Cloe en el campo superior para consultar el estatus y respuestas del desarrollador, o levanta una nueva solicitud técnica.'
              : '¿Tienes un requerimiento de desarrollo, base de datos (DBA), APIs o fallo en checkout?'}
          </p>
          <button
            onClick={onOpenNewTicket}
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Crear Solicitud
          </button>
        </div>
      ) : (
        <div
          className="mobile-grid-1col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '12px'
          }}
        >
          {displayedTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={onSelectTicket}
            />
          ))}
        </div>
      )}

      {/* Minimalist Follow-up Note */}
      <div style={{
        marginTop: '28px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail size={16} color="var(--primary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Respuesta por correo:</strong> Puedes responder directamente desde tu aplicación de Outlook o Microsoft 365 a cualquier notificación para agregar notas al ticket.
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--primary)',
          background: 'var(--primary-subtle)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          Re: [CLOE-XXXX]
        </span>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={onOpenNewTicket}
        className="mobile-fab-btn show-mobile"
        title="Crear Nuevo Ticket"
      >
        <PlusCircle size={18} />
        <span>Nuevo Ticket</span>
      </button>
    </div>
  );
}
