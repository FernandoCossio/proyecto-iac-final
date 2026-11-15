'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Server,
  Plus,
  BarChart3,
  Search,
  ExternalLink,
  Power,
  RotateCcw,
  Trash2,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import { tenantsService } from '@/features/tenants/services/tenants.service';
import { Tenant } from '@/features/tenants/types/tenant.types';

export default function TenantsDashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Modales
  const [selectedLogsTenant, setSelectedLogsTenant] = useState<Tenant | null>(null);
  const [deleteTargetTenant, setDeleteTargetTenant] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tenantsService.getTenants({
        search: search || undefined,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
      });
      setTenants(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar los tenants');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, planFilter]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Manejar Suspender
  const handleSuspend = async (tenant: Tenant) => {
    try {
      setActionLoadingId(tenant.id);
      await tenantsService.suspendTenant(tenant.id);
      toast.success(`Tenant ${tenant.name} suspendido. Cómputo detenido (RF-16).`);
      await loadTenants();
    } catch (err: any) {
      toast.error(err.message || 'Error al suspender el tenant');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manejar Reanudar
  const handleResume = async (tenant: Tenant) => {
    try {
      setActionLoadingId(tenant.id);
      await tenantsService.resumeTenant(tenant.id);
      toast.success(`Tenant ${tenant.name} reanudado y operativo.`);
      await loadTenants();
    } catch (err: any) {
      toast.error(err.message || 'Error al reanudar el tenant');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manejar Confirmación de Eliminación (RF-18)
  const handleConfirmDelete = async () => {
    if (!deleteTargetTenant) return;
    try {
      setIsDeleting(true);
      const res = await tenantsService.deleteTenant(deleteTargetTenant.id);
      toast.success(res.message);
      setDeleteTargetTenant(null);
      await loadTenants();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el tenant');
    } finally {
      setIsDeleting(false);
    }
  };

  // KPIs
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'SUSPENDED').length;
  const inProgressTenants = tenants.filter(
    (t) => t.status === 'PROVISIONING_IAC' || t.status === 'PROVISIONING_ANSIBLE' || t.status === 'PENDING',
  ).length;

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-600" />
            Plataforma de Administración de Tenants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de ciclo de vida, aprovisionamiento multi-nube y monitoreo operativo de instituciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3002/d/tenants-de-asistencias/tenants-de-asistencias"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Métricas Grafana
          </a>

          <Link
            href="/admin/tenants/crear"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tenant
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Tenants
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTenants}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Activos
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{activeTenants}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Suspendidos
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{suspendedTenants}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            En Despliegue
          </span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{inProgressTenants}</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por institución o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">Todos los Estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="SUSPENDED">Suspendido</option>
            <option value="PROVISIONING_IAC">Aprovisionando IaC</option>
            <option value="PROVISIONING_ANSIBLE">Configurando Ansible</option>
            <option value="FAILED">Fallido</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">Todos los Planes</option>
            <option value="Basico">Básico</option>
            <option value="Estandar">Estándar</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <button
            onClick={() => loadTenants()}
            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabla de Tenants */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Institución / Slug</th>
                <th className="py-3 px-4">Plan Sizing</th>
                <th className="py-3 px-4">Nube & Motor</th>
                <th className="py-3 px-4">Entorno</th>
                <th className="py-3 px-4">Estado Operativo</th>
                <th className="py-3 px-4 text-right">Acciones de Ciclo de Vida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Cargando catálogo de tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron tenants registrados. Haz clic en "Nuevo Tenant" para aprovisionar el primero.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tenant.name}</div>
                      <div className="text-xs font-mono text-indigo-600">{tenant.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Cpu className="w-3 h-3" />
                        {tenant.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {tenant.cloudProvider}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {tenant.iacEngine}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs capitalize font-medium text-slate-600">
                        {tenant.environment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {tenant.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Activo
                        </span>
                      )}
                      {tenant.status === 'SUSPENDED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Suspendido
                        </span>
                      )}
                      {(tenant.status === 'PROVISIONING_IAC' ||
                        tenant.status === 'PROVISIONING_ANSIBLE' ||
                        tenant.status === 'PENDING') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          Desplegando ({tenant.progress}%)
                        </span>
                      )}
                      {tenant.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Fallido
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tenant.frontendUrl && (
                          <a
                            href={tenant.frontendUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                            title="Abrir Sistema del Tenant"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setSelectedLogsTenant(tenant)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                          title="Ver Consola / Logs de Despliegue"
                        >
                          <Terminal className="w-4 h-4" />
                        </button>

                        {tenant.status === 'ACTIVE' && (
                          <button
                            disabled={actionLoadingId === tenant.id}
                            onClick={() => handleSuspend(tenant)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition"
                            title="Suspender Tenant (RF-16)"
                          >
                            {actionLoadingId === tenant.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {tenant.status === 'SUSPENDED' && (
                          <button
                            disabled={actionLoadingId === tenant.id}
                            onClick={() => handleResume(tenant)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                            title="Reanudar Tenant"
                          >
                            {actionLoadingId === tenant.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTargetTenant(tenant)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Eliminar Tenant (RF-18)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VER LOGS DE DESPLIEGUE */}
      {selectedLogsTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">
                  Logs de Despliegue: {selectedLogsTenant.name} ({selectedLogsTenant.slug})
                </span>
              </div>
              <button
                onClick={() => setSelectedLogsTenant(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto space-y-1 flex-1">
              {selectedLogsTenant.logs && selectedLogsTenant.logs.length > 0 ? (
                selectedLogsTenant.logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('[ERROR]')
                        ? 'text-rose-400'
                        : line.includes('[EXITO]')
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">No hay logs registrados para este tenant.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE RECURSOS (RF-18) */}
      {deleteTargetTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  ¿Confirmar eliminación de {deleteTargetTenant.name}?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción destruirá los siguientes recursos dedicados según el requisito RF-18:
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
              <p>• Virtual Network y 3 Subredes (vnet-{deleteTargetTenant.slug})</p>
              <p>• 3 Network Security Groups (nsg-{deleteTargetTenant.slug}-*)</p>
              <p>• 3 Instancias Virtuales dedicadas (Frontend, Backend, DB)</p>
              <p>• Base de datos PostgreSQL y persistencia</p>
              <p>• Inventario Ansible (inventory-{deleteTargetTenant.slug}.ini)</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTargetTenant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>

              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-xs transition"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar y Destruir Recursos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
