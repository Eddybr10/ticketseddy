import React from 'react';
import {
  Clock,
  User,
  ShoppingBag,
  Store,
  Building,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Calendar,
  Layers,
  Terminal,
  Shield
} from 'lucide-react';
import {
  CLOE_PRIORITIES,
  CLOE_PLATFORMS,
  AREA_MAP,
  STAGE_MAP,
  normalizeStatus
} from '../cloeWorkflow';

export default function TicketCard({ ticket, onClick, isDraggable = false, onDragStart }) {
  const prio = CLOE_PRIORITIES[ticket.priority] || CLOE_PRIORITIES.p3_medium;
  const platform = CLOE_PLATFORMS[ticket.store] || CLOE_PLATFORMS['cloe.com.mx'];
  const stage = STAGE_MAP[normalizeStatus(ticket.status)] || STAGE_MAP.backlog;

  // QA Checklist stats
  const qaItems = ticket.qaChecklist || [];
  const checkedQaCount = qaItems.filter(i => i.checked).length;
  const isQaComplete = qaItems.length > 0 && checkedQaCount === qaItems.length;

  // Findings
  const findings = ticket.qaFindings || [];
  const openFindingsCount = findings.filter(f => f.status === 'open').length;

  return (
    <div
      onClick={() => onClick(ticket)}
      draggable={isDraggable}
      onDragStart={onDragStart}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderLeft: ticket.priority === 'p1_critical' ? '3px solid #EF4444' : `3px solid ${stage.color}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
        transition: 'border-color 0.15s, transform 0.1s',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--text-muted)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Top Header: ID, Platform & Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {ticket.id}
          </span>

          <span style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '1px 5px',
            borderRadius: '3px',
            background: platform.bg,
            color: platform.color,
            border: `1px solid ${platform.border}`
          }}>
            {platform.label}
          </span>

          {ticket.area && (
            <span style={{
              fontSize: '10px',
              fontWeight: 500,
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-secondary)'
            }}>
              {ticket.area}
            </span>
          )}
        </div>

        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: '4px',
          background: prio.bg,
          color: prio.color,
          border: `1px solid ${prio.border}`
        }}>
          {prio.tag}
        </span>
      </div>

      {/* Ticket Title */}
      <h4 style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1.35,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {ticket.title}
      </h4>

      {/* QA & Workspace Micro-Badges */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '10px' }}>
        {ticket.vtexWorkspace ? (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 5px',
            borderRadius: '3px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)'
          }}>
            <Terminal size={10} />
            <span>{ticket.vtexWorkspace}</span>
          </span>
        ) : null}

        {/* QA Checklist Progress */}
        {qaItems.length > 0 && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 5px',
            borderRadius: '3px',
            background: isQaComplete ? 'rgba(16, 185, 129, 0.15)' : 'rgba(147, 51, 234, 0.12)',
            color: isQaComplete ? '#10B981' : '#C084FC',
            fontWeight: 600
          }}>
            <Shield size={10} />
            <span>QA {checkedQaCount}/12</span>
          </span>
        )}

        {/* Open Findings Alert */}
        {openFindingsCount > 0 && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 5px',
            borderRadius: '3px',
            background: 'rgba(217, 119, 6, 0.2)',
            color: '#FBBF24',
            fontWeight: 700
          }}>
            <Bug size={10} />
            <span>{openFindingsCount} Bug{openFindingsCount > 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {/* Footer Info: Estimation, Release Target & Requester */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          <span>{ticket.estimationHours || 4}h</span>
        </div>

        {ticket.targetReleaseDate ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: '#10B981',
            fontWeight: 600,
            fontSize: '10px'
          }}>
            <Calendar size={10} />
            <span>{ticket.targetReleaseDate}</span>
          </div>
        ) : (
          <div style={{
            maxWidth: '110px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '10px'
          }}>
            {ticket.requesterName}
          </div>
        )}
      </div>
    </div>
  );
}
