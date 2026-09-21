import React, { useState } from 'react';
import TicketCard from './TicketCard';
import { Inbox, CheckCircle2, Shield, Terminal, Bug, Play, Sparkles, Layers } from 'lucide-react';
import { CLOE_STAGES, normalizeStatus } from '../cloeWorkflow';

export default function KanbanBoard({ tickets, onSelectTicket, onUpdateTicketStatus }) {
  const [draggedTicketId, setDraggedTicketId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [activeMobileCol, setActiveMobileCol] = useState('backlog');

  const handleDragStart = (e, ticketId) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
    if (!ticketId) return;

    onUpdateTicketStatus(ticketId, targetStatus);
    setDraggedTicketId(null);
  };

  return (
    <div>
      {/* Mobile Column Tab Switcher */}
      <div className="mobile-scroll-x show-mobile" style={{ marginBottom: '14px', gap: '8px' }}>
        {CLOE_STAGES.map(col => {
          const count = tickets.filter(t => normalizeStatus(t.status) === col.id).length;
          const isActive = activeMobileCol === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileCol(col.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: isActive ? col.color : 'var(--bg-surface-elevated)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? col.color : 'var(--border-subtle)'}`,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <span>{col.stepNumber}. {col.shortName}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : col.bg,
                color: isActive ? '#ffffff' : col.color,
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Columns Grid / Mobile Stack */}
      <div
        className="kanban-desktop-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, minmax(240px, 1fr))',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '20px',
          minHeight: 'calc(100vh - 220px)'
        }}
      >
        {CLOE_STAGES.map((col) => {
          const colTickets = tickets.filter(t => normalizeStatus(t.status) === col.id);
          const isTarget = dragOverCol === col.id;
          const isMobileActive = activeMobileCol === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-column ${isMobileActive ? 'active-mobile-col' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isTarget ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: isTarget ? `2px dashed ${col.color}` : '1px solid var(--border-subtle)',
                transition: 'background 0.15s, border-color 0.15s',
                height: '100%',
                minWidth: '240px'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface-elevated)',
                borderTopLeftRadius: 'var(--radius-md)',
                borderTopRightRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: col.color,
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {col.stepNumber}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {col.shortName}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {col.role}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: col.bg,
                  color: col.color,
                  border: `1px solid ${col.border}`
                }}>
                  {colTickets.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div style={{
                flex: 1,
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 280px)'
              }}>
                {colTickets.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 10px',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    textAlign: 'center',
                    gap: '4px'
                  }}>
                    <Inbox size={18} strokeWidth={1.5} />
                    <span>Sin tickets</span>
                  </div>
                ) : (
                  colTickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={onSelectTicket}
                      isDraggable={true}
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
