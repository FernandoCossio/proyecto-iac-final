"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  Server,
  Database,
  ArrowRight,
  ArrowLeft,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
  Cloud,
} from "lucide-react";

const CLOUD_PROVIDERS = [
  { id: "aws", name: "Amazon Web Services (AWS)", short: "AWS" },
  { id: "azure", name: "Microsoft Azure (Azure)", short: "Azure" },
] as const;

interface RegionOption {
  code: string;
  name: string;
  location: string;
  tag?: string;
}

const CLOUD_REGIONS: Record<"aws" | "azure", RegionOption[]> = {
  aws: [
    {
      code: "us-east-1",
      name: "US East (N. Virginia)",
      location: "Norte de Virginia, EE.UU.",
      tag: "Recomendada",
    },
    {
      code: "us-east-2",
      name: "US East (Ohio)",
      location: "Columbus, Ohio, EE.UU.",
    },
    {
      code: "us-west-2",
      name: "US West (Oregon)",
      location: "Oregón, EE.UU.",
    },
    {
      code: "sa-east-1",
      name: "South America (São Paulo)",
      location: "São Paulo, Brasil",
    },
    {
      code: "eu-west-1",
      name: "Europe (Ireland)",
      location: "Dublín, Irlanda",
    },
  ],
  azure: [
    {
      code: "spaincentral",
      name: "Spain Central (Madrid)",
      location: "Madrid, España",
      tag: "Recomendada",
    },
    {
      code: "canadacentral",
      name: "Canada Central (Toronto)",
      location: "Toronto, Canadá",
    },
    {
      code: "brazilsouth",
      name: "Brazil South (São Paulo)",
      location: "São Paulo, Brasil",
    },
    {
      code: "francecentral",
      name: "France Central (París)",
      location: "París, Francia",
    },
    {
      code: "southafricanorth",
      name: "South Africa North (Johannesburgo)",
      location: "Johannesburgo, Sudáfrica",
    },
  ],
};

export default function CrearTenantPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("Instituto San Marcos");
  const [id, setId] = useState("san-marcos");
  const [adminEmail, setAdminEmail] = useState("admin@sanmarcos.edu");
  const [cloudProvider, setCloudProvider] = useState<"aws" | "azure">("aws");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState<"prod" | "staging" | "dev">("prod");
  const [planId, setPlanId] = useState<"basico" | "estandar" | "avanzado">("estandar");
  const [iacEngine, setIacEngine] = useState<"terraform" | "opentofu" | "cloudformation" | "pulumi">("terraform");

  // Step 2 Configuration State
  const [adminUser] = useState("admin_tenant");
  const [adminPassword, setAdminPassword] = useState("AdminTenant2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [sshKeyName, setSshKeyName] = useState("iac-asistencia");
  const [allowedCidr, setAllowedCidr] = useState("0.0.0.0/0");

  const handleProviderChange = (newProvider: "aws" | "azure") => {
    setCloudProvider(newProvider);
    if (newProvider === "aws") {
      setRegion("us-east-1");
    } else {
      setRegion("spaincentral");
    }
  };

  // Auto-slug generation from name
  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setId(slug || "tenant");
  };

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pass);
  };

  const handleDeploy = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name,
        id,
        adminEmail,
        region,
        environment,
        planId,
        cloudProvider,
        iacEngine,
        adminUser,
        adminPassword,
        sshKeyName,
        allowedCidr,
      };

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Error iniciando el despliegue");
        setSubmitting(false);
        return;
      }

      // Redirigir a la consola en tiempo real
      router.push(`/tenants/${id}/consola`);
    } catch {
      setErrorMsg("Error de conexión al orquestador");
      setSubmitting(false);
    }
  };

  const plans = [
    {
      id: "basico",
      title: "Básico",
      subtitle: "Para instituciones pequeñas",
      students: "Hasta 100 estudiantes",
      db: "Base de datos: 10 GB",
      awsSku: "t3.micro (2 vCPU, 1 GB RAM)",
      azureSku: "Standard_B1s (1 vCPU, 1 GB RAM)",
    },
    {
      id: "estandar",
      title: "Estándar",
      subtitle: "Para instituciones en crecimiento",
      students: "Hasta 1.000 estudiantes",
      db: "Base de datos: 50 GB",
      awsSku: "t3.small (2 vCPU, 2 GB RAM)",
      azureSku: "Standard_B2s_v2 (2 vCPU, 4 GB RAM)",
    },
    {
      id: "avanzado",
      title: "Avanzado",
      subtitle: "Para alta demanda",
      students: "Hasta 5,000 estudiantes",
      db: "Base de datos: 200 GB",
      awsSku: "c7i-flex.large (2 vCPU, 4 GB RAM)",
      azureSku: "Standard_B4s_v2 (4 vCPU, 8 GB RAM)",
    },
  ];

  const getRegionLabel = (code: string, provider: "aws" | "azure") => {
    const list = CLOUD_REGIONS[provider] || [];
    const found = list.find((r) => r.code === code);
    if (found) {
      return `${found.name} (${found.code})`;
    }
    return code;
  };

  const getEnvironmentLabel = (env: string) => {
    if (env === "prod") return "Producción";
    if (env === "staging") return "Staging";
    return "Desarrollo";
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Crear tenant
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configura una nueva institución y prepara su entorno de registro de notas.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="mt-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Paso {currentStep} de 3
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs font-semibold">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep === 1
                ? "text-brand-600 font-bold"
                : currentStep > 1
                ? "text-slate-800"
                : "text-slate-400"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 1
                  ? "bg-brand-600 text-white"
                  : currentStep > 1
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <span>Datos y plan</span>
          </div>

          <span className="h-0.5 w-12 bg-slate-200" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep === 2
                ? "text-brand-600 font-bold"
                : currentStep > 2
                ? "text-slate-800"
                : "text-slate-400"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 2
                  ? "bg-brand-600 text-white"
                  : currentStep > 2
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </span>
            <span>Configuración</span>
          </div>

          <span className="h-0.5 w-12 bg-slate-200" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep === 3
                ? "text-brand-600 font-bold"
                : "text-slate-400"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 3
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </span>
            <span>Revisión</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Sticky Summary Right */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* ===================== PASO 1 ===================== */}
          {currentStep === 1 && (
            <>
              {/* Sección 1: Datos de la Institución */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Datos de la institución
                </h2>
                <p className="text-xs text-slate-500">
                  Identifica al tenant y configura su primer entorno.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Nombre de la institución <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Instituto San Marcos"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Identificador del tenant <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5 flex items-center">
                      <input
                        type="text"
                        required
                        value={id}
                        onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="san-marcos"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2 pr-28 text-sm font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="pointer-events-none absolute right-3 text-xs text-slate-400">
                        .escuelas.app
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Correo del administrador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@sanmarcos.edu"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Proveedor Cloud <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cloudProvider}
                      onChange={(e) => handleProviderChange(e.target.value as "aws" | "azure")}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm font-semibold text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {CLOUD_PROVIDERS.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Región ({cloudProvider.toUpperCase()}) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {CLOUD_REGIONS[cloudProvider].map((reg) => (
                        <option key={reg.code} value={reg.code}>
                          {reg.name} {reg.tag ? `★ [${reg.tag}]` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Entorno <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as "prod" | "staging" | "dev")}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="prod">Producción</option>
                      <option value="staging">Staging</option>
                      <option value="dev">Desarrollo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Selecciona un Plan */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Selecciona un plan
                </h2>
                <p className="text-xs text-slate-500">
                  El plan define la capacidad y los límites iniciales del tenant.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {plans.map((p) => {
                    const isSelected = planId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPlanId(p.id as "basico" | "estandar" | "avanzado")}
                        className={`relative cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-brand-600 bg-blue-50/30 ring-2 ring-brand-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Seleccionado
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{p.subtitle}</p>

                        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {p.students}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {p.db}
                          </p>
                          <p className="flex items-center gap-1.5 font-mono text-[10px] text-brand-700 bg-brand-50/70 px-1.5 py-0.5 rounded">
                            <Server className="h-3 w-3 shrink-0 text-brand-600" />
                            {cloudProvider === "aws" ? p.awsSku : p.azureSku}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sección 3: Motor de Infraestructura */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Motor de infraestructura
                </h2>
                <p className="text-xs text-slate-500">
                  Elige la herramienta que aprovisionará los recursos de este tenant.
                </p>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Base de datos aislada por institución</span>
                  </div>

                  <div className="w-full sm:w-64">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Motor de IaC
                    </label>
                    <select
                      value={iacEngine}
                      onChange={(e) =>
                        setIacEngine(
                          e.target.value as "terraform" | "opentofu" | "cloudformation" | "pulumi"
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm font-semibold text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="terraform">Terraform</option>
                      <option value="opentofu">OpenTofu</option>
                      <option value="cloudformation">CloudFormation</option>
                      <option value="pulumi">Pulumi</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===================== PASO 2 ===================== */}
          {currentStep === 2 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Configuración de Seguridad y Red
                </h2>
                <p className="text-xs text-slate-500">
                  Credenciales iniciales y parámetros de acceso remoto.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Usuario Administrador del Tenant
                  </label>
                  <input
                    type="text"
                    disabled
                    value={adminUser}
                    className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-600"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Usuario predeterminado con rol ADMIN del workload.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Contraseña Inicial del Tenant
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2 pr-20 text-sm font-mono text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="rounded p-1 text-slate-400 hover:text-slate-600"
                        title={showPassword ? "Ocultar" : "Mostrar"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={generateSecurePassword}
                        className="rounded p-1 text-brand-600 hover:text-brand-700"
                        title="Generar contraseña segura"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Se sanitizará automáticamente en los registros de consola.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Par de Llaves SSH (KeyPair)
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="absolute left-3 text-slate-400">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={sshKeyName}
                      onChange={(e) => setSshKeyName(e.target.value)}
                      placeholder="iac-asistencia"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-sm text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Nombre del KeyPair registrado en tu cuenta de AWS/Azure.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Restricción CIDR para Bastion SSH
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      value={allowedCidr}
                      onChange={(e) => setAllowedCidr(e.target.value)}
                      placeholder="0.0.0.0/0"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm font-mono text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAllowedCidr("0.0.0.0/0")}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Cualquiera
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Rango IP autorizado para ingresar por SSH al frontend.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== PASO 3 ===================== */}
          {currentStep === 3 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Revisión Final y Lanzamiento
                </h2>
                <p className="text-xs text-slate-500">
                  Confirma los parámetros antes de iniciar el aprovisionamiento.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg bg-slate-50 p-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500">Institución:</span>
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Slug / Subdominio:</span>
                  <p className="text-sm font-mono font-bold text-brand-600">{id}.escuelas.app</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Plan Seleccionado:</span>
                  <p className="text-sm font-bold capitalize text-slate-900">{planId}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Proveedor Cloud:</span>
                  <p className="text-sm font-bold text-slate-900">
                    {cloudProvider === "aws" ? "Amazon Web Services (AWS)" : "Microsoft Azure (Azure)"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Región de Despliegue:</span>
                  <p className="text-sm font-bold text-slate-900">{getRegionLabel(region, cloudProvider)}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Motor de IaC:</span>
                  <p className="text-sm font-bold capitalize text-slate-900">{iacEngine}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Entorno:</span>
                  <p className="text-sm font-bold text-slate-900">{getEnvironmentLabel(environment)}</p>
                </div>
              </div>

              {/* Fases a ejecutar */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Acciones que ejecutará el Orquestador
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-brand-600" />
                    <span>Aprovisionará 3 máquinas virtuales dedicadas (Frontend, Backend, Database) en subredes aisladas.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-brand-600" />
                    <span>Inicializará PostgreSQL 16 y ejecutará migraciones de esquema con usuario de aplicación independiente.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Ejecutará Ansible (`site.yml`) vía Docker y validará que el endpoint HTTP `/health` responda 200 OK.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <span className="text-xs text-slate-500">
              Los recursos se crean según el plan seleccionado.
            </span>
            <div className="flex items-center gap-3">
              {currentStep === 1 ? (
                <Link
                  href="/tenants"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancelar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-500"
                >
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDeploy}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Iniciando Orquestador...
                    </>
                  ) : (
                    <>
                      Aprovisionar y Desplegar Tenant
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Card (Exact Match to Mockup) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Resumen del tenant
            </h3>
            <p className="text-xs text-slate-400">
              Se aprovisionará al confirmar.
            </p>

            {/* Institution Card Box */}
            <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Institución
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {name || "Nombre Institución"}
              </p>
              <p className="text-xs font-medium text-slate-400">
                {id ? `${id}.escuelas.app` : "slug.escuelas.app"}
              </p>
            </div>

            {/* Plan Info */}
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <span className="text-slate-500">Plan seleccionado</span>
              <span className="font-bold capitalize text-slate-900">{planId}</span>
            </div>

            {/* Included Resources */}
            <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-xs">
              <span className="font-semibold text-slate-700">Recursos incluidos</span>
              <ul className="mt-2 space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Frontend y API
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Base de datos aislada
                </li>
              </ul>
            </div>

            {/* Aislamiento y seguridad check */}
            <div className="mt-4 rounded-lg bg-emerald-50/60 p-3">
              <div className="flex items-start gap-2 text-xs font-medium text-emerald-800">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Los datos de este tenant quedan separados de otras instituciones.
                </span>
              </div>
            </div>

            {/* Proveedor, Entorno y Región */}
            <div className="mt-4 space-y-1.5 border-b border-slate-100 pb-3 text-xs">
              <span className="font-semibold text-slate-700">Nube y Región</span>
              <div className="flex items-center justify-between text-slate-600">
                <span>Proveedor</span>
                <span className="font-bold uppercase text-slate-900">{cloudProvider}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Región</span>
                <span className="font-medium text-slate-900">{getRegionLabel(region, cloudProvider)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Entorno</span>
                <span className="font-medium text-slate-900">{getEnvironmentLabel(environment)}</span>
              </div>
            </div>

            {/* Warning Box */}
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <p>
                  La creación puede tardar varios minutos. Podrás seguir el progreso desde Tenants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
