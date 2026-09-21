# 👜 Sistema Integral de Gestión de Tickets Cloe Moda
### Centro de Comando Técnico para `cloe.com.mx` & `Cloe Factory Store`

Sistema web integral de soporte técnico, gestión de incidencias VTEX, integraciones ERP/CRM, administración de bases de datos y generación de reportes ejecutivos. Diseñado a la medida para el desarrollador único a cargo de la operación de comercio electrónico de Cloe (Grupo OE Moda).

---

## 🌟 Características Principales

### 1. Dos Vistas Especializadas (Sin Fricción de Registro)
- **Portal de Colaborador Cloe**:
  - Acceso inmediato sin contraseñas engorrosas: cualquier colaborador con correo `@oemoda.com`, `@oemoda.com.mx` o `@cloe.com.mx` puede registrar requerimientos.
  - Asignación guiada de tienda: **cloe.com.mx (Flagship)** vs **Cloe Factory Store (Outlet)** vs **Ambos / Corporativo**.
  - Categorización técnica con íconos: VTEX Storefront (CMS/Banners), VTEX Checkout & Pagos, OMS & Pedidos, Integraciones (ERP/Inventario/Facturación), Reportes & DBA, Diseño UI/UX y Errores Críticos P1.
  - Detección de SLA en tiempo real (4 horas para P1 hasta 72 horas para P4).
  - Consulta rápida de "Mis Solicitudes" ingresando el correo corporativo (guardado automáticamente en el navegador).

- **Consola del Desarrollador (Dev Admin)**:
  - Protegido por PIN de acceso rápido (PIN inicial: `cloe2026`, configurable desde la UI).
  - **Tablero Kanban Interactivo** con 6 estados técnicos (Nuevos, Triaje, En Desarrollo / Fix, En Pruebas Staging, Resueltos ✅, Cerrados) con soporte para **Drag & Drop**.
  - **Vista de Lista / Tabla**: Para navegación rápida con filtros combinados por tienda, prioridad y categoría.
  - **Notas Internas Técnicas**: El desarrollador puede registrar notas privadas (queries SQL, tokens, endpoints, notas de arquitectura VTEX) que quedan ocultas para el usuario común.
  - **Macros Rápidos**: Plantillas de respuesta precargadas ("Revisando en VTEX MasterData", "Corregido en Staging", "Desplegado en Producción", etc.).
  - **Accesos Directos a VTEX**: Enlaces rápidos a VTEX OMS, Promociones (Rates & Benefits), Checkout y MasterData para ambas tiendas.

### 2. Sistema de Correo Bidireccional (Hilo Sincronizado)
- **Notificaciones Automáticas**: Cada vez que se crea un ticket, se cambia de estado o el dev responde, el sistema genera un correo HTML luxury con la marca Cloe y el token único de hilo: `[CLOE-XXXX]`.
- **Sincronización Inbound (Respuesta por Correo)**:
  - Si el usuario responde al correo desde su Outlook / Microsoft 365, el sistema extrae el token `[CLOE-XXXX]`, limpia las citas y firmas previas, e inserta la respuesta directamente en la cronología del ticket con la insignia **"Respondido vía Correo"**.
- **Buzón y Simulador Integrado**: Incluye un drawer interactivo donde puedes probar respuestas entrantes en tiempo real sin necesidad de configurar credenciales al instante.
- **Soporte Nativo Microsoft 365**: Configurable para tu cuenta corporativa SMTP (`smtp.office365.com`, puerto 587, STARTTLS).

### 3. Reportes Ejecutivos & Métricas para Dirección
- Métricas clave: Total de requerimientos, activos, resueltos, críticos P1 y tiempo promedio de resolución.
- Gráficos de distribución de carga por tienda (`cloe.com.mx` vs `Cloe Factory Store`).
- Desglose por área técnica (VTEX vs Integraciones vs DBA vs CRM vs UI/UX).
- **Exportación en un clic**:
  - **Exportar CSV**: Para análisis en Excel.
  - **Imprimir / Guardar en PDF**: Con formato ejecutivo para presentar a directivos de OE Moda y respaldar tu volumen de trabajo.

---

## 🚀 Inicio Rápido en Local

### Prerrequisitos
- Node.js 18+ instalado.

### 1. Instalación de dependencias
```bash
# Instalar dependencias raíz y del cliente
npm install
npm --prefix client install
```

### 2. Iniciar en Modo Desarrollo
```bash
npm run dev
```
- **Backend API**: `http://localhost:4000`
- **Frontend Vite con Hot-Reload**: `http://localhost:5173`

*(O puedes correr `npm run build` y luego `npm start` para probar el servidor unificado en `http://localhost:4000`)*.

---

## ☁️ Despliegue en Render

El proyecto está 100% preparado para desplegarse como un **Web Service de Node.js** en Render:

### Opción A: Conexión mediante GitHub / GitLab
1. Sube este repositorio a tu cuenta de GitHub o GitLab.
2. En tu panel de Render, selecciona **New +** &rarr; **Web Service**.
3. Conecta el repositorio de GitHub.
4. Configura los parámetros:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm --prefix client install && npm run build`
   - **Start Command**: `npm start`
5. En la sección **Environment Variables**, añade:
   - `NODE_ENV` = `production`
   - `ADMIN_PIN` = tu contraseña o PIN preferido (ej. `cloe2026`)
   - *(Opcional)* `M365_USER` = tu correo corporativo Microsoft 365
   - *(Opcional)* `M365_PASS` = tu contraseña o contraseña de aplicación Microsoft 365
6. Haz clic en **Create Web Service**. ¡Listo! Render compilará el cliente React y servirá la aplicación completa en una URL HTTPS gratuita o con tu dominio personalizado.

---

## 🔐 Credenciales y Accesos por Defecto

- **PIN Administrador Dev**: `cloe2026`
- **Dominios corporativos aceptados**: `@oemoda.com`, `@oemoda.com.mx`, `@cloe.com.mx`, `@cloe.com` (en modo local está habilitado el modo permisivo para pruebas).
- **Token de identificación en correos**: `[CLOE-XXXX]`

---

## 📁 Estructura del Código

```
tickets/
├── client/                     # Frontend React 19 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Barra superior con logo Cloe y selector de rol
│   │   │   ├── UserPortal.jsx          # Portal de colaboradores sin login
│   │   │   ├── AdminCommandCenter.jsx  # Consola de control del desarrollador
│   │   │   ├── KanbanBoard.jsx         # Tablero con Drag & Drop
│   │   │   ├── ListView.jsx            # Tabla densa de tickets con SLAs
│   │   │   ├── TicketDetailModal.jsx   # Detalle, hilo de chat y notas privadas
│   │   │   ├── NewTicketModal.jsx      # Formulario guiado de captura
│   │   │   ├── MetricsModal.jsx        # Dashboard ejecutivo y exportación CSV/PDF
│   │   │   ├── EmailDrawer.jsx         # Buzón y simulador de respuestas inbound
│   │   │   ├── SettingsModal.jsx       # Configuración M365 y PIN
│   │   │   └── AdminLoginModal.jsx     # Acceso rápido por PIN
│   │   ├── index.css                   # Sistema de diseño luxury Vanilla CSS
│   │   └── App.jsx                     # Componente raíz con enrutamiento de estado
│   └── dist/                           # Build estático para producción
├── server/                     # Backend Node.js Express
│   ├── db.js                   # Motor de persistencia y modelos
│   ├── emailService.js         # Plantillas Cloe HTML, M365 SMTP y parser inbound
│   └── index.js                # APIs REST, subida de archivos y servidor estático
├── data/                       # Archivos de datos JSON y persistencia
├── uploads/                    # Almacenamiento de evidencias y capturas
├── render.yaml                 # Configuración de despliegue en Render
└── package.json                # Scripts para dev y producción
```
