import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserPortal from './components/UserPortal';
import AdminCommandCenter from './components/AdminCommandCenter';
import TicketDetailModal from './components/TicketDetailModal';
import NewTicketModal from './components/NewTicketModal';
import MetricsModal from './components/MetricsModal';
import EmailDrawer from './components/EmailDrawer';
import SettingsModal from './components/SettingsModal';
import AdminLoginModal from './components/AdminLoginModal';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('cloe_theme') || 'dark');
  const [viewMode, setViewMode] = useState('user'); // 'user' | 'admin'
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('cloe_admin_auth') === 'true');
  const [adminPin, setAdminPin] = useState(sessionStorage.getItem('cloe_admin_pin') || '');
  const [operator, setOperator] = useState(localStorage.getItem('cloe_operator') || 'eduardo'); // 'eduardo' | 'omar'

  const handleToggleOperator = () => {
    const nextOp = operator === 'eduardo' ? 'omar' : 'eduardo';
    setOperator(nextOp);
    localStorage.setItem('cloe_operator', nextOp);
  };

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cloe_theme', theme);
  }, [theme]);

  // Fetch Tickets on Mount
  useEffect(() => {
    fetchTickets();
  }, [isAdmin]);

  // Check URL query parameters for direct ticket linking (e.g. from email notifications ?ticket=CLOE-1001)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      const headers = {};
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      fetch(`/api/tickets/${ticketParam}`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data.ticket) {
            setSelectedTicket(data.ticket);
          }
        })
        .catch(err => console.error('Error opening linked ticket:', err));
    }
  }, []);

  const fetchTickets = async (emailOverride) => {
    try {
      setLoadingTickets(true);
      const headers = {};
      let url = '/api/tickets';
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');

      if (isAdmin && currentPin) {
        headers['x-admin-pin'] = currentPin;
      } else {
        const email = emailOverride !== undefined ? emailOverride : (localStorage.getItem('cloe_user_email') || '');
        if (email) {
          url += `?requesterEmail=${encodeURIComponent(email)}`;
        }
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSwitchViewMode = (mode) => {
    if (mode === 'admin') {
      if (!isAdmin) {
        setShowAdminLogin(true);
        return;
      }
      setViewMode('admin');
    } else {
      setViewMode('user');
    }
  };

  const handleAdminLoginSuccess = (pin) => {
    setIsAdmin(true);
    setAdminPin(pin);
    setShowAdminLogin(false);
    setViewMode('admin');
    // Re-fetch all tickets with admin credentials
    fetch('/api/tickets', { headers: { 'x-admin-pin': pin } })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTickets(data))
      .catch(err => console.error('Error loading admin tickets:', err));
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (currentPin) headers['x-admin-pin'] = currentPin;

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus, notifyUser: true })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  const handleEmailProcessed = (ticketId) => {
    fetchTickets();
    if (selectedTicket && selectedTicket.id === ticketId) {
      const headers = {};
      const currentPin = adminPin || sessionStorage.getItem('cloe_admin_pin');
      if (isAdmin && currentPin) headers['x-admin-pin'] = currentPin;

      fetch(`/api/tickets/${ticketId}`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data.ticket) setSelectedTicket(data.ticket);
        });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={handleSwitchViewMode}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenNewTicket={() => setShowNewTicketModal(true)}
        onOpenMetrics={() => setShowMetricsModal(true)}
        onOpenEmails={() => setShowEmailDrawer(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        theme={theme}
        setTheme={setTheme}
        ticketCount={tickets.filter(t => !['ready_release', 'monitoring', 'closed'].includes(t.status)).length}
        operator={operator}
        onToggleOperator={handleToggleOperator}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {viewMode === 'user' ? (
          <UserPortal
            tickets={tickets}
            onOpenNewTicket={() => setShowNewTicketModal(true)}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onEmailChange={(email) => fetchTickets(email)}
          />
        ) : (
          <AdminCommandCenter
            tickets={tickets}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onRefresh={() => fetchTickets()}
            onOpenNewTicket={() => setShowNewTicketModal(true)}
            operator={operator}
            onToggleOperator={handleToggleOperator}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>CLOE eCommerce &bull; Tecnología &bull; Experiencia</strong> &bull; "Disciplina hoy, más ventas mañana"
          </div>
          <div>
            Flujo de Gestión, Desarrollo y Liberación UX para <strong>cloe.com.mx</strong> &bull; <strong>Cloe Factory Store (Outlet)</strong>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isAdmin={isAdmin}
          adminPin={adminPin}
          currentUserEmail={localStorage.getItem('cloe_user_email') || ''}
          operator={operator}
          onToggleOperator={handleToggleOperator}
          onClose={() => setSelectedTicket(null)}
          onUpdateTicket={() => fetchTickets()}
        />
      )}

      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onSuccess={() => {
            fetchTickets();
          }}
        />
      )}

      {showMetricsModal && (
        <MetricsModal
          adminPin={adminPin}
          onClose={() => setShowMetricsModal(false)}
        />
      )}

      {showEmailDrawer && (
        <EmailDrawer
          tickets={tickets}
          adminPin={adminPin}
          onClose={() => setShowEmailDrawer(false)}
          onEmailProcessed={handleEmailProcessed}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          adminPin={adminPin}
          onUpdatePin={(newPin) => setAdminPin(newPin)}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={handleAdminLoginSuccess}
        />
      )}
    </div>
  );
}
