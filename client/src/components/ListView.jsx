import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Shield,
  Bug,
  Terminal,
  ExternalLink
} from 'lucide-react';
import {
  CLOE_PRIORITIES,
  CLOE_PLATFORMS,
  STAGE_MAP,
  normalizeStatus
} from '../cloeWorkflow';

export default function ListView({ tickets, onSelectTicket }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{
              background: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)'
            }}>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '100px' }}>ID</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Descripción</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '110px' }}>Plataforma</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '100px' }}>Área</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '90px' }}>Prioridad</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '90px' }}>Estimación</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Estado</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '120px' }}>Lanzamiento</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, width: '110px' }}>QA Omar</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron tickets con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              tickets.map((t) => {
                const norm = normalizeStatus(t.status);
                const stage = STAGE_MAP[norm] || STAGE_MAP.backlog;
                const prio = CLOE_PRIORITIES[t.priority] || CLOE_PRIORITIES.p3_medium;
                const platform = CLOE_PLATFORMS[t.store] || CLOE_PLATFORMS['cloe.com.mx'];

                // QA stats
                const qaList = t.qaChecklist || [];
                const checkedQa = qaList.filter(i => i.checked).length;
                const findings = t.qaFindings || [];
                const openFindings = findings.filter(f => f.status === 'open').length;

                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* ID */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        background: 'var(--primary-subtle)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {t.id}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td style={{ padding: '12px 14px', maxWidth: '340px' }}>
                      <div style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.title}
                      </div>
                      {t.vtexWorkspace && (
                        <div style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          marginTop: '2px'
                        }}>
                          <Terminal size={10} />
                          <span>ws: {t.vtexWorkspace}</span>
                        </div>
                      )}
                    </td>

                    {/* Plataforma */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: platform.bg,
                        color: platform.color,
                        border: `1px solid ${platform.border}`
                      }}>
                        {platform.label}
                      </span>
                    </td>

                    {/* Área */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)'
                      }}>
                        {t.area || 'eCommerce'}
                      </span>
                    </td>

                    {/* Prioridad con círculo idéntico a la infografía */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: prio.color,
                          display: 'inline-block'
                        }} />
                        <span style={{ fontWeight: 700, fontSize: '11px', color: prio.color }}>
                          {prio.tag}
                        </span>
                      </div>
                    </td>

                    {/* Estimación */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{t.estimationHours || 4} h</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: stage.bg,
                        color: stage.color,
                        border: `1px solid ${stage.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {stage.shortName}
                      </span>
                    </td>

                    {/* Lanzamiento (Meta Lunes) */}
                    <td style={{ padding: '12px 14px' }}>
                      {t.targetReleaseDate ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#10B981',
                          fontWeight: 600,
                          fontSize: '11px'
                        }}>
                          <Calendar size={12} />
                          <span>{t.targetReleaseDate}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>-</span>
                      )}
                    </td>

                    {/* QA Omar */}
                    <td style={{ padding: '12px 14px' }}>
                      {openFindings > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#FBBF24',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}>
                          <Bug size={12} />
                          <span>{openFindings} Bug{openFindings > 1 ? 's' : ''}</span>
                        </span>
                      ) : t.qaApprovedBy ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#10B981',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}>
                          <CheckCircle2 size={12} />
                          <span>Aprobado</span>
                        </span>
                      ) : qaList.length > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#C084FC',
                          fontWeight: 600,
                          fontSize: '11px'
                        }}>
                          <Shield size={12} />
                          <span>{checkedQa}/12</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
