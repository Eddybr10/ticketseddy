import nodemailer from 'nodemailer';
import { db } from './db.js';

// Clean quoted email replies to get only the new message
function extractCleanReply(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const cleanLines = [];

  for (const line of lines) {
    if (
      line.match(/^On .* wrote:/i) ||
      line.match(/^El .* escribió:/i) ||
      line.match(/^De: .*/i) ||
      line.match(/^From: .*/i) ||
      line.match(/^> /) ||
      line.startsWith('---') ||
      line.includes('eyepez@oemoda.com') ||
      line.includes('soporte.ecommerce@oemoda.com')
    ) {
      break;
    }
    cleanLines.push(line);
  }

  const result = cleanLines.join('\n').trim();
  return result || text.trim();
}

// Generate minimalist professional Cloe email HTML
function generateCloeEmailHtml({ ticket, messageContent, actionUrl, isNewTicket = false }) {
  const storeBadge = ticket.store === 'cloefactorystore.com.mx' ? 'Cloe Factory Store' : 'Cloe (cloe.com.mx)';
  const statusLabels = {
    new: 'Nuevo Requerimiento',
    triaged: 'En Evaluación',
    in_progress: 'En Desarrollo / Fix',
    in_testing: 'En Pruebas (Staging)',
    resolved: 'Resuelto ✅',
    closed: 'Cerrado'
  };
  const statusName = statusLabels[ticket.status] || ticket.status;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[${ticket.id}] Cloe Tech Support</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 24px 10px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #0f172a; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; }
    .header img { height: 26px; }
    .brand-text { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .body { padding: 24px; }
    .badge-bar { margin-bottom: 14px; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; margin-right: 6px; }
    .badge-ticket { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-family: monospace; }
    .badge-store { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .ticket-title { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #0f172a; line-height: 1.3; }
    .message-box { background: #f8fafc; border-left: 3px solid #2563eb; padding: 14px 16px; margin: 18px 0; border-radius: 0 6px 6px 0; font-size: 14px; line-height: 1.5; color: #1e293b; white-space: pre-wrap; }
    .meta-grid { margin: 18px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px 0; font-size: 12px; }
    .meta-row { display: flex; justify-content: space-between; padding: 3px 0; color: #475569; }
    .meta-label { font-weight: 600; color: #0f172a; }
    .button-wrap { text-align: center; margin: 24px 0 10px; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 22px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 5px; }
    .reply-hint { font-size: 11px; color: #64748b; text-align: center; margin-top: 12px; }
    .footer { background: #f8fafc; color: #64748b; padding: 16px 24px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 3px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://cloemx.vtexassets.com/arquivos/cloe.png" alt="Cloe Moda" />
        <span class="brand-text">Ingeniería & Soporte Técnico</span>
      </div>
      <div class="body">
        <div class="badge-bar">
          <span class="badge badge-ticket">${ticket.id}</span>
          <span class="badge badge-store">${storeBadge}</span>
        </div>
        <h2 class="ticket-title">${ticket.title}</h2>
        
        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-label">Estado:</span>
            <span>${statusName}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Solicitante:</span>
            <span>${ticket.requesterName} (${ticket.requesterEmail})</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Prioridad:</span>
            <span>${ticket.priority.toUpperCase().replace('_', ' ')}</span>
          </div>
          ${ticket.affectedUrl ? `
          <div class="meta-row">
            <span class="meta-label">URL:</span>
            <span>${ticket.affectedUrl}</span>
          </div>` : ''}
        </div>

        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;">
          ${isNewTicket ? 'Se ha registrado el requerimiento en el sistema de ingeniería:' : 'Nueva actualización técnica:'}
        </p>
        
        <div class="message-box">${messageContent}</div>

        <div class="button-wrap">
          <a href="${actionUrl}" class="btn" target="_blank">Ver Ticket en Vivo</a>
        </div>
        <div class="reply-hint">
          💡 <strong>Tip:</strong> Puedes responder directamente a este correo desde tu Outlook o Microsoft 365 para añadir comentarios al ticket.
        </div>
      </div>
      <div class="footer">
        <p><strong>Cloe Moda | OE Moda S.A. de C.V.</strong></p>
        <p>Desarrollador Responsable: Eduardo Yépez (eyepez@oemoda.com)</p>
        <p style="color: #94a3b8; font-size: 10px; margin-top: 6px;">Token de hilo: [${ticket.id}]</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate Specialized QA Assignment Email HTML for Omar Díaz
function generateQaAssignmentHtml({ ticket, senderNote, appBaseUrl, recipientName = 'Omar Díaz' }) {
  const storeBadge = ticket.store === 'cloefactorystore.com.mx' ? 'Cloe Factory Store' : ticket.store === 'both' ? 'Ambas Tiendas (.com & Outlet)' : 'Cloe (cloe.com.mx)';
  const domain = ticket.store === 'cloefactorystore.com.mx' ? 'cloeoutlet.myvtex.com' : 'cloemx.myvtex.com';
  const workspaceUrl = ticket.vtexWorkspace ? `https://${ticket.vtexWorkspace}--${domain}` : null;
  const directTicketUrl = `${appBaseUrl}?ticket=${ticket.id}&op=omar&auth=admin`;

  const priorityStyles = {
    p1_critical: { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5', label: 'P1 - Urgente (Hoy mismo)' },
    p2_high: { bg: '#FFF7ED', color: '#EA580C', border: '#FDBA74', label: 'P2 - Alta (1-2 días)' },
    p3_medium: { bg: '#FEFCE8', color: '#CA8A04', border: '#FDE047', label: 'P3 - Media (3-5 días)' },
    p4_low: { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', label: 'P4 - Baja (> 5 días)' }
  };
  const prio = priorityStyles[ticket.priority] || priorityStyles.p3_medium;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[${ticket.id}] Asignación de QA - ${ticket.title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 28px 12px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 22px 26px; display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #9333ea; }
    .brand-title { color: #c084fc; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 26px; }
    .badge-bar { margin-bottom: 14px; display: flex; flex-wrap: wrap; gap: 6px; }
    .badge { display: inline-block; padding: 4px 9px; font-size: 11px; font-weight: 700; border-radius: 4px; }
    .badge-ticket { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; font-family: monospace; font-size: 12px; }
    .badge-prio { background: ${prio.bg}; color: ${prio.color}; border: 1px solid ${prio.border}; }
    .badge-qa { background: #9333ea; color: #ffffff; }
    .ticket-title { font-size: 20px; font-weight: 700; margin: 6px 0 16px 0; color: #0f172a; line-height: 1.3; }
    .greeting { font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 16px; }
    .handover-box { background: #faf5ff; border-left: 4px solid #9333ea; padding: 14px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.5; color: #4c1d95; }
    .workspace-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .workspace-btn { display: inline-block; background: #9333ea; color: #ffffff !important; padding: 10px 18px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; margin-top: 8px; }
    .meta-table { width: 100%; margin: 16px 0; border-collapse: collapse; font-size: 12px; }
    .meta-table td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
    .meta-table td.label { font-weight: 600; color: #0f172a; width: 140px; }
    .checklist-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 12px; color: #334155; }
    .checklist-title { font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
    .check-item { margin: 2px 0; }
    .action-wrap { text-align: center; margin: 26px 0 16px; }
    .btn-main { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: #ffffff !important; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(147, 51, 234, 0.3); }
    .footer { background: #0f172a; color: #94a3b8; padding: 18px 24px; text-align: center; font-size: 11px; }
    .footer p { margin: 3px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div>
          <img src="https://cloemx.vtexassets.com/arquivos/cloe.png" alt="Cloe Moda" height="24" style="filter: brightness(0) invert(1);" />
          <div class="brand-title" style="margin-top: 4px;">Control de Calidad & QA Operativo</div>
        </div>
        <span class="badge badge-qa">FASE 5: QA EN WORKSPACE</span>
      </div>
      <div class="body">
        <div class="badge-bar">
          <span class="badge badge-ticket">${ticket.id}</span>
          <span class="badge badge-prio">${prio.label}</span>
          <span class="badge" style="background:#f1f5f9; color:#475569; border: 1px solid #cbd5e1;">${storeBadge}</span>
        </div>

        <h2 class="ticket-title">${ticket.title}</h2>

        <div class="greeting">
          Hola <strong>${recipientName}</strong>,<br>
          Eduardo Yépez ha finalizado el desarrollo activo en VTEX IO y te ha transferido este requerimiento para su correspondiente <strong>auditoría de calidad, responsive y pruebas en workspace</strong>.
        </div>

        ${senderNote ? `
        <div class="handover-box">
          <strong>💬 Nota de Desarrollo (Eduardo):</strong><br>
          ${senderNote}
        </div>
        ` : ''}

        ${workspaceUrl ? `
        <div class="workspace-banner">
          <div style="font-size: 11px; font-weight: 700; color: #9333ea; text-transform: uppercase;">Workspace VTEX IO Preparado</div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 3px 0;">${ticket.vtexWorkspace}</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Valida funcionalidad, componentes y visualización en vivo:</div>
          <a href="${workspaceUrl}" target="_blank" class="workspace-btn">Abrir Workspace VTEX &rarr;</a>
        </div>
        ` : `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; font-size: 12px; color: #92400e; margin: 14px 0;">
          ⚠️ <strong>Nota:</strong> No se especificó un nombre de workspace VTEX en el pase. Revisa el ticket o consulta con Eduardo.
        </div>
        `}

        <table class="meta-table">
          <tr>
            <td class="label">Solicitante:</td>
            <td><strong>${ticket.requesterName}</strong> (${ticket.requesterEmail})</td>
          </tr>
          <tr>
            <td class="label">Área:</td>
            <td>${ticket.area || ticket.department || 'eCommerce'}</td>
          </tr>
          <tr>
            <td class="label">Esfuerzo Estimado:</td>
            <td>${ticket.estimationHours || 4} horas de ingeniería</td>
          </tr>
          <tr>
            <td class="label">Ventana de Liberación:</td>
            <td><strong>${ticket.targetReleaseDate || 'Próximo Lunes de Producción'}</strong></td>
          </tr>
          ${ticket.figmaUrl ? `
          <tr>
            <td class="label">Figma / Diseño:</td>
            <td><a href="${ticket.figmaUrl}" target="_blank" style="color: #9333ea; font-weight: 600;">Ver Especificaciones en Figma &rarr;</a></td>
          </tr>
          ` : ''}
          ${ticket.affectedUrl ? `
          <tr>
            <td class="label">URL Afectada Prod:</td>
            <td><a href="${ticket.affectedUrl}" target="_blank" style="color: #2563eb;">${ticket.affectedUrl}</a></td>
          </tr>
          ` : ''}
        </table>

        <div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 12px 14px; margin: 16px 0; border-radius: 0 6px 6px 0; font-size: 13px; color: #334155;">
          <strong>Descripción del Requerimiento:</strong><br>
          <div style="margin-top: 4px; white-space: pre-wrap; font-size: 12px; color: #475569;">${ticket.description}</div>
        </div>

        <div class="checklist-box">
          <div class="checklist-title">📋 Protocolo Oficial de QA (12 Puntos a Validar):</div>
          <div class="checklist-grid">
            <div class="check-item">1. Funcionalidad completa</div>
            <div class="check-item">2. Diseño y UX según requerimiento</div>
            <div class="check-item">3. Responsive (mobile, tablet, desktop)</div>
            <div class="check-item">4. Sin errores en consola (F12)</div>
            <div class="check-item">5. Performance & tiempos de carga</div>
            <div class="check-item">6. Validación en .com / Outlet</div>
            <div class="check-item">7. Eventos en GA4 / Clarity</div>
            <div class="check-item">8. Compatibilidad cross-browser</div>
            <div class="check-item">9. Aprobación del solicitante</div>
            <div class="check-item">10. Publicación el lunes</div>
            <div class="check-item">11. Monitoreo post-producción</div>
            <div class="check-item">12. Cierre formal del ticket</div>
          </div>
        </div>

        <div class="action-wrap">
          <a href="${directTicketUrl}" class="btn-main" target="_blank">
            🚀 Abrir Ticket en Plataforma & Iniciar QA
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            Al hacer clic entrarás directamente con tu perfil de <strong>Omar Díaz (QA / Admin)</strong>.
          </div>
        </div>
      </div>
      <div class="footer">
        <p><strong>Cloe Moda | OE Moda S.A. de C.V.</strong></p>
        <p>Equipo de Tecnología: Eduardo Yépez (eyepez@oemoda.com) &bull; Omar Díaz (adiaz@oemoda.com)</p>
        <p style="color: #64748b; font-size: 10px; margin-top: 6px;">Token de hilo: [${ticket.id}]</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate Corrections / Findings Email HTML for Eduardo
function generateCorrectionEmailHtml({ ticket, senderNote, appBaseUrl }) {
  const directTicketUrl = `${appBaseUrl}?ticket=${ticket.id}&op=eduardo&auth=admin`;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>[${ticket.id}] Hallazgos de QA - ${ticket.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #b45309; color: #ffffff; padding: 18px 22px; font-weight: 700; font-size: 16px; }
    .body { padding: 22px; color: #1e293b; font-size: 14px; }
    .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; margin: 16px 0; border-radius: 0 6px 6px 0; }
    .btn { display: inline-block; background: #b45309; color: #ffffff !important; padding: 10px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ⚠️ [${ticket.id}] Correcciones Requeridas por QA (Omar Díaz)
    </div>
    <div class="body">
      <p>Hola <strong>Eduardo</strong>,</p>
      <p>Omar Díaz ha probado el requerimiento <strong>[${ticket.id}] ${ticket.title}</strong> en workspace y ha registrado hallazgos que requieren corrección antes de continuar a liberación.</p>
      <div class="alert-box">
        <strong>Nota de Omar (QA):</strong><br>
        ${senderNote || 'Revisar hallazgos documentados en la pestaña de QA en el sistema.'}
      </div>
      <p>Workspace: <strong>${ticket.vtexWorkspace || 'No registrado'}</strong></p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${directTicketUrl}" class="btn" target="_blank">Atender Hallazgos en el Ticket</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate QA Approval Email HTML
function generateQaApprovalEmailHtml({ ticket, appBaseUrl }) {
  const directTicketUrl = `${appBaseUrl}?ticket=${ticket.id}`;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>[${ticket.id}] ✅ Aprobado por QA - Listo para Liberación</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #059669; color: #ffffff; padding: 18px 22px; font-weight: 700; font-size: 16px; }
    .body { padding: 22px; color: #1e293b; font-size: 14px; }
    .success-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 14px; margin: 16px 0; border-radius: 0 6px 6px 0; color: #065f46; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 10px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ✅ [${ticket.id}] Visto Bueno de QA Otorgado por Omar Díaz
    </div>
    <div class="body">
      <p>Estimado equipo Cloe,</p>
      <div class="success-box">
        <strong>¡Pruebas Superadas Exitosamente!</strong><br>
        El requerimiento <strong>[${ticket.id}] ${ticket.title}</strong> ha sido auditado al 100% por <strong>Omar Díaz (QA)</strong> y cuenta con Visto Bueno formal.
      </div>
      <p>El ticket queda en estado <strong>Listo para Liberar</strong>, programado para publicación a producción el <strong>Lunes (${ticket.targetReleaseDate || 'Próxima ventana de liberación'})</strong>, siguiendo la regla de no liberación en viernes.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${directTicketUrl}" class="btn" target="_blank">Ver Detalles del Ticket</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Internal M365 Email Dispatch Helper
async function sendMailInternal({ to, subject, html, text, ticketId, replyTo }) {
  const settings = db.getSettings();
  const dbM365 = settings.m365Config || {};

  const m365 = {
    enabled: dbM365.enabled !== false,
    host: process.env.M365_HOST || dbM365.host || 'smtp.office365.com',
    port: parseInt(process.env.M365_PORT || dbM365.port) || 587,
    user: process.env.M365_USER || dbM365.user || 'eyepez@oemoda.com',
    pass: process.env.M365_PASS || dbM365.pass || 'Edu3533862@',
    fromEmail: process.env.M365_FROM_EMAIL || dbM365.fromEmail || dbM365.user || 'eyepez@oemoda.com',
    fromName: process.env.M365_FROM_NAME || dbM365.fromName || 'Eduardo Yepez | Cloe Tech'
  };

  const emailLog = {
    ticketId,
    type: 'outbound',
    to,
    from: m365.user,
    subject,
    bodyHtml: html,
    bodyText: text,
    status: 'pending'
  };

  if (m365.user && m365.pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: m365.host || 'smtp.office365.com',
        port: m365.port || 587,
        secure: false, // 587 uses STARTTLS
        requireTLS: true,
        auth: {
          user: m365.user,
          pass: m365.pass
        },
        tls: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: `"${m365.fromName}" <${m365.user}>`,
        to,
        replyTo: replyTo || m365.user,
        subject,
        text,
        html,
        headers: {
          'X-Ticket-ID': ticketId,
          'Message-ID': `<${ticketId}-${Date.now()}@oemoda.com>`,
          'References': `<${ticketId}@oemoda.com>`
        }
      });

      emailLog.status = 'sent';
      emailLog.providerResponse = info.messageId;
      console.log(`[Email M365] Successfully sent real email for ${ticketId} to ${to}`);
    } catch (err) {
      console.error(`[Email M365 Error] Failed to send email via SMTP to ${to}:`, err.message);
      emailLog.status = 'error';
      emailLog.error = err.message;
    }
  } else {
    emailLog.status = 'simulated';
    emailLog.note = 'Simulado localmente';
  }

  db.logEmail(emailLog);
  return emailLog;
}

// Send Notification Email (General Ticket Updates)
export async function sendTicketEmail({ ticket, messageContent, recipientEmail, isNewTicket = false, appBaseUrl = 'http://localhost:4000' }) {
  const ticketId = ticket.id;
  const subject = `[${ticketId}] ${ticket.title}`;
  const actionUrl = `${appBaseUrl}?ticket=${ticketId}`;

  const html = generateCloeEmailHtml({
    ticket,
    messageContent,
    actionUrl,
    isNewTicket
  });

  const text = `[${ticketId}] ${ticket.title}\n\nEstado: ${ticket.status}\nTienda: ${ticket.store}\n\nMensaje:\n${messageContent}\n\nPuedes ver el ticket en vivo o responder a este correo para dar seguimiento:\n${actionUrl}\n\n[${ticketId}]`;

  return sendMailInternal({
    to: recipientEmail || ticket.requesterEmail,
    subject,
    html,
    text,
    ticketId
  });
}

// Dedicated Notification to Omar Díaz (adiaz@oemoda.com) when ticket moves to QA in Workspace
export async function sendQaAssignmentEmail({ ticket, senderNote, recipientEmail = 'adiaz@oemoda.com', appBaseUrl = 'http://localhost:4000' }) {
  const ticketId = ticket.id;
  const subject = `[${ticketId}] Requerimiento Asignado para QA en Workspace - ${ticket.title}`;
  const directTicketUrl = `${appBaseUrl}?ticket=${ticketId}&op=omar&auth=admin`;

  const html = generateQaAssignmentHtml({
    ticket,
    senderNote,
    appBaseUrl,
    recipientName: 'Omar Díaz'
  });

  const text = `Hola Omar,\n\nEduardo Yépez te ha asignado el ticket [${ticketId}] para QA en Workspace VTEX:\n${ticket.title}\n\nWorkspace: ${ticket.vtexWorkspace || 'N/A'}\nPrioridad: ${ticket.priority}\nÁrea: ${ticket.area || ticket.department}\nMeta: ${ticket.targetReleaseDate || 'Próximo lunes'}\n\nNota de Eduardo:\n${senderNote || 'Revisar responsive, funcionalidad y consola.'}\n\nAbrir ticket en plataforma:\n${directTicketUrl}\n\n[${ticketId}]`;

  console.log(`[QA Notification] Sending QA Assignment email to Omar Díaz (${recipientEmail}) for ${ticketId}`);
  return sendMailInternal({
    to: recipientEmail,
    subject,
    html,
    text,
    ticketId
  });
}

// Notification to Eduardo when Omar reports findings/corrections
export async function sendCorrectionNotificationEmail({ ticket, senderNote, recipientEmail = 'eyepez@oemoda.com', appBaseUrl = 'http://localhost:4000' }) {
  const ticketId = ticket.id;
  const subject = `[${ticketId}] Hallazgos de QA Documentados por Omar - ${ticket.title}`;
  const directTicketUrl = `${appBaseUrl}?ticket=${ticketId}&op=eduardo&auth=admin`;

  const html = generateCorrectionEmailHtml({
    ticket,
    senderNote,
    appBaseUrl
  });

  const text = `Hola Eduardo,\n\nOmar Díaz ha reportado hallazgos en QA para [${ticketId}] ${ticket.title}.\nWorkspace: ${ticket.vtexWorkspace || 'N/A'}\n\nNota: ${senderNote || 'Revisar hallazgos en la plataforma.'}\n\nVer ticket:\n${directTicketUrl}\n\n[${ticketId}]`;

  return sendMailInternal({
    to: recipientEmail,
    subject,
    html,
    text,
    ticketId
  });
}

// Notification to Eduardo & Requester when Omar approves QA for Monday release
export async function sendQaApprovalEmail({ ticket, appBaseUrl = 'http://localhost:4000' }) {
  const ticketId = ticket.id;
  const subject = `[${ticketId}] ✅ Visto Bueno de QA Otorgado por Omar Díaz - Listo para Liberar`;
  const html = generateQaApprovalEmailHtml({ ticket, appBaseUrl });
  const text = `El ticket [${ticketId}] ${ticket.title} fue aprobado formalmente por Omar Díaz (QA). Listo para liberación el lunes.`;

  // Send to Eduardo
  await sendMailInternal({
    to: 'eyepez@oemoda.com',
    subject,
    html,
    text,
    ticketId
  });

  // If requester email is different, send to requester too
  if (ticket.requesterEmail && ticket.requesterEmail !== 'eyepez@oemoda.com') {
    await sendMailInternal({
      to: ticket.requesterEmail,
      subject,
      html,
      text,
      ticketId
    });
  }
}

// Test SMTP Connection and Send Test Email
export async function sendTestM365Email(recipientEmail = 'eyepez@oemoda.com') {
  const settings = db.getSettings();
  const dbM365 = settings.m365Config || {};

  const m365 = {
    host: process.env.M365_HOST || dbM365.host || 'smtp.office365.com',
    port: parseInt(process.env.M365_PORT || dbM365.port) || 587,
    user: process.env.M365_USER || dbM365.user || 'eyepez@oemoda.com',
    pass: process.env.M365_PASS || dbM365.pass || 'Edu3533862@',
    fromName: process.env.M365_FROM_NAME || dbM365.fromName || 'Eduardo Yepez | Cloe Tech'
  };

  const transporter = nodemailer.createTransport({
    host: m365.host,
    port: m365.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: m365.user,
      pass: m365.pass
    },
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false
    }
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"${m365.fromName}" <${m365.user}>`,
    to: recipientEmail,
    replyTo: m365.user,
    subject: '[CLOE-TEST] Prueba de Conexión Microsoft 365 Exitosa',
    text: `Hola Eduardo,\n\nEste correo confirma que tu cuenta corporativa Microsoft 365 (${m365.user}) está conectada y enviando correos reales exitosamente desde el sistema de tickets de Cloe.`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #0F172A; color: #ffffff; padding: 24px; border-radius: 8px;">
        <h2 style="color: #3B82F6; margin: 0 0 12px 0;">Cloe Moda &bull; Sistema de Tickets</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #E2E8F0;">
          Hola <strong>Eduardo</strong>,<br><br>
          Este correo confirma que el envío de correos corporativos con tu cuenta de Microsoft 365 (<strong>${m365.user}</strong>) está <strong>100% activo y funcional</strong>.
        </p>
        <div style="margin: 16px 0; padding: 12px; background: #1E293B; border-left: 4px solid #10B981; font-size: 12px;">
          Token de prueba: <strong>[CLOE-TEST]</strong><br>
          Servidor SMTP: <strong>smtp.office365.com:587 (STARTTLS / TLS 1.2)</strong>
        </div>
      </div>
    `
  });

  return { success: true, messageId: info.messageId, recipient: recipientEmail };
}

// Inbound Email Parser (Webhook & Simulator)
export function processInboundEmail({ from, to, subject, text, html = '' }) {
  console.log(`[Inbound Email] Processing incoming email from: ${from} | Subject: ${subject}`);

  const match = subject.match(/\[CLOE-(\d+)\]/i) || (text && text.match(/\[CLOE-(\d+)\]/i));
  if (!match) {
    return {
      success: false,
      error: 'No se encontró un token válido [CLOE-XXXX] en el asunto o cuerpo del correo.'
    };
  }

  const ticketId = `CLOE-${match[1]}`;
  const ticket = db.getTicketById(ticketId);

  if (!ticket) {
    return {
      success: false,
      error: `Ticket ${ticketId} no encontrado en la base de datos.`
    };
  }

  const cleanContent = extractCleanReply(text || '');

  let senderEmail = from;
  let senderName = 'Usuario Cloe';

  const nameEmailMatch = from.match(/(.*)<(.+)>/);
  if (nameEmailMatch) {
    senderName = nameEmailMatch[1].replace(/"/g, '').trim();
    senderEmail = nameEmailMatch[2].trim();
  }

  const newMsg = db.addMessage(ticketId, {
    senderEmail,
    senderName: senderName || ticket.requesterName,
    senderRole: 'user',
    isInternalNote: false,
    content: cleanContent || '(Sin contenido de texto en el correo)',
    source: 'email'
  });

  db.logEmail({
    ticketId,
    type: 'inbound',
    from,
    to: to || 'eyepez@oemoda.com',
    subject,
    bodyText: cleanContent,
    bodyHtml: html,
    status: 'processed'
  });

  return {
    success: true,
    ticketId,
    messageId: newMsg.id,
    cleanContent
  };
}
