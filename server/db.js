import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'cloe_tickets_db.json');

// Default Database Structure
const DEFAULT_DB = {
  counters: {
    ticketNumber: 1001
  },
  settings: {
    adminPin: 'cloe2026',
    allowedDomains: ['oemoda.com', 'oemoda.com.mx', 'cloe.com.mx', 'cloe.com'],
    allowAnyEmailInDev: true,
    m365Config: {
      enabled: false,
      host: 'smtp.office365.com',
      port: 587,
      user: '',
      pass: '',
      fromEmail: 'soporte.ecommerce@oemoda.com',
      fromName: 'Cloe E-Commerce Tech Support'
    },
    stores: [
      { id: 'cloe.com.mx', name: 'cloe.com.mx (Tienda Principal)', badge: 'CLOE MX', color: '#111111' },
      { id: 'cloefactorystore.com.mx', name: 'Cloe Factory Store (Outlet)', badge: 'FACTORY', color: '#C5A880' },
      { id: 'both', name: 'Ambos / Corporativo OE Moda', badge: 'CORP', color: '#555555' }
    ],
    categories: [
      { id: 'rendimiento_performance', name: 'Rendimiento & Optimización (Velocidad, Core Web Vitals)' },
      { id: 'nuevo_modulo_feature', name: 'Nuevo Módulo / Desarrollo de Funcionalidad' },
      { id: 'bases_datos_dba', name: 'Bases de Datos & DBA (Consultas SQL, esquemas, extracción)' },
      { id: 'integraciones_apis', name: 'Integraciones & APIs (ERP, CRM, Webhooks, endpoints)' },
      { id: 'vtex_backend_io', name: 'VTEX IO & Microservicios (Apps custom, MasterData)' },
      { id: 'checkout_pagos_tech', name: 'Checkout & Pasarelas (Arquitectura de pago, errores 500)' },
      { id: 'bug_codigo', name: 'Bug / Error de Código (Excepciones JS, lógica de backend)' },
      { id: 'infraestructura_devops', name: 'Infraestructura & Servidores (Cloud, SSL, DNS, Render)' },
      { id: 'seguridad_accesos', name: 'Seguridad & Credenciales (Tokens API, autenticación)' },
      { id: 'extraccion_scripts', name: 'Scripts de Datos & Automatización' },
      { id: 'other_tech', name: 'Otro Requerimiento de Ingeniería' }
    ]
  },
  tickets: [],
  messages: [],
  emails: []
};

// Initial Database Setup (Production Ready: Clean & Empty)
function getInitialSeedData() {
  const seed = JSON.parse(JSON.stringify(DEFAULT_DB));
  seed.tickets = [];
  seed.messages = [];
  seed.emails = [];
  seed.counters.ticketNumber = 1001;
  return seed;
}

// Official CLOE QA Checklist (12 control points)
export const OFFICIAL_QA_CHECKLIST = [
  { id: 'qa_func', label: 'Funcionalidad completa' },
  { id: 'qa_ux_design', label: 'Diseño y UX según requerimiento' },
  { id: 'qa_responsive', label: 'Responsive (desktop, tablet, mobile)' },
  { id: 'qa_console_clean', label: 'Sin errores en consola' },
  { id: 'qa_performance', label: 'Performance (si aplica)' },
  { id: 'qa_channel_validation', label: 'Validación en .com y/o Outlet' },
  { id: 'qa_analytics_events', label: 'Eventos en GA4 / Clarity (si aplica)' },
  { id: 'qa_cross_browser', label: 'Compatibilidad en navegadores' },
  { id: 'qa_requester_approved', label: 'Aprobación del solicitante' },
  { id: 'qa_monday_release', label: 'Publicación el lunes' },
  { id: 'qa_post_release_val', label: 'Validación post-producción' },
  { id: 'qa_ticket_closed', label: 'Ticket cerrado' }
];

export function getDefaultQAChecklist() {
  return OFFICIAL_QA_CHECKLIST.map(item => ({
    id: item.id,
    label: item.label,
    checked: false,
    checkedBy: null,
    checkedAt: null
  }));
}

// 8 Canonical Workflow Stages
export function normalizeStatus(status) {
  if (!status) return 'backlog';
  const s = status.toLowerCase();
  if (s === 'new') return 'backlog';
  if (s === 'triaged') return 'planned';
  if (s === 'in_testing') return 'in_qa';
  if (s === 'resolved') return 'ready_release';
  return s;
}

// Read database
export function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialSeedData();
      writeDb(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Ensure all tickets conform to the CLOE 8-step workflow
    let modified = false;
    parsed.tickets = (parsed.tickets || []).map(t => {
      let changed = false;
      const enriched = { ...t };

      const normStatus = normalizeStatus(enriched.status);
      if (normStatus !== enriched.status) {
        enriched.status = normStatus;
        changed = true;
      }

      if (!enriched.area) {
        enriched.area = enriched.department && ['eCommerce', 'Marketing', 'UX', 'CRM', 'Analytics', 'Comercial'].includes(enriched.department)
          ? enriched.department
          : (enriched.category === 'vtex_checkout' || enriched.category === 'checkout_pagos_tech' ? 'eCommerce' :
             enriched.category === 'ui_ux' ? 'UX' :
             enriched.category === 'reports_dba' ? 'Analytics' :
             enriched.category === 'integrations_erp_crm' ? 'CRM' : 'eCommerce');
        changed = true;
      }

      if (enriched.estimationHours === undefined || enriched.estimationHours === null) {
        enriched.estimationHours = enriched.priority === 'p1_critical' ? 3 : enriched.priority === 'p2_high' ? 8 : 4;
        changed = true;
      }

      if (!enriched.vtexWorkspace) {
        enriched.vtexWorkspace = '';
      }

      if (!enriched.figmaUrl) {
        enriched.figmaUrl = '';
      }

      if (!enriched.targetReleaseDate) {
        enriched.targetReleaseDate = '';
      }

      if (!enriched.qaChecklist || !Array.isArray(enriched.qaChecklist) || enriched.qaChecklist.length === 0) {
        enriched.qaChecklist = getDefaultQAChecklist();
        changed = true;
      }

      if (!enriched.qaFindings || !Array.isArray(enriched.qaFindings)) {
        enriched.qaFindings = [];
        changed = true;
      }

      if (changed) modified = true;
      return enriched;
    });

    if (modified) {
      writeDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return DEFAULT_DB;
  }
}

// Atomic write to prevent file corruption
export function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Helper methods
export const db = {
  getTickets(filter = {}) {
    const data = readDb();
    let tickets = [...data.tickets];

    if (filter.store && filter.store !== 'all') {
      tickets = tickets.filter(t => t.store === filter.store || t.store === 'both');
    }
    if (filter.area && filter.area !== 'all') {
      tickets = tickets.filter(t => t.area === filter.area);
    }
    if (filter.status && filter.status !== 'all') {
      const targetNorm = normalizeStatus(filter.status);
      tickets = tickets.filter(t => normalizeStatus(t.status) === targetNorm);
    }
    if (filter.priority && filter.priority !== 'all') {
      tickets = tickets.filter(t => t.priority === filter.priority);
    }
    if (filter.category && filter.category !== 'all') {
      tickets = tickets.filter(t => t.category === filter.category);
    }
    if (filter.requesterEmail) {
      tickets = tickets.filter(t => t.requesterEmail.toLowerCase() === filter.requesterEmail.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      tickets = tickets.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.requesterEmail.toLowerCase().includes(q) ||
        (t.area && t.area.toLowerCase().includes(q)) ||
        (t.vtexWorkspace && t.vtexWorkspace.toLowerCase().includes(q))
      );
    }

    // Sort by updated descending
    tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return tickets;
  },

  getTicketById(idOrUuid) {
    const data = readDb();
    const cleanId = idOrUuid.toUpperCase();
    return data.tickets.find(t => t.id === cleanId || t.uuid === idOrUuid);
  },

  createTicket(ticketData) {
    const data = readDb();
    const nextNum = data.counters.ticketNumber || 1001;
    const ticketId = `CLOE-${nextNum}`;
    data.counters.ticketNumber = nextNum + 1;

    const now = new Date().toISOString();
    const slaMap = {
      p1_critical: 4,
      p2_high: 24,
      p3_medium: 48,
      p4_low: 72
    };

    const newTicket = {
      id: ticketId,
      uuid: `tk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: ticketData.title.trim(),
      store: ticketData.store || 'cloe.com.mx',
      area: ticketData.area || ticketData.department || 'eCommerce',
      category: ticketData.category || 'other_tech',
      priority: ticketData.priority || 'p3_medium',
      status: normalizeStatus(ticketData.status || 'backlog'),
      estimationHours: Number(ticketData.estimationHours) || (ticketData.priority === 'p1_critical' ? 3 : 4),
      targetReleaseDate: ticketData.targetReleaseDate || '',
      vtexWorkspace: ticketData.vtexWorkspace || '',
      figmaUrl: ticketData.figmaUrl || '',
      requesterEmail: ticketData.requesterEmail.toLowerCase().trim(),
      requesterName: ticketData.requesterName.trim(),
      department: ticketData.department || ticketData.area || 'General',
      affectedUrl: ticketData.affectedUrl || '',
      orderId: ticketData.orderId || '',
      description: ticketData.description.trim(),
      attachments: ticketData.attachments || [],
      slaHours: slaMap[ticketData.priority] || 48,
      qaChecklist: getDefaultQAChecklist(),
      qaFindings: [],
      qaApprovedBy: null,
      qaApprovedAt: null,
      releasedAt: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      closedAt: null
    };

    data.tickets.unshift(newTicket);

    // Add initial creation message
    data.messages.push({
      id: `msg-${Date.now()}-init`,
      ticketId: ticketId,
      senderEmail: newTicket.requesterEmail,
      senderName: newTicket.requesterName,
      senderRole: 'user',
      isInternalNote: false,
      content: newTicket.description,
      attachments: newTicket.attachments,
      source: 'web',
      createdAt: now
    });

    writeDb(data);
    return newTicket;
  },

  updateTicket(id, updates) {
    const data = readDb();
    const idx = data.tickets.findIndex(t => t.id === id || t.uuid === id);
    if (idx === -1) return null;

    const current = data.tickets[idx];
    const now = new Date().toISOString();

    const updated = {
      ...current,
      ...updates,
      updatedAt: now
    };

    if (updates.status) {
      updated.status = normalizeStatus(updates.status);
    }

    if (updated.status === 'monitoring' && !current.releasedAt) {
      updated.releasedAt = now;
    }
    if (['ready_release', 'monitoring', 'closed'].includes(updated.status) && !current.resolvedAt) {
      updated.resolvedAt = now;
    }
    if (updated.status === 'closed' && !current.closedAt) {
      updated.closedAt = now;
    }

    if (updates.qaApprovedBy && !current.qaApprovedAt) {
      updated.qaApprovedAt = now;
    }

    data.tickets[idx] = updated;
    writeDb(data);
    return updated;
  },

  addQAFinding(ticketId, finding) {
    const data = readDb();
    const idx = data.tickets.findIndex(t => t.id === ticketId || t.uuid === ticketId);
    if (idx === -1) return null;

    const current = data.tickets[idx];
    const newFinding = {
      id: `fnd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: finding.title || 'Hallazgo de QA',
      description: finding.description || '',
      severity: finding.severity || 'major',
      device: finding.device || 'Desktop / Chrome',
      status: 'open',
      reportedBy: finding.reportedBy || 'Omar (QA / Tester)',
      reportedAt: new Date().toISOString(),
      fixedAt: null
    };

    if (!Array.isArray(current.qaFindings)) {
      current.qaFindings = [];
    }
    current.qaFindings.unshift(newFinding);
    current.updatedAt = new Date().toISOString();

    // Auto move to 'corrections' if open findings exist and ticket was in QA
    if (current.status === 'in_qa') {
      current.status = 'corrections';
    }

    data.tickets[idx] = current;
    writeDb(data);
    return current;
  },

  updateQAFinding(ticketId, findingId, updates) {
    const data = readDb();
    const idx = data.tickets.findIndex(t => t.id === ticketId || t.uuid === ticketId);
    if (idx === -1) return null;

    const current = data.tickets[idx];
    if (!Array.isArray(current.qaFindings)) return current;

    const fIdx = current.qaFindings.findIndex(f => f.id === findingId);
    if (fIdx === -1) return current;

    current.qaFindings[fIdx] = {
      ...current.qaFindings[fIdx],
      ...updates,
      fixedAt: updates.status === 'fixed' ? new Date().toISOString() : current.qaFindings[fIdx].fixedAt
    };
    current.updatedAt = new Date().toISOString();

    data.tickets[idx] = current;
    writeDb(data);
    return current;
  },

  updateQAChecklist(ticketId, checklistItemId, checked, checkedBy) {
    const data = readDb();
    const idx = data.tickets.findIndex(t => t.id === ticketId || t.uuid === ticketId);
    if (idx === -1) return null;

    const current = data.tickets[idx];
    if (!Array.isArray(current.qaChecklist)) {
      current.qaChecklist = getDefaultQAChecklist();
    }

    const item = current.qaChecklist.find(i => i.id === checklistItemId);
    if (item) {
      item.checked = Boolean(checked);
      item.checkedBy = checked ? (checkedBy || 'Omar (QA / Tester)') : null;
      item.checkedAt = checked ? new Date().toISOString() : null;
    }
    current.updatedAt = new Date().toISOString();

    data.tickets[idx] = current;
    writeDb(data);
    return current;
  },

  getMessages(ticketId, includeInternalNotes = false) {
    const data = readDb();
    const msgs = data.messages.filter(m => m.ticketId === ticketId);
    if (!includeInternalNotes) {
      return msgs.filter(m => !m.isInternalNote);
    }
    return msgs;
  },

  addMessage(ticketId, messageData) {
    const data = readDb();
    const ticketIdx = data.tickets.findIndex(t => t.id === ticketId);
    if (ticketIdx === -1) return null;

    const now = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ticketId: ticketId,
      senderEmail: messageData.senderEmail,
      senderName: messageData.senderName || 'Usuario',
      senderRole: messageData.senderRole || 'user',
      isInternalNote: !!messageData.isInternalNote,
      content: messageData.content.trim(),
      attachments: messageData.attachments || [],
      source: messageData.source || 'web',
      createdAt: now
    };

    data.messages.push(newMsg);

    // Update ticket's updatedAt
    data.tickets[ticketIdx].updatedAt = now;

    // If user replied and ticket was 'waiting_user', change status to 'in_progress'
    if (messageData.senderRole === 'user' && data.tickets[ticketIdx].status === 'waiting_user') {
      data.tickets[ticketIdx].status = 'in_progress';
    }

    writeDb(data);
    return newMsg;
  },

  logEmail(emailData) {
    const data = readDb();
    const newEmail = {
      id: `em-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      ...emailData
    };
    data.emails.unshift(newEmail);
    // Keep max 200 emails in log
    if (data.emails.length > 200) data.emails = data.emails.slice(0, 200);
    writeDb(data);
    return newEmail;
  },

  getEmails(ticketId = null) {
    const data = readDb();
    if (ticketId) {
      return data.emails.filter(e => e.ticketId === ticketId);
    }
    return data.emails;
  },

  getSettings() {
    const data = readDb();
    return data.settings;
  },

  updateSettings(newSettings) {
    const data = readDb();
    data.settings = { ...data.settings, ...newSettings };
    writeDb(data);
    return data.settings;
  },

  getMetrics() {
    const data = readDb();
    const tickets = data.tickets;

    const total = tickets.length;
    const open = tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
    const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
    const critical = tickets.filter(t => t.priority === 'p1_critical' && !['resolved', 'closed'].includes(t.status)).length;

    // By store
    const byStore = {
      'cloe.com.mx': tickets.filter(t => t.store === 'cloe.com.mx').length,
      'cloefactorystore.com.mx': tickets.filter(t => t.store === 'cloefactorystore.com.mx').length,
      'both': tickets.filter(t => t.store === 'both').length
    };

    // By category
    const byCategory = {};
    tickets.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    // By status
    const byStatus = {};
    tickets.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });

    // Resolution time calculation (in hours)
    let totalResolvedHours = 0;
    let resolvedCountWithDates = 0;
    tickets.forEach(t => {
      if (t.resolvedAt && t.createdAt) {
        const diffHours = (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000;
        totalResolvedHours += diffHours;
        resolvedCountWithDates++;
      }
    });

    const avgResolutionHours = resolvedCountWithDates > 0
      ? (totalResolvedHours / resolvedCountWithDates).toFixed(1)
      : 0;

    return {
      total,
      open,
      resolved,
      critical,
      avgResolutionHours,
      byStore,
      byCategory,
      byStatus
    };
  }
};
