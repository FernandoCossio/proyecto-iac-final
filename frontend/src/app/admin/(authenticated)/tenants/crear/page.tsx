'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Server,
  Cloud,
  CheckCircle2,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Cpu,
  Database,
  HardDrive,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { tenantsService } from '@/features/tenants/services/tenants.service';
import {
  CloudProvider,
  IaCEngine,
  TenantEnvironment,
  TenantPlan,
  TenantStatusResponse,
} from '@/features/tenants/types/tenant.types';

export default function CrearTenantPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('AWS');
  const [iacEngine, setIacEngine] = useState<IaCEngine>('Terraform');
  const [plan, setPlan] = useState<TenantPlan>('Estandar');
  const [environment, setEnvironment] = useState<TenantEnvironment>('development');
  const [adminPassword, setAdminPassword] = useState('AdminTenant2026!');

  // Deployment / Progress Modal State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTenantId, setDeployedTenantId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<TenantStatusResponse | null>(null);

  // Auto-generar slug a partir del nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  // Polling para el visor de progreso y logs en vivo
  useEffect(() => {
    if (!isDeploying || !deployedTenantId) return;

    const interval = setInterval(async () => {
      try {
        const status = await tenantsService.getTenantStatus(deployedTenantId);
        setLiveStatus(status);

        if (status.status === 'ACTIVE' || status.status === 'FAILED') {
          clearInterval(interval);
          if (status.status === 'ACTIVE') {
            toast.success('¡Tenant aprovisionado y desplegado exitosamente!');
          } else {
            toast.error('Ocurrió un error durante el despliegue del tenant.');
          }
        }
      } catch (err: any) {
        console.error('Error en polling de status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isDeploying, deployedTenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !contactEmail) {
      toast.error('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsDeploying(true);
      const newTenant = await tenantsService.createTenant({
        name,
        slug,
        contactEmail,
        cloudProvider,
        iacEngine,
        plan,
        environment,
        adminPassword,
      });

      setDeployedTenantId(newTenant.id);
      setLiveStatus({
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        status: newTenant.status,
        progress: 0,
        currentStep: 'Iniciando pipeline de despliegue...',
        frontendUrl: null,
        logs: newTenant.logs || [],
        updatedAt: newTenant.updatedAt,
      });

      toast.info('Pipeline de orquestación iniciado.');
    } catch (err: any) {
      setIsDeploying(false);
      toast.error(err.message || 'Error al iniciar la creación del tenant');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-6">
      {/* Encabezado */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <Server className="w-4 h-4" />
            <span>Control Plane & Infraestructura como Código</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Crear y Desplegar Nuevo Tenant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aprovisiona automáticamente la infraestructura dedicada (3 niveles) y despliega la aplicación de asistencia.
          </p>
        </div>

        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Listado
        </Link>
      </div>

      {/* Indicador de Pasos del Wizard */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 mb-8">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
              currentStep === 1
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              1
            </span>
            <span className="hidden sm:inline">Datos y Plan</span>
          </div>

          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
              currentStep === 2
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              2
            </span>
            <span className="hidden sm:inline">Recursos y Red</span>
          </div>

          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
              currentStep === 3
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              3
            </span>
            <span className="hidden sm:inline">Revisión y Despliegue</span>
          </div>
        </div>
      </div>

      {/* Formulario Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* PASO 1: DATOS Y PLAN */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b pb-3">
                1. Información de la Institución y Motor
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nombre de la Institución *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Instituto San Marcos"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Identificador / Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="san-marcos"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Correo Administrador Escolar *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@instituto.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Selección de Nube y Motor IaC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Proveedor Cloud
                    </label>
                    <select
                      value={cloudProvider}
                      onChange={(e) => setCloudProvider(e.target.value as CloudProvider)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="AWS">Amazon Web Services (us-east-1)</option>
                      <option value="Azure">Microsoft Azure (spaincentral - En configuración)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Motor de Infraestructura (IaC)
                    </label>
                    <select
                      value={iacEngine}
                      onChange={(e) => setIacEngine(e.target.value as IaCEngine)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Terraform">Terraform (Motor Principal)</option>
                      <option value="OpenTofu">OpenTofu (Open Source)</option>
                      <option value="Pulumi">Pulumi (TypeScript SDK)</option>
                      <option value="CloudFormation">CloudFormation (Nativo AWS)</option>
                    </select>
                  </div>
                </div>

                {/* Catálogo de Planes Sizing */}
                <div className="pt-4">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                    Seleccionar Plan de Infraestructura (Sizing)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'Basico' as TenantPlan,
                        title: 'Básico',
                        desc: 'Para instituciones pequeñas o pruebas',
                        specs: '2 vCPU / 4GB RAM (B2ls_v2)',
                        disk: '30 GB Standard',
                        color: 'border-slate-200 hover:border-slate-400',
                      },
                      {
                        id: 'Estandar' as TenantPlan,
                        title: 'Estándar',
                        desc: 'Carga académica estándar balanceada',
                        specs: '2 vCPU / 4GB RAM (B2s_v2)',
                        disk: '30 GB SSD + Backups',
                        color: 'border-indigo-300 ring-1 ring-indigo-500 bg-indigo-50/20',
                      },
                      {
                        id: 'Avanzado' as TenantPlan,
                        title: 'Avanzado',
                        desc: 'Alta demanda y auditoría intensiva',
                        specs: '4 vCPU / 8GB RAM (B4s_v2)',
                        disk: '50 GB Premium SSD',
                        color: 'border-slate-200 hover:border-slate-400',
                      },
                    ].map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setPlan(p.id)}
                        className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
                          plan === p.id
                            ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{p.title}</span>
                            {plan === p.id && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.specs}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.disk}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!name || !slug || !contactEmail) {
                      toast.error('Completa los campos obligatorios antes de continuar.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition"
                >
                  Siguiente: Configuración
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: RECURSOS Y RED */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b pb-3">
                2. Configuración de Recursos y Parámetros de Red
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    <span>Topología de Red Dedicada (3 Capas Aisladas)</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <p>• Subred DMZ Pública: 10.20.1.0/24 (Frontend Next.js + Bastion SSH :22, :80)</p>
                    <p>• Subred Privada: 10.20.2.0/24 (Backend API NestJS :3000, solo desde Frontend)</p>
                    <p>• Subred Aislada: 10.20.3.0/24 (PostgreSQL 16 :5432, solo desde Backend)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Entorno de Despliegue
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as TenantEnvironment)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="development">Desarrollo (dev)</option>
                      <option value="staging">Staging (qa)</option>
                      <option value="production">Producción (prod)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Contraseña Admin Inicial del Tenant
                    </label>
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Seguridad DevSecOps:</strong> La base de datos no tendrá IP pública. Las llaves SSH y secretos se inyectan a través del inventario encriptado de Ansible sin exponerse en repositorios.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition"
                >
                  Siguiente: Revisión
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: REVISIÓN Y DESPLIEGUE */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b pb-3">
                3. Revisión Final del Contrato de Despliegue
              </h2>

              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-4 divide-y divide-slate-200">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Institución:</span>
                    <span className="font-bold text-slate-900">{name}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Slug Identificador:</span>
                    <span className="font-mono text-indigo-600 font-semibold">{slug}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Plan Sizing:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {plan}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Nube & Motor:</span>
                    <span className="font-semibold text-slate-800">
                      {cloudProvider} ({iacEngine})
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Entorno:</span>
                    <span className="capitalize text-slate-800">{environment}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Admin Escolar:</span>
                    <span className="text-slate-800">{contactEmail}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    El tenant quedará registrado y sus métricas de hardware serán enviadas al tablero de Grafana automáticamente.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition"
                >
                  Confirmar y Desplegar Tenant
                  <Server className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen Lateral en Tiempo Real */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Resumen en Tiempo Real
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Institución</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {name || 'No especificado'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Identificador</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {slug || 'slug-tenant'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block mb-1">Recursos Asignados ({plan})</span>
                <div className="space-y-1.5 font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-indigo-500" />
                    <span>3 Máquinas Virtuales Dedicadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>PostgreSQL 16 Aislado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    <span>VNet con 3 Subredes Seguras</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block mb-1">Observabilidad</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  node_exporter :9100 preconfigurado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / VISOR DE PROGRESO Y LOGS EN VIVO (Fase 4) */}
      {isDeploying && liveStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera del Visor */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {liveStatus.status === 'ACTIVE' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    Desplegando Tenant: {liveStatus.name} ({liveStatus.slug})
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Paso actual: {liveStatus.currentStep}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-indigo-300">
                {liveStatus.progress}%
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-slate-200 h-2">
              <div
                className="bg-indigo-600 h-2 transition-all duration-500"
                style={{ width: `${liveStatus.progress}%` }}
              ></div>
            </div>

            {/* Terminal de Consola con Logs en Vivo */}
            <div className="p-5 flex-1 overflow-hidden flex flex-col bg-slate-950 text-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2 pb-2 border-b border-slate-800">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Consola de Salida del Orquestador (IaC + Ansible Execution Log)</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs text-slate-300 p-2 bg-slate-900/50 rounded-lg min-h-[220px]">
                {liveStatus.logs && liveStatus.logs.length > 0 ? (
                  liveStatus.logs.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.includes('[ERROR]')
                          ? 'text-rose-400'
                          : log.includes('[EXITO]')
                          ? 'text-emerald-400 font-semibold'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Esperando primeros eventos del orquestador...</div>
                )}
              </div>
            </div>

            {/* Pie del Visor */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Estado: <strong className="uppercase text-indigo-700">{liveStatus.status}</strong>
              </span>

              <div className="flex items-center gap-3">
                {liveStatus.status === 'ACTIVE' && liveStatus.frontendUrl && (
                  <a
                    href={liveStatus.frontendUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                  >
                    Abrir Sistema del Tenant
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {liveStatus.status === 'ACTIVE' || liveStatus.status === 'FAILED' ? (
                  <button
                    onClick={() => router.push('/admin/tenants')}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                  >
                    Ir al Panel de Tenants
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Aprovisionamiento en curso, no cierre esta ventana...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
