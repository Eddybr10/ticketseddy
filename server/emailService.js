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

// Send Notification Email (Supports Microsoft 365 and Local Simulation Mode)
export async function sendTicketEmail({ ticket, messageContent, recipientEmail, isNewTicket = false, appBaseUrl = 'http://localhost:4000' }) {
  const settings = db.getSettings();
  const dbM365 = settings.m365Config || {};

  // Merge database config with environment variables
  const m365 = {
    enabled: dbM365.enabled !== false,
    host: process.env.M365_HOST || dbM365.host || 'smtp.office365.com',
    port: parseInt(process.env.M365_PORT || dbM365.port) || 587,
    user: process.env.M365_USER || dbM365.user || 'eyepez@oemoda.com',
    pass: process.env.M365_PASS || dbM365.pass || 'Edu3533862@',
    fromEmail: process.env.M365_FROM_EMAIL || dbM365.fromEmail || dbM365.user || 'eyepez@oemoda.com',
    fromName: process.env.M365_FROM_NAME || dbM365.fromName || 'Eduardo Yepez | Cloe Tech'
  };

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

  const emailLog = {
    ticketId,
    type: 'outbound',
    to: recipientEmail || ticket.requesterEmail,
    from: m365.user,
    subject,
    bodyHtml: html,
    bodyText: text,
    status: 'pending'
  };

  // If Microsoft 365 credentials exist, send via SMTP
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
        to: recipientEmail || ticket.requesterEmail,
        replyTo: m365.user,
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
      console.log(`[Email M365] Successfully sent real email for ${ticketId} to ${recipientEmail || ticket.requesterEmail}`);
    } catch (err) {
      console.error(`[Email M365 Error] Failed to send email via SMTP:`, err.message);
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
