import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import {
  sendTicketEmail,
  sendQaAssignmentEmail,
  sendCorrectionNotificationEmail,
  sendQaApprovalEmail,
  processInboundEmail,
  sendTestM365Email
} from './emailService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `cloe-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(uploadDir));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cloe Tickets API',
    brand: 'Cloe Moda & Cloe Factory Store',
    timestamp: new Date().toISOString()
  });
});

// Admin Auth Helper
function checkAdminAuth(req) {
  const pin = req.headers['x-admin-pin'];
  const settings = db.getSettings();
  const validPins = [
    settings.adminPin,
    process.env.ADMIN_PIN,
    'cloe2026',
    'C103.1704$'
  ].filter(Boolean);
  return Boolean(pin && validPins.includes(pin));
}

// Settings & Config
app.get('/api/settings', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Acceso no autorizado a configuración' });
  }
  const settings = db.getSettings();
  const safeSettings = {
    ...settings,
    adminPin: '********',
    m365Config: {
      ...settings.m365Config,
      pass: settings.m365Config?.pass ? '********' : ''
    }
  };
  res.json(safeSettings);
});

app.put('/api/settings', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'PIN de Administrador inválido' });
  }

  const currentSettings = db.getSettings();
  const newSettings = req.body;
  // If pass or pin is masked, preserve existing values
  if (newSettings.m365Config && newSettings.m365Config.pass === '********') {
    newSettings.m365Config.pass = currentSettings.m365Config.pass;
  }
  if (newSettings.adminPin === '********') {
    newSettings.adminPin = currentSettings.adminPin;
  }

  const updated = db.updateSettings(newSettings);
  res.json({ success: true, settings: updated });
});

// Test Microsoft 365 Email Sending
app.post('/api/settings/test-email', async (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  try {
    const { recipientEmail } = req.body;
    const target = recipientEmail || 'eyepez@oemoda.com';
    const result = await sendTestM365Email(target);
    res.json(result);
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin PIN Verification
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const settings = db.getSettings();
  const validPins = [
    settings.adminPin,
    process.env.ADMIN_PIN,
    'cloe2026',
    'C103.1704$'
  ].filter(Boolean);

  if (pin && validPins.includes(pin)) {
    return res.json({ success: true, role: 'admin' });
  }
  return res.status(401).json({ success: false, error: 'PIN incorrecto' });
});

// Email validation helper
function validateEmailDomain(email) {
  if (!email || !email.includes('@')) return false;
  const settings = db.getSettings();
  if (process.env.NODE_ENV !== 'production' && settings.allowAnyEmailInDev) return true;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return settings.allowedDomains.some(d => domain === d.toLowerCase().trim());
}

// Tickets Routes
app.get('/api/tickets', (req, res) => {
  const isAdmin = checkAdminAuth(req);
  const { store, status, priority, category, requesterEmail, search } = req.query;

  if (isAdmin) {
    const tickets = db.getTickets({
      store,
      status,
      priority,
      category,
      requesterEmail,
      search
    });
    return res.json(tickets);
  }

  // Non-admin user: strictly protect company ticket privacy
  if (requesterEmail) {
    const tickets = db.getTickets({
      requesterEmail: requesterEmail.trim(),
      search,
      store,
      status
    });
    return res.json(tickets);
  }

  if (search && search.trim()) {
    const tickets = db.getTickets({
      search: search.trim(),
      store,
      status
    });
    return res.json(tickets);
  }

  // If neither email nor specific search is provided and user is not admin, do not expose tickets
  return res.json([]);
});

app.post('/api/tickets', async (req, res) => {
  try {
    const {
      title,
      store,
      category,
      priority,
      requesterEmail,
      requesterName,
      department,
      affectedUrl,
      orderId,
      description,
      attachments
    } = req.body;

    if (!title || !requesterEmail || !description) {
      return res.status(400).json({ error: 'Título, correo de solicitante y descripción son requeridos.' });
    }

    if (!validateEmailDomain(requesterEmail)) {
      return res.status(400).json({
        error: `El correo debe pertenecer al dominio corporativo (@oemoda.com, @cloe.com.mx)`
      });
    }

    const newTicket = db.createTicket({
      title,
      store,
      category,
      priority,
      requesterEmail,
      requesterName: requesterName || requesterEmail.split('@')[0],
      department,
      affectedUrl,
      orderId,
      description,
      attachments: attachments || []
    });

    // Send confirmation email
    const appBaseUrl = `${req.protocol}://${req.get('host')}`;
    sendTicketEmail({
      ticket: newTicket,
      messageContent: `Hola ${newTicket.requesterName},\n\nHemos registrado tu ticket [${newTicket.id}] en el sistema de tecnología de Cloe Moda. El desarrollador único a cargo lo tiene en su tablero y te mantendrá notificado.\n\nDescripción inicial:\n"${newTicket.description}"`,
      recipientEmail: newTicket.requesterEmail,
      isNewTicket: true,
      appBaseUrl
    }).catch(err => console.error('Error sending ticket confirmation email:', err));

    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Error al crear el ticket.' });
  }
});

app.get('/api/tickets/:id', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }
  const isAdmin = checkAdminAuth(req);
  const messages = db.getMessages(ticket.id, isAdmin);
  const emails = isAdmin ? db.getEmails(ticket.id) : [];

  res.json({
    ticket,
    messages,
    emails
  });
});

app.patch('/api/tickets/:id', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }

  const isAdmin = checkAdminAuth(req);
  const updates = req.body;

  // Modifying status, priority, or technical workflow fields is strictly reserved for Admin (Eduardo / Omar)
  if ((updates.status || updates.priority || updates.estimationHours !== undefined) && !isAdmin) {
    return res.status(403).json({ error: 'Solo los administradores técnicos (Eduardo / Omar) pueden modificar el estado o estimación' });
  }

  // Check Friday release restriction
  const isFriday = new Date().getDay() === 5;
  if (updates.status === 'monitoring' && isFriday && !updates.forceFridayRelease) {
    return res.status(400).json({
      error: 'Regla de Liberación CLOE: No se realizan liberaciones en viernes para reducir riesgos en fin de semana. Las liberaciones se realizan los LUNES.'
    });
  }

  const previousStatus = ticket.status;
  const updatedTicket = db.updateTicket(ticket.id, updates);
  const appBaseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;

  // 1. AUTOMATIC DEDICATED NOTIFICATION TO OMAR DÍAZ (adiaz@oemoda.com) WHEN MOVING TO QA
  if (
    (updates.status === 'in_qa' && previousStatus !== 'in_qa') ||
    (updates.assignedTo && (updates.assignedTo.includes('adiaz') || updates.assignedTo.includes('omar')) && ticket.assignedTo !== updates.assignedTo)
  ) {
    console.log(`[QA Trigger] Ticket ${ticket.id} moved to Omar Díaz (in_qa). Sending email to adiaz@oemoda.com...`);
    sendQaAssignmentEmail({
      ticket: updatedTicket,
      senderNote: updates.statusNote,
      recipientEmail: 'adiaz@oemoda.com',
      appBaseUrl
    }).catch(err => console.error('Error sending QA assignment email to Omar Díaz:', err));
  }

  // 2. CORRECTIONS NOTIFICATION TO EDUARDO (eyepez@oemoda.com)
  if (updates.status === 'corrections' && previousStatus !== 'corrections') {
    sendCorrectionNotificationEmail({
      ticket: updatedTicket,
      senderNote: updates.statusNote,
      recipientEmail: 'eyepez@oemoda.com',
      appBaseUrl
    }).catch(err => console.error('Error sending corrections email to Eduardo:', err));
  }

  // 3. QA APPROVAL NOTIFICATION TO EDUARDO & REQUESTER (MONDAY RELEASE)
  if (updates.status === 'ready_release' && previousStatus !== 'ready_release') {
    sendQaApprovalEmail({
      ticket: updatedTicket,
      appBaseUrl
    }).catch(err => console.error('Error sending QA approval email:', err));
  }

  // 4. GENERAL STATUS UPDATE TO REQUESTER
  if (updates.status && updates.status !== previousStatus && updates.notifyUser !== false) {
    const statusNames = {
      backlog: '1. Solicitud Recibida (Backlog)',
      planned: '2 & 3. Planeación & Asignación',
      in_progress: '4. En Desarrollo (Eduardo)',
      in_qa: '5. QA en Workspace (Omar Díaz)',
      corrections: '6. Corrección y Revalidación',
      ready_release: '7. Listo para Liberar (Lunes)',
      monitoring: '8. Liberado en Producción / Monitoreo',
      closed: 'Cerrado'
    };
    const statusMsg = updates.statusNote || `El flujo de tu requerimiento avanzó a: ${statusNames[updates.status] || updates.status}`;

    sendTicketEmail({
      ticket: updatedTicket,
      messageContent: statusMsg,
      recipientEmail: updatedTicket.requesterEmail,
      isNewTicket: false,
      appBaseUrl
    }).catch(err => console.error('Error sending status change email:', err));
  }

  res.json(updatedTicket);
});

// Manual / Re-notification endpoint to Omar Díaz (adiaz@oemoda.com)
app.post('/api/tickets/:id/notify-qa', async (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const isAdmin = checkAdminAuth(req);
  if (!isAdmin) return res.status(403).json({ error: 'Acceso reservado para el equipo técnico' });

  try {
    const { note, recipientEmail } = req.body;
    const appBaseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const targetEmail = recipientEmail || 'adiaz@oemoda.com';

    const log = await sendQaAssignmentEmail({
      ticket,
      senderNote: note || 'Recordatorio de requerimiento pendiente para auditoría de calidad y pruebas en workspace.',
      recipientEmail: targetEmail,
      appBaseUrl
    });

    res.json({
      success: true,
      message: `Notificación de QA enviada exitosamente a Omar Díaz (${targetEmail})`,
      log
    });
  } catch (err) {
    console.error('Error notifying Omar Díaz:', err);
    res.status(500).json({ error: 'Error enviando notificación a Omar Díaz' });
  }
});

// QA Checklist endpoint
app.patch('/api/tickets/:id/qa-checklist', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const isAdmin = checkAdminAuth(req);
  if (!isAdmin) return res.status(403).json({ error: 'Acceso reservado para el equipo técnico' });

  const { itemId, checked, checkedBy } = req.body;
  if (!itemId) return res.status(400).json({ error: 'itemId requerido' });

  const updatedTicket = db.updateQAChecklist(ticket.id, itemId, checked, checkedBy || 'Omar (QA / Tester)');
  res.json(updatedTicket);
});

// QA Findings (Bugs) endpoints
app.post('/api/tickets/:id/qa-findings', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const isAdmin = checkAdminAuth(req);
  if (!isAdmin) return res.status(403).json({ error: 'Acceso reservado para el equipo técnico' });

  const { title, description, severity, device, reportedBy } = req.body;
  if (!title) return res.status(400).json({ error: 'El título del hallazgo es obligatorio' });

  const updatedTicket = db.addQAFinding(ticket.id, {
    title,
    description,
    severity,
    device,
    reportedBy: reportedBy || 'Omar (QA / Tester)'
  });
  res.status(201).json(updatedTicket);
});

app.patch('/api/tickets/:id/qa-findings/:findingId', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const isAdmin = checkAdminAuth(req);
  if (!isAdmin) return res.status(403).json({ error: 'Acceso reservado para el equipo técnico' });

  const updatedTicket = db.updateQAFinding(ticket.id, req.params.findingId, req.body);
  res.json(updatedTicket);
});

// Messages Routes
app.get('/api/tickets/:id/messages', (req, res) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const isAdmin = checkAdminAuth(req);
  const messages = db.getMessages(ticket.id, isAdmin);
  res.json(messages);
});

app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const ticket = db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    const isAdmin = checkAdminAuth(req);
    const { senderEmail, senderName, senderRole, isInternalNote, content, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío.' });
    }

    const newMsg = db.addMessage(ticket.id, {
      senderEmail: isAdmin ? (senderEmail || 'eyepez@oemoda.com') : (senderEmail || ticket.requesterEmail),
      senderName: isAdmin ? (senderName || 'Eduardo Yepez (Ingeniería)') : (senderName || ticket.requesterName),
      senderRole: isAdmin ? (senderRole || 'admin') : 'user',
      isInternalNote: isAdmin ? !!isInternalNote : false,
      content: content.trim(),
      attachments: attachments || [],
      source: 'web'
    });

    // If message is sent by Admin and is NOT an internal note, send email to requester
    if (isAdmin && !isInternalNote) {
      const appBaseUrl = `${req.protocol}://${req.get('host')}`;
      sendTicketEmail({
        ticket,
        messageContent: content.trim(),
        recipientEmail: ticket.requesterEmail,
        isNewTicket: false,
        appBaseUrl
      }).catch(err => console.error('Error sending message notification email:', err));
    }

    res.status(201).json(newMsg);
  } catch (err) {
    console.error('Error posting message:', err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

// File Upload Route
app.post('/api/upload', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    const uploaded = req.files.map(f => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      filename: f.filename,
      originalName: f.originalname,
      url: `/uploads/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype
    }));

    res.json({ success: true, files: uploaded });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
});

// Metrics & Reports (Admin only)
app.get('/api/metrics', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Acceso no autorizado a métricas' });
  }
  const metrics = db.getMetrics();
  res.json(metrics);
});

// Emails Log (Admin only)
app.get('/api/emails', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Acceso no autorizado a historial de correos' });
  }
  const { ticketId } = req.query;
  const emails = db.getEmails(ticketId);
  res.json(emails);
});

// Inbound Email Webhook (for real inbound email services like SendGrid Parse, Postmark, Mailgun)
app.post('/api/emails/inbound', (req, res) => {
  try {
    const { from, to, subject, text, html } = req.body;
    const result = processInboundEmail({
      from: from || req.body.sender,
      to: to || req.body.recipient,
      subject: subject || '',
      text: text || req.body['stripped-text'] || req.body.body || '',
      html: html || req.body['stripped-html'] || ''
    });

    if (result.success) {
      return res.json({ success: true, ...result });
    } else {
      return res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error('Error processing inbound email:', err);
    res.status(500).json({ error: 'Error procesando correo entrante' });
  }
});

// Simulate Inbound Email Reply (Admin only testing tool)
app.post('/api/emails/simulate-reply', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  try {
    const { ticketId, senderEmail, senderName, replyText } = req.body;
    const ticket = db.getTicketById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    const subject = `Re: [${ticket.id}] ${ticket.title}`;
    const result = processInboundEmail({
      from: `"${senderName || ticket.requesterName}" <${senderEmail || ticket.requesterEmail}>`,
      to: 'soporte.ecommerce@oemoda.com',
      subject,
      text: replyText || 'Respuesta de prueba enviada desde correo simulado.'
    });

    res.json(result);
  } catch (err) {
    console.error('Error simulating reply:', err);
    res.status(500).json({ error: 'Error al simular respuesta de correo' });
  }
});

// Serve Client in Production (for Render deployment)
const clientBuildDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildDir)) {
  console.log('[Server] Serving production client build from:', clientBuildDir);
  app.use(express.static(clientBuildDir));
  app.use((req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  CLOE MODA - TICKET COMMAND CENTER`);
  console.log(`  cloe.com.mx & Cloe Factory Store`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`=================================================`);
});
