// Centralized CLOE Operational Workflow Configuration

export const CLOE_STAGES = [
  {
    id: 'backlog',
    stepNumber: 1,
    name: 'Solicitud (Backlog)',
    shortName: 'Backlog',
    role: 'Marketing / Solicitante',
    color: '#64748B',
    bg: 'rgba(100, 116, 139, 0.15)',
    border: '#94A3B8',
    description: 'Ticket recibido con objetivo, alcance y referencias.'
  },
  {
    id: 'planned',
    stepNumber: 2,
    name: 'Planeación & Asignación',
    shortName: 'Planeado',
    role: 'Eduardo (Dev)',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: '#A78BFA',
    description: 'Categorizado, esfuerzo estimado y fecha objetivo fijada.'
  },
  {
    id: 'in_progress',
    stepNumber: 4,
    name: 'Desarrollo Activo',
    shortName: 'En Desarrollo',
    role: 'Eduardo (Dev)',
    color: '#0284C7',
    bg: 'rgba(2, 132, 199, 0.15)',
    border: '#38BDF8',
    description: 'Construcción en workspace VTEX IO y pruebas técnicas.'
  },
  {
    id: 'in_qa',
    stepNumber: 5,
    name: 'QA en Workspace',
    shortName: 'En QA (Omar)',
    role: 'Omar (Tester)',
    color: '#9333EA',
    bg: 'rgba(147, 51, 234, 0.15)',
    border: '#C084FC',
    description: 'Auditoría funcional, UX, responsive y consola.'
  },
  {
    id: 'corrections',
    stepNumber: 6,
    name: 'Corrección & Revalidación',
    shortName: 'Corrección',
    role: 'Eduardo & Omar',
    color: '#D97706',
    bg: 'rgba(217, 119, 6, 0.15)',
    border: '#FBBF24',
    description: 'Eduardo atiende hallazgos y Omar re-valida.'
  },
  {
    id: 'ready_release',
    stepNumber: 7,
    name: 'Listo para Liberar',
    shortName: 'Listo Prod (Lun)',
    role: 'Omar (Aprobado)',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.15)',
    border: '#34D399',
    description: 'Visto Bueno de QA otorgado. Esperando ventana del Lunes.'
  },
  {
    id: 'monitoring',
    stepNumber: 8,
    name: 'Liberado / Monitoreo',
    shortName: 'En Monitoreo',
    role: 'Eduardo + Omar',
    color: '#4F46E5',
    bg: 'rgba(79, 70, 229, 0.15)',
    border: '#818CF8',
    description: 'Publicado el lunes. Seguimiento 24-48h de consola y métricas.'
  },
  {
    id: 'closed',
    stepNumber: 8,
    name: 'Cerrado',
    shortName: 'Cerrado',
    role: 'Completado',
    color: '#475569',
    bg: 'rgba(71, 85, 105, 0.15)',
    border: '#64748B',
    description: 'Requerimiento exitoso y lecciones aprendidas registradas.'
  }
];

export const STAGE_MAP = CLOE_STAGES.reduce((acc, st) => {
  acc[st.id] = st;
  return acc;
}, {});

// Normalizer for backward compatibility
export function normalizeStatus(status) {
  if (!status) return 'backlog';
  const s = status.toLowerCase();
  if (s === 'new') return 'backlog';
  if (s === 'triaged') return 'planned';
  if (s === 'in_testing') return 'in_qa';
  if (s === 'resolved') return 'ready_release';
  return STAGE_MAP[s] ? s : 'backlog';
}

export const CLOE_PRIORITIES = {
  p1_critical: {
    code: 'P1',
    label: 'P1 - Urgente',
    tag: 'P1',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#F87171',
    sla: 'Hoy mismo',
    rule: 'Afecta ventas / checkout, interrumpe planeación actual.'
  },
  p2_high: {
    code: 'P2',
    label: 'P2 - Alta',
    tag: 'P2',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: '#FB923C',
    sla: '1 - 2 días',
    rule: 'Impacto en conversión, funcionalidad clave, campañas.'
  },
  p3_medium: {
    code: 'P3',
    label: 'P3 - Media',
    tag: 'P3',
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: '#FDE047',
    sla: '3 - 5 días',
    rule: 'Mejoras UX / componentes, se agenda en sprint.'
  },
  p4_low: {
    code: 'P4',
    label: 'P4 - Baja',
    tag: 'P4',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: '#CBD5E1',
    sla: '> 5 días',
    rule: 'Ajustes menores (copy, estilos), se mantiene en backlog.'
  }
};

export const CLOE_AREAS = [
  { id: 'eCommerce', name: 'eCommerce', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  { id: 'Marketing', name: 'Marketing', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
  { id: 'UX', name: 'UX', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  { id: 'CRM', name: 'CRM', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  { id: 'Analytics', name: 'Analytics', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  { id: 'Comercial', name: 'Comercial', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'Tecnología', name: 'Tecnología', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' }
];

export const AREA_MAP = CLOE_AREAS.reduce((acc, a) => {
  acc[a.id] = a;
  return acc;
}, {});

export const CLOE_PLATFORMS = {
  'cloe.com.mx': {
    id: 'cloe.com.mx',
    label: '.com',
    fullName: 'cloe.com.mx (Tienda Principal)',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: '#3B82F6',
    workspaceDomain: 'cloemx.myvtex.com',
    prodUrl: 'https://www.cloe.com.mx'
  },
  'cloefactorystore.com.mx': {
    id: 'cloefactorystore.com.mx',
    label: 'Outlet',
    fullName: 'Cloe Factory Store (Outlet)',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: '#F59E0B',
    workspaceDomain: 'cloeoutlet.myvtex.com',
    prodUrl: 'https://www.cloeoutlet.com.mx'
  },
  'both': {
    id: 'both',
    label: '.com / Outlet',
    fullName: 'Ambas Tiendas (.com & Outlet)',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: '#8B5CF6',
    workspaceDomain: 'cloemx.myvtex.com',
    prodUrl: 'https://www.cloe.com.mx'
  }
};

export const OFFICIAL_12_QA_ITEMS = [
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

export function isFridayToday() {
  return new Date().getDay() === 5;
}

export function isMondayToday() {
  return new Date().getDay() === 1;
}

export function getNextMondayFormatted() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 1 ? 7 : (8 - day) % 7 || 7;
  const nextMon = new Date(d.getTime() + diff * 86400000);
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `Lun ${nextMon.getDate()} ${months[nextMon.getMonth()]}`;
}
