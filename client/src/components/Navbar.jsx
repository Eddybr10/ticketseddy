import React from 'react';
import {
  Shield,
  User,
  PlusCircle,
  BarChart3,
  Mail,
  Sliders,
  Sun,
  Moon,
  ExternalLink,
  Lock,
  LogOut
} from 'lucide-react';

export default function Navbar({
  viewMode,
  setViewMode,
  isAdmin,
  setIsAdmin,
  onOpenNewTicket,
  onOpenMetrics,
  onOpenEmails,
  onOpenSettings,
  theme,
  setTheme,
  ticketCount = 0,
  operator = 'eduardo',
  onToggleOperator
}) {
  const handleLogout = () => {
    sessionStorage.removeItem('cloe_admin_auth');
    sessionStorage.removeItem('cloe_admin_pin');
    setIsAdmin(false);
    setViewMode('user');
  };

  return (
    <header className="app-navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 20px'
    }}>
      <div className="app-navbar-inner" style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        gap: '8px'
      }}>
        {/* Logo & Corporate Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <img
            src="https://cloemx.vtexassets.com/arquivos/cloe.png"
            alt="Cloe Moda"
            className="app-navbar-logo"
            style={{
              height: '22px',
              width: 'auto',
              objectFit: 'contain',
              filter: theme === 'dark' ? 'invert(1) brightness(1.2)' : 'none',
              transition: 'filter 0.2s',
              flexShrink: 0
            }}
          />
          <div className="hide-mobile" style={{ borderLeft: '1px solid var(--border-medium)', paddingLeft: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Ingeniería & Soporte Técnico
            </span>
          </div>

          {/* Quick VTEX Direct Links - ONLY visible if Admin & on desktop */}
          {isAdmin && (
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}>
              <a
                href="https://cloe.myvtex.com/admin"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'none',
                  padding: '3px 7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span>VTEX Cloe</span>
                <ExternalLink size={10} />
              </a>
              <a
                href="https://cloefactorystore.myvtex.com/admin"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'none',
                  padding: '3px 7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span>VTEX Factory</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Center: ONLY show mode switcher if user is logged in as Admin */}
        {isAdmin ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-elevated)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setViewMode('user')}
              title="Vista Usuario"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: viewMode === 'user' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'user' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <User size={14} />
              <span className="hide-mobile">Vista Usuario</span>
            </button>

            <button
              onClick={() => setViewMode('admin')}
              title="Consola Dev"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: viewMode === 'admin' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'admin' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Shield size={14} />
              <span className="hide-mobile">Consola Dev</span>
              {ticketCount > 0 && (
                <span style={{
                  background: viewMode === 'admin' ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                  color: viewMode === 'admin' ? '#ffffff' : 'var(--text-primary)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  {ticketCount}
                </span>
              )}
            </button>

            {/* Operator switch pill in Admin mode */}
            {viewMode === 'admin' && (
              <button
                type="button"
                onClick={onToggleOperator}
                title="Alternar operador activo (Eduardo Dev / Omar QA)"
                className="hide-mobile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  marginLeft: '4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: operator === 'omar' ? 'rgba(147, 51, 234, 0.25)' : 'rgba(2, 132, 199, 0.25)',
                  color: operator === 'omar' ? '#C084FC' : '#38BDF8',
                  border: `1px solid ${operator === 'omar' ? '#9333EA' : '#0284C7'}`
                }}
              >
                <span>{operator === 'omar' ? '🔍 Omar (QA)' : '💻 Eduardo (Dev)'}</span>
              </button>
            )}
          </div>
        ) : (
          /* Plain informative text for general users */
          <div className="hide-mobile" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            cloe.com.mx &bull; Cloe Factory Store
          </div>
        )}

        {/* Right Actions */}
        <div className="app-navbar-btn-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Create ticket button - hidden on mobile since mobile has FAB */}
          <button
            onClick={onOpenNewTicket}
            title="Crear Nuevo Ticket"
            className="hide-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <PlusCircle size={15} />
            <span>Crear Ticket</span>
          </button>

          {/* Admin Tools (Metrics, Emails, Settings, Logout) - ONLY when Admin authenticated */}
          {isAdmin ? (
            <>
              <button
                onClick={onOpenMetrics}
                title="Métricas y Reportes Ejecutivos"
                className="app-navbar-btn"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BarChart3 size={16} />
              </button>

              <button
                onClick={onOpenEmails}
                title="Historial de Correos & Notificaciones"
                className="app-navbar-btn"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mail size={16} />
              </button>

              <button
                onClick={onOpenSettings}
                title="Configuración"
                className="app-navbar-btn"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sliders size={16} />
              </button>

              <button
                onClick={handleLogout}
                title="Cerrar Sesión de Administrador"
                className="app-navbar-btn"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#EF4444',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            /* Discreet Admin entry point for Eduardo */
            <button
              onClick={() => setViewMode('admin')}
              title="Acceso Administrador / TI"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}
            >
              <Lock size={13} />
              <span>Acceso TI</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            className="app-navbar-btn"
            style={{
              padding: '7px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
