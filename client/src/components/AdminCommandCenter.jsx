import React, { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import ListView from './ListView';
import {
  Search,
  Kanban,
  List,
  ShoppingBag,
  Store,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  PlusCircle,
  Shield,
  Terminal,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import {
  CLOE_AREAS,
  CLOE_PRIORITIES,
  CLOE_STAGES,
  normalizeStatus,
  isFridayToday
} from '../cloeWorkflow';

export default function AdminCommandCenter({
  tickets,
  onSelectTicket,
  onUpdateTicketStatus,
  onRefresh,
  onOpenNewTicket,
  operator = 'eduardo',
  onToggleOperator
}) {
  const [storeFilter, setStoreFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('kanban');
  const [showRulesBanner, setShowRulesBanner] = useState(true);

  const filteredTickets = tickets.filter(t => {
    if (storeFilter !== 'all' && t.store !== storeFilter && t.store !== 'both') return false;
    if (areaFilter !== 'all' && t.area !== areaFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.requesterName && t.requesterName.toLowerCase().includes(q)) ||
        (t.vtexWorkspace && t.vtexWorkspace.toLowerCase().includes(q)) ||
        (t.orderId && t.orderId.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Stage KPI counts
  const inDevCount = tickets.filter(t => normalizeStatus(t.status) === 'in_progress').length;
  const inQaCount = tickets.filter(t => normalizeStatus(t.status) === 'in_qa').length;
  const readyProdCount = tickets.filter(t => normalizeStatus(t.status) === 'ready_release').length;
  const inMonitoringCount = tickets.filter(t => normalizeStatus(t.status) === 'monitoring').length;
  const criticalCount = tickets.filter(t => t.priority === 'p1_critical' && !['ready_release', 'monitoring', 'closed'].includes(normalizeStatus(t.status))).length;

  return (
    <div style={{ maxWidth: '1750px', margin: '0 auto', padding: '16px 14px' }}>

      {/* CLOE Release Policies & Process Banner */}
      {showRulesBanner && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                CLOE UX
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Flujo Operativo & Calidad (.com & Outlet)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#10B981" />
                <strong>Liberaciones: Solo LUNES</strong>
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isFridayToday() ? '#EF4444' : 'var(--text-secondary)' }}>
                <AlertTriangle size={13} color={isFridayToday() ? '#EF4444' : '#F59E0B'} />
                <strong>Viernes sin liberaciones</strong> (protección fin de semana)
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={13} color="#9333EA" />
                <strong>QA obligatorio de Omar</strong> antes de producir
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} color="#3B82F6" />
                <strong>Monitoreo post-release: 24-48h</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Operator Quick Switcher */}
            <button
              type="button"
              onClick={onToggleOperator}
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
              title="Alternar rol activo entre Eduardo y Omar"
            >
              {operator === 'omar' ? <Shield size={12} /> : <Terminal size={12} />}
              <span>{operator === 'omar' ? '🔍 Omar (QA / Tester)' : '💻 Eduardo (Desarrollador)'}</span>
            </button>

            <button
              onClick={() => setShowRulesBanner(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              title="Ocultar banner"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Top Bar: Store Switcher & Workflow KPIs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Store pills */}
        <div className="mobile-scroll-x" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setStoreFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: storeFilter === 'all' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: storeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={13} />
            <span>Todas las Tiendas ({tickets.length})</span>
          </button>

          <button
            onClick={() => setStoreFilter('cloe.com.mx')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: storeFilter === 'cloe.com.mx' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: storeFilter === 'cloe.com.mx' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShoppingBag size={13} />
            <span>.com ({tickets.filter(t => t.store === 'cloe.com.mx' || t.store === 'both').length})</span>
          </button>

          <button
            onClick={() => setStoreFilter('cloefactorystore.com.mx')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: storeFilter === 'cloefactorystore.com.mx' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: storeFilter === 'cloefactorystore.com.mx' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Store size={13} />
            <span>Outlet ({tickets.filter(t => t.store === 'cloefactorystore.com.mx' || t.store === 'both').length})</span>
          </button>
        </div>

        {/* Workflow Pipeline KPI Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {criticalCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--priority-p1-bg)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--priority-p1)',
              fontSize: '11px',
              color: 'var(--priority-p1)',
              fontWeight: 700
            }}>
              <AlertTriangle size={12} />
              <span>P1 Urgentes: {criticalCount}</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--stage-dev-bg)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--stage-dev)',
            fontSize: '11px',
            color: 'var(--stage-dev)',
            fontWeight: 600
          }}>
            <Terminal size={12} />
            <span>En Dev (Eduardo): {inDevCount}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--stage-qa-bg)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--stage-qa)',
            fontSize: '11px',
            color: 'var(--stage-qa)',
            fontWeight: 600
          }}>
            <Shield size={12} />
            <span>En QA (Omar): {inQaCount}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--stage-ready-prod-bg)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--stage-ready-prod)',
            fontSize: '11px',
            color: 'var(--stage-ready-prod)',
            fontWeight: 700
          }}>
            <Sparkles size={12} />
            <span>Listo Prod (Lunes): {readyProdCount}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--stage-monitoring-bg)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--stage-monitoring)',
            fontSize: '11px',
            color: 'var(--stage-monitoring)',
            fontWeight: 600
          }}>
            <Clock size={12} />
            <span>Monitoreo: {inMonitoringCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        {/* Left: Search & Filter selects */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por ID, título, workspace VTEX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '12px', padding: '6px 10px 6px 32px' }}
            />
          </div>

          {/* Area Filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '6px 10px' }}
          >
            <option value="all">Todas las Áreas</option>
            {CLOE_AREAS.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '6px 10px' }}
          >
            <option value="all">Todas las Prioridades</option>
            <option value="p1_critical">🔴 P1 - Urgente (Hoy mismo)</option>
            <option value="p2_high">🟠 P2 - Alta (1 - 2 días)</option>
            <option value="p3_medium">🟡 P3 - Media (3 - 5 días)</option>
            <option value="p4_low">⚪ P4 - Baja (&gt; 5 días)</option>
          </select>
        </div>

        {/* Right: Refresh & Layout switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRefresh}
            title="Refrescar tablero"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={14} />
          </button>

          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '2px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)'
          }}>
            <button
              onClick={() => setViewLayout('kanban')}
              title="Vista Tablero Kanban (8 Etapas)"
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewLayout === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewLayout === 'kanban' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewLayout('list')}
              title="Vista Tabla Ejecutiva (Ejemplo Semanal)"
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewLayout === 'list' ? 'var(--primary)' : 'transparent',
                color: viewLayout === 'list' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <List size={13} />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Board View: Kanban or Executive List */}
      {viewLayout === 'kanban' ? (
        <KanbanBoard
          tickets={filteredTickets}
          onSelectTicket={onSelectTicket}
          onUpdateTicketStatus={onUpdateTicketStatus}
          onOpenNewTicket={onOpenNewTicket}
        />
      ) : (
        <ListView
          tickets={filteredTickets}
          onSelectTicket={onSelectTicket}
        />
      )}

      {/* Mobile Floating Action Button */}
      <button
        onClick={onOpenNewTicket}
        className="mobile-fab-btn show-mobile"
        title="Crear Nuevo Requerimiento"
      >
        <PlusCircle size={18} />
        <span>Nuevo Ticket</span>
      </button>
    </div>
  );
}
