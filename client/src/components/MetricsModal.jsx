import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

const CATEGORY_NAMES = {
  rendimiento_performance: 'Rendimiento & Optimización',
  nuevo_modulo_feature: 'Nuevo Módulo / Feature',
  bases_datos_dba: 'Bases de Datos & DBA',
  integraciones_apis: 'Integraciones & APIs',
  vtex_backend_io: 'VTEX IO & Backend',
  checkout_pagos_tech: 'Checkout & Pasarelas',
  bug_codigo: 'Bug de Código',
  infraestructura_devops: 'Infraestructura & Cloud',
  seguridad_accesos: 'Seguridad & Tokens',
  extraccion_scripts: 'Scripts & ETL',
  other_tech: 'Ingeniería Técnica',
  vtex_storefront: 'Rendimiento & Storefront',
  vtex_checkout: 'Checkout & Pasarelas',
  oms_orders: 'Integraciones & APIs',
  integrations_erp_crm: 'Integraciones ERP / CRM',
  reports_dba: 'Bases de Datos & DBA',
  ui_ux: 'Nuevo Módulo / Feature',
  critical_bug: 'Bug de Código',
  other: 'Ingeniería Técnica'
};

export default function MetricsModal({ onClose, adminPin = '' }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const pin = adminPin || sessionStorage.getItem('cloe_admin_pin') || '';

  useEffect(() => {
    fetch('/api/metrics', {
      headers: { 'x-admin-pin': pin }
    })
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error('Error fetching metrics:', err))
      .finally(() => setLoading(false));
  }, [pin]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/tickets', {
        headers: { 'x-admin-pin': pin }
      });
      const tickets = await res.json();

      const headers = ['ID', 'Tienda', 'Titulo', 'Categoria', 'Prioridad', 'Estado', 'Solicitante', 'Departamento', 'Creado', 'Resuelto'];
      const rows = tickets.map(t => [
        t.id,
        t.store,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        t.requesterName,
        t.department,
        t.createdAt,
        t.resolvedAt || ''
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-ingenieria-cloe-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  return (
    <div
      className="modal-overlay-mobile"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        className="modal-content-mobile"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Métricas de Ingeniería
              </h3>
              <span className="hide-mobile" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                cloe.com.mx &bull; Cloe Factory Store &bull; Desarrollo de Software
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleExportCsv}
              title="Descargar CSV para Excel"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FileSpreadsheet size={13} />
              <span className="hide-mobile">Exportar</span> CSV
            </button>

            <button
              onClick={handlePrint}
              title="Imprimir o Guardar en PDF"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Printer size={13} />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Cargando métricas...
            </div>
          ) : !metrics ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No hay métricas disponibles.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Requerimientos Totales
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                    {metrics.total}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--status-progress)', fontWeight: 600 }}>
                    En Proceso / Fix
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--status-progress)', margin: '2px 0' }}>
                    {metrics.open}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--status-resolved)', fontWeight: 600 }}>
                    Desplegados / Resueltos
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--status-resolved)', margin: '2px 0' }}>
                    {metrics.resolved}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
                    P1 Críticos Activos
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', margin: '2px 0' }}>
                    {metrics.critical}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                    Tiempo Promedio
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '2px 0' }}>
                    {metrics.avgResolutionHours}h
                  </div>
                </div>
              </div>

              {/* Distribution by Store */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Carga por Frente Técnico
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>cloe.com.mx</span>
                      <span>{metrics.byStore['cloe.com.mx'] || 0} requerimientos</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${metrics.total > 0 ? (((metrics.byStore['cloe.com.mx'] || 0) / metrics.total) * 100) : 0}%`,
                        background: 'var(--primary)'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Cloe Factory Store</span>
                      <span>{metrics.byStore['cloefactorystore.com.mx'] || 0} requerimientos</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${metrics.total > 0 ? (((metrics.byStore['cloefactorystore.com.mx'] || 0) / metrics.total) * 100) : 0}%`,
                        background: '#F59E0B'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown by Category */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Desglose por Especialidad de Ingeniería
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px'
                }}>
                  {Object.entries(metrics.byCategory || {}).map(([catKey, count]) => (
                    <div key={catKey} style={{
                      background: 'var(--bg-surface)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {CATEGORY_NAMES[catKey] || catKey}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
