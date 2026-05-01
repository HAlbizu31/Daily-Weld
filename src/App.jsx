import React, { useState, useEffect } from "react";
import { Plus, Users, FileText, BarChart3, Trash2, CheckCircle2, XCircle, X, Search, Wrench, ClipboardList, Calendar, AlertCircle, Edit2, LogOut, Shield, HardHat, Eye, LogIn, Menu, BookOpen, ShieldCheck, Thermometer, FileCheck, AlertTriangle, ChevronRight, ChevronDown, Award, Layers, Droplet, Sparkles, Link2, TrendingUp, Activity, PieChart as PieChartIcon, Upload, FileImage, MousePointer2, GitBranch, ZoomIn, ZoomOut, Move, Save, Download, ArrowUpRight, Circle, Type, Pencil, Highlighter, Minus, Square, Undo2, Palette } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STORAGE_KEY = "weld_app_v4";

const initialData = {
  users: [
    { id: "u1", username: "admin", password: "admin", role: "admin", name: "Administrator" },
    { id: "u2", username: "qc", password: "qc", role: "qc", name: "QC Inspector" },
  ],
  welders: [], isos: [], dailyLogs: [], inspections: [], tools: [], systems: [],
};

const inputCls = "w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";
const selectCls = "w-full bg-white border border-slate-300 text-sm px-2 py-1.5 rounded focus:border-blue-600 focus:outline-none";
const btnPrimary = "bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-colors rounded shadow-sm";
const btnPrimaryFull = "w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 text-xs tracking-widest mt-2 rounded transition-colors shadow-sm";

function Logo({ size = "md" }) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", tag: "text-[7px]" },
    md: { icon: 38, text: "text-2xl", tag: "text-[8px]" },
    lg: { icon: 56, text: "text-4xl", tag: "text-[10px]" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      {/* Icono: tubo sanitario con weld point + check verde */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" className="flex-shrink-0">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        {/* Tubería horizontal */}
        <rect x="5" y="42" width="90" height="20" fill="url(#logoGrad)" rx="3" />
        {/* Junta de soldadura (weld point) - círculo blanco con borde azul */}
        <circle cx="50" cy="52" r="18" fill="white" stroke="url(#logoGrad)" strokeWidth="4" />
        {/* Check verde de calidad */}
        <path d="M 42 52 L 48 58 L 60 46" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="leading-tight">
        <div className={`${s.text} font-black text-blue-900 tracking-tight`}>
          SWCS
        </div>
        {size !== "sm" && (
          <div className={`${s.tag} text-slate-500 tracking-[0.2em] font-semibold uppercase`}>Sanitary Weld Control System</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-600 tracking-wider font-semibold block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-slate-500 tracking-widest text-[10px] font-bold">{label}</div>
      <div className="text-slate-800 font-mono mt-0.5 font-medium">{value || "—"}</div>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-t-lg sm:rounded-lg w-full sm:max-w-md max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold tracking-widest text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
      <Icon size={32} className="mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

function Card({ title, subtitle, children, noPadding }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {(title || subtitle) && (
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          {title && <h3 className="text-sm font-bold tracking-widest text-slate-700">{title}</h3>}
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  const colors = {
    emerald: { border: "border-emerald-200", bg: "bg-emerald-50/50", labelClr: "text-emerald-700", valClr: "text-emerald-700", subClr: "text-emerald-600" },
    red: { border: "border-red-200", bg: "bg-red-50/50", labelClr: "text-red-700", valClr: "text-red-700", subClr: "text-red-600" },
    blue: { border: "border-blue-200", bg: "bg-blue-50/50", labelClr: "text-blue-700", valClr: "text-blue-700", subClr: "text-blue-600" },
    amber: { border: "border-amber-200", bg: "bg-amber-50/50", labelClr: "text-amber-700", valClr: "text-amber-700", subClr: "text-amber-600" },
  };
  const c = color ? colors[color] : null;
  return (
    <div className={`bg-white border ${c ? c.border : "border-slate-200"} ${c ? c.bg : ""} rounded-lg p-4 shadow-sm`}>
      <div className={`text-xs ${c ? c.labelClr : "text-slate-600"} tracking-widest mb-2 font-bold`}>{label}</div>
      <div className={`text-3xl font-black ${c ? c.valClr : "text-slate-900"}`}>{value}</div>
      {sub && <div className={`text-xs ${c ? c.subClr : "text-slate-500"} mt-1`}>{sub}</div>}
    </div>
  );
}

function LoginScreen({ users, welders, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password);
    if (user) return onLogin(user);
    const welder = welders.find((w) => w.welderId.toLowerCase() === username.toLowerCase().trim() && w.password === password);
    if (welder) return onLogin({ ...welder, role: "welder", username: welder.welderId });
    setError("Invalid username or password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block"><Logo size="lg" /></div>
          <p className="text-xs text-slate-500 tracking-[0.25em] mt-4 font-semibold">SAFE · HIGH QUALITY · ON-TIME</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-xl rounded-lg p-6 space-y-4">
          <h2 className="text-slate-800 font-bold text-sm tracking-widest border-b border-slate-100 pb-3">SIGN IN</h2>
          <div>
            <label className="text-xs text-slate-600 font-semibold tracking-wider block mb-1.5">USUARIO</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className={inputCls} placeholder="admin / qc / welder ID" autoFocus />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-semibold tracking-wider block mb-1.5">CONTRASEÑA</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className={inputCls} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
          <button onClick={submit} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 text-xs tracking-widest rounded flex items-center justify-center gap-2 transition-colors shadow-md">
            <LogIn size={14} /> LOG IN
          </button>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded text-xs text-slate-600">
          <div className="text-blue-700 tracking-widest mb-2 font-bold">DEMO CREDENTIALS:</div>
          <div className="space-y-0.5">
            <div>Admin → <span className="text-slate-900 font-semibold">admin</span> / <span className="text-slate-900 font-semibold">admin</span></div>
            <div>QC → <span className="text-slate-900 font-semibold">qc</span> / <span className="text-slate-900 font-semibold">qc</span></div>
            <div className="text-slate-500 italic mt-1">Welders: admin creates them with their login</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodesView() {
  const [activeSection, setActiveSection] = useState("welding");

  const codes = [
    { code: "ASME B31.3", chapter: "Chapter X", title: "High Purity Piping", year: "2024" },
    { code: "ASME BPE", chapter: "—", title: "Bioprocessing Equipment", year: "2022" },
    { code: "3-A SSI", chapter: "—", title: "Sanitary Standards", year: "Current" },
    { code: "FDA 21 CFR", chapter: "Part 177", title: "Food Contact", year: "Current" },
  ];

  const sections = [
    {
      id: "welding",
      title: "Soldadura Orbital",
      ref: "U328 — Welding",
      icon: Wrench,
      color: "blue",
      summary: "GTAW orbital autógena es el proceso obligatorio para tubería sanitaria.",
      points: [
        { label: "Proceso requerido", value: "GTAW Orbital Autógena (sin filler)" },
        { label: "Excepciones manuales", value: "Solo tack welds o donde la cabeza orbital no aplique (con aprobación del owner)" },
        { label: "Gas de purga (back-purge)", value: "Argón 99.999% mín. — cambio de tipo requiere requalificación WPS" },
        { label: "Tack welds", value: "Deben consumirse completamente al soldar el pase final" },
        { label: "WPS / WPQ", value: "Calificados conforme a ASME Sec. IX + criterios de ASME BPE" },
      ],
    },
    {
      id: "coupons",
      title: "Weld Coupons",
      ref: "U328.4.4 / U344.8",
      icon: FileCheck,
      color: "indigo",
      summary: "Cupones de prueba obligatorios al inicio de cada turno y tras cualquier cambio.",
      points: [
        { label: "Frecuencia mínima", value: "Al inicio de cada turno (start-of-shift)" },
        { label: "Cambio de gas de purga", value: "Requiere nuevo cupón antes de producir" },
        { label: "Cambio de power supply", value: "Requiere nuevo cupón" },
        { label: "Cambio de electrodo de tungsteno", value: "Requiere nuevo cupón" },
        { label: "Cambio de O.D. o espesor", value: "Requiere nuevo cupón" },
        { label: "Cambio de operador", value: "Cada operador debe tener su cupón representativo" },
      ],
    },
    {
      id: "joints",
      title: "Juntas Sanitarias",
      ref: "U335.7 / U335.8",
      icon: Link2,
      color: "cyan",
      summary: "Tri-Clamp, face seal y hygienic clamp joints para conexiones desmontables.",
      points: [
        { label: "Hygienic Clamp (Tri-Clamp)", value: "Ferrules Tipo A (¼\"–1\") y Tipo B (≥1\") según ASME BPE" },
        { label: "Tipos de clamp", value: "Two-piece single/double pin, three-piece, two-bolt heavy duty" },
        { label: "Metal Face Seal", value: "Permitido — instalación según fabricante (gland + gasket metálico)" },
        { label: "Compression fittings", value: "Permitidos solo si stress intensity factor ≤ 1.5" },
        { label: "Threaded joints", value: "Evitar siempre que sea posible (U314)" },
        { label: "Brazing / Soldering", value: "❌ NO permitido en High Purity (U333)" },
      ],
    },
    {
      id: "materials",
      title: "Materiales & Acabado",
      ref: "U323 / ASME BPE Part SF",
      icon: Layers,
      color: "violet",
      summary: "Aceros inoxidables austeníticos con acabado interior controlado.",
      points: [
        { label: "Materiales típicos", value: "316L (UNS S31603), 304L, dúplex, aleaciones de níquel" },
        { label: "Carbono máximo", value: "0.030% (grado L) para evitar sensibilización por soldadura" },
        { label: "Acabado SF1 mecánico", value: "Ra ≤ 0.51 μm (20 μin) — superficie en contacto con producto" },
        { label: "Acabado SF4 electropulido", value: "Ra ≤ 0.38 μm (15 μin) — productos farmacéuticos críticos" },
        { label: "Pasivación", value: "Requerida post-fabricación (ácido cítrico o nítrico)" },
        { label: "Trazabilidad MTR", value: "Heat number en cada componente (tubería, fittings, válvulas)" },
      ],
    },
    {
      id: "preparation",
      title: "Preparación de Bordes",
      ref: "U328.4.2",
      icon: Sparkles,
      color: "orange",
      summary: "Preparación de extremos según espesor y tipo de soldadura orbital.",
      points: [
        { label: "Pared ≤ 3.18 mm (0.125\")", value: "Square cut según ASME BPE / SEMI" },
        { label: "Pared 4.76 – 22.22 mm", value: "Bisel \"J\" o modificado conforme ASME B16.25" },
        { label: "Land thickness", value: "1.5 mm (1/16\") — extensión ≥ land" },
        { label: "Root opening", value: "0 a 0.8 mm (0 a 1/32\")" },
        { label: "Alineación interna", value: "Hi-lo dentro de tolerancia ASME BPE (típ. ≤ 15% espesor)" },
        { label: "Limpieza pre-soldadura", value: "Solvente sin residuos, libre de aceites y marcas" },
      ],
    },
    {
      id: "examination",
      title: "Examinación",
      ref: "U341 / U344",
      icon: Eye,
      color: "emerald",
      summary: "Inspección visual interna con borescopio + cupones documentados.",
      points: [
        { label: "Visual externa (VT)", value: "100% de soldaduras — color, perfil, alineación" },
        { label: "Borescopia interna", value: "Aceptable y recomendada (U344.2) — penetración y decoloración" },
        { label: "Cupones de producción", value: "Sustituyen al 5% RT cuando se usa orbital GTAW" },
        { label: "Color/oxidación interna", value: "Según ASME BPE Tabla MJ-8.4 (typically AWS D18.1/D18.2)" },
        { label: "Defectos no permitidos", value: "Concavidad excesiva, falta de fusión, óxido suelto, grieta" },
        { label: "Examinador", value: "Independiente del soldador (U342.2) — calificado SNT-TC-1A" },
      ],
    },
    {
      id: "documentation",
      title: "Documentación",
      ref: "ASME BPE Part GR",
      icon: ShieldCheck,
      color: "rose",
      summary: "Trazabilidad completa de cada soldadura y prueba para auditoría.",
      points: [
        { label: "Weld Map / ISO", value: "Cada soldadura numerada y asignada a su soldador" },
        { label: "Weld Log", value: "Fecha, turno, programa orbital, head, gas, lot del tubo" },
        { label: "Coupon Log", value: "Resultado de cada cupón con fotografía/borescopia" },
        { label: "Reporte de pasivación", value: "Método, concentración, tiempo, prueba de hierro libre" },
        { label: "MTRs", value: "Por cada heat de tubería, fitting y filler (si aplica)" },
        { label: "Turn-Over Package (TOP)", value: "Entrega final al owner con todo el legajo" },
      ],
    },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "bg-blue-100 text-blue-700", accent: "bg-blue-700", text: "text-blue-700" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "bg-indigo-100 text-indigo-700", accent: "bg-indigo-700", text: "text-indigo-700" },
    cyan: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "bg-cyan-100 text-cyan-700", accent: "bg-cyan-600", text: "text-cyan-700" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "bg-violet-100 text-violet-700", accent: "bg-violet-600", text: "text-violet-700" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "bg-orange-100 text-orange-700", accent: "bg-orange-600", text: "text-orange-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "bg-emerald-100 text-emerald-700", accent: "bg-emerald-600", text: "text-emerald-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", icon: "bg-rose-100 text-rose-700", accent: "bg-rose-600", text: "text-rose-700" },
  };

  const active = sections.find((s) => s.id === activeSection);
  const activeColors = colorMap[active.color];
  const ActiveIcon = active.icon;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">SANITARY WELDING CODES</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">REFERENCIA TÉCNICA · TUBERÍA DE ALTA PUREZA</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
                <Droplet className="w-8 h-8 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-cyan-500/20 text-cyan-200 rounded-full border border-cyan-400/30">High Purity Fluid Service</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">SANITARY PIPING</h1>
                <p className="text-xl sm:text-2xl font-light mt-2 text-cyan-100">Aplicaciones farmacéuticas, biotech y alimentos</p>
                <p className="text-sm text-slate-400 mt-1">Pharmaceutical · Biotech · Food &amp; Beverage · Cosmetics</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center gap-2 text-xs text-slate-300 justify-end">
                <Award className="w-4 h-4" />
                <span className="tracking-wider uppercase">ASME · 3-A · FDA Compliant</span>
              </div>
              <div className="text-xs text-slate-400">cGMP · Bioprocessing</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {codes.map((c) => (
              <div key={c.code} className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">{c.code}</div>
                <div className="text-sm font-bold text-white mt-0.5">{c.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{c.chapter} · {c.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const colors = colorMap[section.color];
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? `${colors.bg} ${colors.border} shadow-md scale-[1.02]`
                  : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isActive ? colors.icon : "bg-slate-100 text-slate-600"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? colors.text : "text-slate-500"}`}>
                {section.ref.split("—")[0].trim()}
              </div>
              <div className={`text-sm font-bold mt-1 ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                {section.title}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-200 ${activeColors.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeColors.icon} flex-shrink-0`}>
              <ActiveIcon className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-[10px] font-bold tracking-widest uppercase ${activeColors.text}`}>
                {active.ref}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{active.title}</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">{active.summary}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4">Requisitos Clave</div>
          <div className="space-y-2">
            {active.points.map((point, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <div className={`text-xs font-bold tracking-wider uppercase ${activeColors.text} sm:col-span-1`}>
                  {point.label}
                </div>
                <div className="text-sm text-slate-700 leading-relaxed sm:col-span-2">
                  {point.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900">
          <strong className="font-bold">Aviso de cumplimiento:</strong> Este resumen es una referencia operativa para tubería sanitaria/alta pureza. Toda calificación, soldadura, examinación y prueba debe ejecutarse conforme al texto íntegro de <strong>ASME B31.3-2024 Chapter X</strong>, <strong>ASME BPE</strong> y a las especificaciones del proyecto. En caso de discrepancia, prevalece el código y la spec del owner.
        </div>
      </div>
    </div>
  );
}

function AppShell({ data, setData, currentUser, logout, view, setView }) {
  const role = currentUser.role;
  const [menuOpen, setMenuOpen] = useState(false);

  const addWelder = (w) => setData((d) => ({ ...d, welders: [...d.welders, { ...w, id: Date.now().toString() }] }));
  const deleteWelder = (id) => { if (!confirm("Delete welder?")) return; setData((d) => ({ ...d, welders: d.welders.filter((w) => w.id !== id) })); };
  const addIso = (iso) => setData((d) => ({ ...d, isos: [...d.isos, { ...iso, id: Date.now().toString() }] }));
  const deleteIso = (id) => { if (!confirm("Delete ISO?")) return; setData((d) => ({ ...d, isos: d.isos.filter((i) => i.id !== id) })); };
  const assignIso = (isoId, welderId) => setData((d) => ({ ...d, isos: d.isos.map((i) => i.id === isoId ? { ...i, welderId } : i) }));
  const saveLog = (log) => setData((d) => log.id ? { ...d, dailyLogs: d.dailyLogs.map((l) => l.id === log.id ? log : l) } : { ...d, dailyLogs: [...d.dailyLogs, { ...log, id: Date.now().toString(), entries: [] }] });
  const deleteLog = (id) => { if (!confirm("Delete daily log and its welds?")) return; setData((d) => ({ ...d, dailyLogs: d.dailyLogs.filter((l) => l.id !== id) })); };
  const addEntry = (logId, entry) => setData((d) => ({ ...d, dailyLogs: d.dailyLogs.map((l) => l.id === logId ? { ...l, entries: [...l.entries, { ...entry, id: Date.now().toString() }] } : l) }));
  const deleteEntry = (logId, entryId) => setData((d) => ({ ...d, dailyLogs: d.dailyLogs.map((l) => l.id === logId ? { ...l, entries: l.entries.filter((e) => e.id !== entryId) } : l) }));
  const updateEntry = (logId, entryId, fields) => setData((d) => ({ ...d, dailyLogs: d.dailyLogs.map((l) => l.id === logId ? { ...l, entries: l.entries.map((e) => e.id === entryId ? { ...e, ...fields } : e) } : l) }));
  const addTool = (t) => setData((d) => ({ ...d, tools: [...d.tools, { ...t, id: Date.now().toString() }] }));
  const deleteTool = (id) => { if (!confirm("Delete tool?")) return; setData((d) => ({ ...d, tools: d.tools.filter((t) => t.id !== id) })); };
  const reassignTool = (id, welderId) => setData((d) => ({ ...d, tools: d.tools.map((t) => t.id === id ? { ...t, welderId } : t) }));
  const addInspection = (i) => setData((d) => ({ ...d, inspections: [...d.inspections, { ...i, id: Date.now().toString() }] }));
  const deleteInspection = (id) => { if (!confirm("Delete inspection?")) return; setData((d) => ({ ...d, inspections: d.inspections.filter((i) => i.id !== id) })); };
  const addSystem = (name) => setData((d) => ({ ...d, systems: [...(d.systems || []), { id: Date.now().toString(), name: name.trim().toUpperCase() }] }));
  const deleteSystem = (id) => { if (!confirm("Delete system? Los ISOs con este sistema quedarán sin clasificar.")) return; setData((d) => ({ ...d, systems: (d.systems || []).filter((s) => s.id !== id) })); };
  const updateIso = (isoId, fields) => setData((d) => ({ ...d, isos: d.isos.map((i) => i.id === isoId ? { ...i, ...fields } : i) }));

  const myWelderId = role === "welder" ? currentUser.id : null;
  const visibleLogs = role === "welder" ? data.dailyLogs.filter((l) => l.welderId === myWelderId) : data.dailyLogs;
  const getEntryRef = (logId, entryId) => `${logId}-${entryId}`;

  const getWelderStats = (welderId) => {
    const allEntries = data.dailyLogs.filter((l) => l.welderId === welderId).flatMap((l) => l.entries.map((e) => ({ ...e, weldRef: getEntryRef(l.id, e.id) })));
    const total = allEntries.length;
    const accepted = allEntries.filter((e) => data.inspections.find((i) => i.weldRef === e.weldRef && i.status === "accepted")).length;
    const rejected = allEntries.filter((e) => data.inspections.find((i) => i.weldRef === e.weldRef && i.status === "rejected")).length;
    return { total, accepted, rejected, pending: total - accepted - rejected,
      acceptRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0",
      rejectRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0" };
  };

  const totalStats = () => {
    const allEntries = visibleLogs.flatMap((l) => l.entries.map((e) => getEntryRef(l.id, e.id)));
    const total = allEntries.length;
    const accepted = data.inspections.filter((i) => allEntries.includes(i.weldRef) && i.status === "accepted").length;
    const rejected = data.inspections.filter((i) => allEntries.includes(i.weldRef) && i.status === "rejected").length;
    return { total, accepted, rejected, pending: total - accepted - rejected,
      acceptRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0",
      rejectRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0" };
  };

  // === QC Notifications: count pending welds (without inspection yet) ===
  const allEntriesGlobal = data.dailyLogs.flatMap((l) => l.entries.map((e) => ({ ref: getEntryRef(l.id, e.id) })));
  const pendingCount = allEntriesGlobal.filter((e) => !data.inspections.find((i) => i.weldRef === e.ref)).length;
  const [prevPendingCount, setPrevPendingCount] = useState(pendingCount);

  useEffect(() => {
    if (role === "qc" && pendingCount > prevPendingCount) {
      // Play notification sound (beep)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
    }
    setPrevPendingCount(pendingCount);
  }, [pendingCount, role]);

  const tabs = role === "admin" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "welders", icon: Users, label: "WELDERS" },
    { id: "isos", icon: FileText, label: "ISOS" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: Eye, label: "QC" },
    { id: "tools", icon: Wrench, label: "TOOLS" },
    { id: "charts", icon: TrendingUp, label: "CHARTS" },
    { id: "codes", icon: BookOpen, label: "CODES" },
  ] : role === "qc" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: CheckCircle2, label: "INSPECT" },
    { id: "codes", icon: BookOpen, label: "CODES" },
  ] : [
    { id: "dashboard", icon: BarChart3, label: "MY DASHBOARD" },
    { id: "logs", icon: ClipboardList, label: "MY DAILY LOGS" },
    { id: "tools", icon: Wrench, label: "MY TOOLS" },
    { id: "codes", icon: BookOpen, label: "CODES" },
  ];

  const stats = totalStats();
  const RoleIcon = role === "admin" ? Shield : role === "qc" ? Eye : HardHat;
  const roleColors = role === "admin" ? "border-blue-200 bg-blue-50 text-blue-700" : role === "qc" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const roleLabel = role === "admin" ? "ADMIN" : role === "qc" ? "QC" : "WELDER";
  const currentTab = tabs.find((t) => t.id === view);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded ${roleColors}`}>
              <RoleIcon size={12} />
              <div className="text-right">
                <div className="text-[10px] tracking-widest font-bold">{roleLabel}</div>
                <div className="text-[10px] truncate max-w-[100px] opacity-80">{currentUser.name}</div>
              </div>
            </div>
            <div className={`sm:hidden flex items-center gap-1.5 px-2 py-1 border rounded ${roleColors}`}>
              <RoleIcon size={12} />
              <span className="text-[10px] tracking-widest font-bold">{roleLabel}</span>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors" title="Salir">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile: dropdown menu */}
        <div className="sm:hidden border-t border-slate-100 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              {currentTab && <currentTab.icon size={16} className="text-blue-700" />}
              <span className="text-sm font-bold tracking-widest text-blue-700">{currentTab?.label || "MENU"}</span>
            </div>
            <Menu size={18} className="text-slate-500" />
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = view === t.id;
                const showBadge = role === "qc" && t.id === "inspections" && pendingCount > 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setView(t.id); setMenuOpen(false); }}
                    className={`w-full px-4 py-3 text-left text-sm font-bold tracking-widest flex items-center gap-3 transition-colors ${
                      active ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700" : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                    {showBadge && <span className="ml-auto bg-red-600 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center animate-pulse">{pendingCount}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop: tabs horizontales */}
        <nav className="hidden sm:flex max-w-7xl mx-auto px-6 gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            const showBadge = role === "qc" && t.id === "inspections" && pendingCount > 0;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`px-4 py-3 text-xs font-bold tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap relative ${
                  active ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Icon size={14} />
                {t.label}
                {showBadge && <span className="bg-red-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-pulse">{pendingCount}</span>}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {view === "dashboard" && <DashboardView role={role} stats={stats} data={data} visibleLogs={visibleLogs} getWelderStats={getWelderStats} currentUser={currentUser} />}
        {view === "welders" && role === "admin" && <WeldersView welders={data.welders} isos={data.isos} tools={data.tools} getStats={getWelderStats} onAdd={addWelder} onDelete={deleteWelder} />}
        {view === "isos" && role === "admin" && <IsosView isos={data.isos} welders={data.welders} systems={data.systems || []} onAdd={addIso} onDelete={deleteIso} onAssign={assignIso} onAddSystem={addSystem} onDeleteSystem={deleteSystem} onUpdateIso={updateIso} />}
        {view === "logs" && <LogsView role={role} currentUser={currentUser} logs={visibleLogs} welders={data.welders} isos={data.isos} inspections={data.inspections} onSaveLog={saveLog} onDeleteLog={deleteLog} onAddEntry={addEntry} onDeleteEntry={deleteEntry} onUpdateEntry={updateEntry} />}
        {view === "inspections" && (role === "admin" || role === "qc") && <InspectionsView role={role} logs={data.dailyLogs} welders={data.welders} inspections={data.inspections} onAdd={addInspection} onDelete={deleteInspection} />}
        {view === "tools" && <ToolsView role={role} currentUser={currentUser} tools={data.tools} welders={data.welders} onAdd={addTool} onDelete={deleteTool} onReassign={reassignTool} />}
        {view === "charts" && role === "admin" && <ChartsView data={data} getEntryRef={getEntryRef} />}
        {view === "codes" && <CodesView />}
      </main>
    </div>
  );
}
function DashboardView({ role, stats, data, visibleLogs, getWelderStats, currentUser }) {
  if (role === "welder") {
    const myStats = getWelderStats(currentUser.id);
    const myTools = data.tools.filter((t) => t.welderId === currentUser.id);
    const myIsos = data.isos.filter((i) => i.welderId === currentUser.id);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">MY DASHBOARD</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{currentUser.name.toUpperCase()} · #{currentUser.welderId}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="MIS WELDS" value={myStats.total} />
          <KPI label="ACCEPTED" value={myStats.accepted} sub={`${myStats.acceptRate}%`} color="emerald" />
          <KPI label="REJECTED" value={myStats.rejected} sub={`${myStats.rejectRate}%`} color="red" />
          <KPI label="PENDING" value={myStats.pending} sub="por inspeccionar" color="amber" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card title="ISOs EN MIS MANOS">
            {myIsos.length === 0 ? <div className="text-slate-400 text-sm">Sin ISOs assigned</div> : (
              <div className="flex flex-wrap gap-1.5">
                {myIsos.map((iso) => <span key={iso.id} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 font-mono rounded">{iso.number}</span>)}
              </div>
            )}
          </Card>
          <Card title="MY TOOLS">
            {myTools.length === 0 ? <div className="text-slate-400 text-sm">Sin herramientas assigned</div> : (
              <div className="space-y-1.5">
                {myTools.map((t) => (
                  <div key={t.id} className="flex justify-between text-xs border-b border-slate-100 pb-1">
                    <span className="text-slate-700 font-medium">{t.name}</span>
                    <span className="text-slate-500 font-mono">{t.serial}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">OVERVIEW</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">ESTADO ACTUAL DE OPERACIONES</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="WELDERS" value={data.welders.length} sub="active in plant" />
        <KPI label="ISOs ACTIVOS" value={`${data.isos.filter((i) => i.welderId).length}/${data.isos.length}`} sub="assigned / total" color="blue" />
        <KPI label="ACCEPTED" value={stats.accepted} sub={`${stats.acceptRate}% del total`} color="emerald" />
        <KPI label="REJECTED" value={stats.rejected} sub={`${stats.rejectRate}% del total`} color="red" />
      </div>
      <Card>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs text-slate-500 tracking-widest font-semibold">TOTAL DE WELDS</div>
            <div className="text-4xl font-black mt-1 text-slate-900">{stats.total}</div>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <div className="text-emerald-600 font-medium">● Accepteds: {stats.accepted}</div>
            <div className="text-red-600 font-medium">● Rejecteds: {stats.rejected}</div>
            <div className="text-amber-600 font-medium">● Sin inspeccionar: {stats.pending}</div>
          </div>
        </div>
        {stats.total > 0 && (
          <div className="flex h-3 overflow-hidden bg-slate-100 rounded">
            <div className="bg-emerald-500" style={{ width: `${(stats.accepted / stats.total) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
          </div>
        )}
      </Card>
      <Card title="WELDER PERFORMANCE" subtitle="% ACCEPTANCE" noPadding>
        {data.welders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No hay welderes registrados.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.welders.map((w) => ({ ...w, stats: getWelderStats(w.id) })).sort((a, b) => b.stats.total - a.stats.total).map((w) => (
              <div key={w.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{w.name}</div>
                    <div className="text-xs text-slate-500">#{w.welderId} · {w.stats.total} welds</div>
                  </div>
                  <div className={`text-2xl font-black ${parseFloat(w.stats.acceptRate) >= 90 ? "text-emerald-600" : parseFloat(w.stats.acceptRate) >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {w.stats.acceptRate}%
                  </div>
                </div>
                {w.stats.total > 0 && (
                  <div className="flex h-1.5 overflow-hidden bg-slate-100 rounded">
                    <div className="bg-emerald-500" style={{ width: `${(w.stats.accepted / w.stats.total) * 100}%` }} />
                    <div className="bg-red-500" style={{ width: `${(w.stats.rejected / w.stats.total) * 100}%` }} />
                    <div className="bg-amber-400" style={{ width: `${(w.stats.pending / w.stats.total) * 100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function WelderModal({ onClose, onSave, existing }) {
  const [name, setName] = useState("");
  const [welderId, setWelderId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!name.trim() || !welderId.trim() || !password.trim()) { setError("Completa todos los campos"); return; }
    if (existing.find((w) => w.welderId.toLowerCase() === welderId.trim().toLowerCase())) { setError("Ya existe un welder con ese ID"); return; }
    onSave({ name: name.trim(), welderId: welderId.trim().toUpperCase(), password: password.trim() });
    onClose();
  };

  return (
    <ModalShell title="NEW WELDER" onClose={onClose}>
      <Field label="FULL NAME"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoFocus /></Field>
      <Field label="WELDER ID"><input value={welderId} onChange={(e) => setWelderId(e.target.value)} className={inputCls} /></Field>
      <Field label="PASSWORD (FOR LOGIN)">
        <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="password" />
        <div className="text-[10px] text-slate-500 mt-1">Esta es la contraseña que usará el welder para entrar a la app.</div>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <button onClick={submit} className={btnPrimaryFull}>REGISTRAR</button>
    </ModalShell>
  );
}

function WeldersView({ welders, isos, tools, getStats, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">WELDERS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{welders.length} REGISTRADOS</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVO</button>
      </div>
      {welders.length === 0 ? <EmptyState icon={Users} text="No welders yet. Add the first one." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {welders.map((w) => {
            const ws = getStats(w.id);
            const wIsos = isos.filter((i) => i.welderId === w.id);
            const wTools = tools.filter((t) => t.welderId === w.id);
            return (
              <div key={w.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{w.name}</div>
                    <div className="text-xs text-blue-700 font-mono mt-1 font-semibold">#{w.welderId}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Login: <span className="text-slate-600">{w.welderId}</span> / pwd: <span className="text-slate-600">{w.password}</span></div>
                  </div>
                  <button onClick={() => onDelete(w.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
                <div className="p-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="text-slate-500 tracking-widest font-semibold">TOTAL</div><div className="text-lg font-black text-slate-900">{ws.total}</div></div>
                  <div><div className="text-emerald-600 tracking-widest font-semibold">OK</div><div className="text-lg font-black text-emerald-600">{ws.accepted}</div></div>
                  <div><div className="text-red-600 tracking-widest font-semibold">RX</div><div className="text-lg font-black text-red-600">{ws.rejected}</div></div>
                </div>
                <div className="px-4 pb-4 text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div>ISOs en mano: <span className="text-blue-700 font-bold">{wIsos.length}</span></div>
                  <div>Herramientas: <span className="text-slate-700 font-bold">{wTools.length}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && <WelderModal onClose={() => setShowModal(false)} onSave={onAdd} existing={welders} />}
    </div>
  );
}

function IsoModal({ onClose, onSave, welders, systems, editing }) {
  const [number, setNumber] = useState(editing?.number || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [welderId, setWelderId] = useState(editing?.welderId || "");
  const [systemId, setSystemId] = useState(editing?.systemId || "");
  const [size, setSize] = useState(editing?.size || "");
  const [page, setPage] = useState(editing?.page || "");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!number.trim()) { setError("ISO number is required"); return; }
    if (!systemId) { setError("Selecciona un sistema (HPUR, CIPR, etc.). Si no existe, créalo primero en GESTIONAR SISTEMAS."); return; }
    if (!size.trim()) { setError("Indica la medida del tubo (ej: 2\")"); return; }
    if (!page.toString().trim()) { setError("Indica el número de página"); return; }
    const sizeFormatted = size.trim().endsWith('"') ? size.trim() : size.trim() + '"';
    onSave({
      number: number.trim().toUpperCase(),
      description: description.trim(),
      welderId: welderId || null,
      systemId,
      size: sizeFormatted,
      page: parseInt(page) || 0,
    });
    onClose();
  };

  if (systems.length === 0) {
    return (
      <ModalShell title={editing ? "EDITAR ISO" : "NEW ISO"} onClose={onClose}>
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold mb-1">No hay sistemas creados</div>
            <div className="text-xs">Antes de crear un ISO, primero debes crear al menos un sistema (HPUR, CIPR, RO, etc.) usando el botón <strong>GESTIONAR SISTEMAS</strong>.</div>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors">CERRAR</button>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={editing ? "EDITAR ISO" : "NEW ISO"} onClose={onClose}>
      <Field label="ISO NUMBER">
        <input value={number} onChange={(e) => setNumber(e.target.value)} className={inputCls} autoFocus placeholder="2.00-HPUR-SS02-3456008-F4-34" />
      </Field>
      <Field label="DESCRIPCIÓN (OPCIONAL)">
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SISTEMA *">
          <select value={systemId} onChange={(e) => setSystemId(e.target.value)} className={selectCls}>
            <option value="">— Seleccionar —</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="MEDIDA TUBO *">
          <input value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} placeholder='2"' />
        </Field>
      </div>
      <Field label="NÚMERO DE PÁGINA *">
        <input type="number" value={page} onChange={(e) => setPage(e.target.value)} className={inputCls} placeholder="34" min="1" />
      </Field>
      <Field label="ASIGNAR A WELDER (OPCIONAL)">
        <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls}>
          <option value="">— Sin asignar —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <button onClick={submit} className={btnPrimaryFull}>{editing ? "GUARDAR CAMBIOS" : "REGISTRAR"}</button>
    </ModalShell>
  );
}

function SystemsModal({ onClose, systems, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!name.trim()) { setError("Nombre requerido"); return; }
    if (systems.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("Ya existe un sistema con ese nombre");
      return;
    }
    onAdd(name);
    setName("");
  };

  return (
    <ModalShell title="GESTIONAR SISTEMAS" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-slate-600">
        Los sistemas (ej: <strong>HPUR</strong>, <strong>CIPR</strong>, <strong>RO</strong>, <strong>CIPS</strong>) varían por proyecto. Crea aquí los que necesites.
      </div>
      <Field label="NUEVO SISTEMA">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className={inputCls} placeholder="Ej: HPUR, CIPR, RO..." autoFocus />
          <button onClick={submit} className="bg-blue-700 hover:bg-blue-800 text-white px-4 text-xs font-bold tracking-widest rounded transition-colors flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <div>
        <div className="text-xs text-slate-600 tracking-wider font-semibold mb-2">SISTEMAS REGISTRADOS ({systems.length})</div>
        {systems.length === 0 ? (
          <div className="text-slate-400 text-sm italic text-center py-4">Aún no has creado sistemas.</div>
        ) : (
          <div className="space-y-1.5">
            {systems.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2">
                <div className="font-mono font-bold text-blue-700 text-sm">{s.name}</div>
                <button onClick={() => onDelete(s.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors">CERRAR</button>
    </ModalShell>
  );
}

function IsosView({ isos, welders, systems, onAdd, onDelete, onAssign, onAddSystem, onDeleteSystem, onUpdateIso }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSystemsModal, setShowSystemsModal] = useState(false);
  const [editingIso, setEditingIso] = useState(null);
  const [viewingIso, setViewingIso] = useState(null);
  const [expandedWelders, setExpandedWelders] = useState({});
  const [expandedSystems, setExpandedSystems] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  const toggleWelder = (id) => setExpandedWelders((p) => ({ ...p, [id]: !p[id] }));
  const toggleSystem = (key) => setExpandedSystems((p) => ({ ...p, [key]: !p[key] }));
  const toggleSize = (key) => setExpandedSizes((p) => ({ ...p, [key]: !p[key] }));

  const getSystemName = (id) => systems.find((s) => s.id === id)?.name || "—";

  // Filter isos by search (number or description)
  const filteredIsos = isos.filter((i) =>
    i.number.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered isos by welder (assigned)
  const groupedIsos = welders.map((w) => ({
    welder: w,
    isos: filteredIsos.filter((i) => i.welderId === w.id),
  })).filter((g) => g.isos.length > 0);

  // Unassigned isos
  const unassignedIsos = filteredIsos.filter((i) => !i.welderId);

  // Build hierarchy: System -> Size -> ISOs (sorted by page)
  const isosWithSystem = unassignedIsos.filter((i) => i.systemId && i.size);
  const isosWithoutSystem = unassignedIsos.filter((i) => !i.systemId || !i.size);

  const systemGroups = {};
  isosWithSystem.forEach((iso) => {
    const sysName = getSystemName(iso.systemId);
    if (!systemGroups[sysName]) systemGroups[sysName] = {};
    if (!systemGroups[sysName][iso.size]) systemGroups[sysName][iso.size] = [];
    systemGroups[sysName][iso.size].push(iso);
  });

  // Sort sizes numerically and ISOs by page
  Object.keys(systemGroups).forEach((sys) => {
    Object.keys(systemGroups[sys]).forEach((size) => {
      systemGroups[sys][size].sort((a, b) => (a.page || 0) - (b.page || 0));
    });
  });

  const sortedSystemNames = Object.keys(systemGroups).sort();

  // Helper to parse size for sorting (e.g. "6\"" -> 6, "2.00\"" -> 2)
  const parseSize = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;

  const renderIsoTableRow = (iso, idx, isUnassignedSection = false) => (
    <tr key={iso.id} className="hover:bg-slate-50">
      <td className="px-5 py-3 font-mono text-blue-700 font-bold text-xs whitespace-nowrap">{iso.number}</td>
      {iso.page ? <td className="px-5 py-3 text-slate-600 text-xs font-mono whitespace-nowrap">P. {iso.page}</td> : <td className="px-5 py-3 text-slate-300 text-xs">—</td>}
      <td className="px-5 py-3 text-slate-600 text-xs hidden md:table-cell">{iso.description || "—"}</td>
      <td className="px-5 py-3">
        <select value={iso.welderId || ""} onChange={(e) => onAssign(iso.id, e.target.value || null)} className={selectCls + " max-w-[180px]"}>
          <option value="">— Sin asignar —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </td>
      <td className="px-5 py-3 text-right whitespace-nowrap">
        <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="Ver ISO"><FileImage size={14} /></button>
        <button onClick={() => setEditingIso(iso)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 mr-1" title="Editar"><Edit2 size={14} /></button>
        <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50" title="Borrar"><Trash2 size={14} /></button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">ISOMÉTRICOS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{isos.length} TOTAL · {isos.filter((i) => i.welderId).length} ASIGNADOS · {unassignedIsos.length} SIN ASIGNAR · {systems.length} SISTEMAS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSystemsModal(true)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-colors rounded shadow-sm">
            <Layers size={14} /> SISTEMAS
          </button>
          <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVO ISO</button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ISO..." className={inputCls + " pl-9"} />
      </div>

      {isos.length === 0 ? <EmptyState icon={FileText} text="No hay ISOs registrados." /> : filteredIsos.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 text-sm">
          No se encontraron ISOs con "{search}"
        </div>
      ) : (
        <div className="space-y-2">
          {/* WELDERS WITH ASSIGNED ISOs */}
          {groupedIsos.map(({ welder, isos: welderIsos }) => {
            const isExpanded = expandedWelders[welder.id];
            return (
              <div key={welder.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleWelder(welder.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <HardHat size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{welder.name}</div>
                      <div className="text-xs text-slate-500 font-mono">#{welder.welderId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {welderIsos.length} {welderIsos.length === 1 ? "ISO" : "ISOs"}
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                          <tr>
                            <th className="text-left px-5 py-2 font-bold">ISO</th>
                            <th className="text-left px-5 py-2 font-bold">PÁG.</th>
                            <th className="text-left px-5 py-2 font-bold hidden md:table-cell">DESCRIPCIÓN</th>
                            <th className="text-left px-5 py-2 font-bold">REASIGNAR</th>
                            <th className="px-5 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {welderIsos.map((iso, idx) => renderIsoTableRow(iso, idx))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* UNASSIGNED GROUP - HIERARCHICAL */}
          {unassignedIsos.length > 0 && (
            <div className="bg-white border-2 border-amber-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleWelder("__unassigned")}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-amber-900">SIN ASIGNAR</div>
                    <div className="text-xs text-amber-600">Clasificados por sistema · medida · página</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {unassignedIsos.length} {unassignedIsos.length === 1 ? "ISO" : "ISOs"}
                  </span>
                  {expandedWelders["__unassigned"] ? <ChevronDown size={18} className="text-amber-600" /> : <ChevronRight size={18} className="text-amber-600" />}
                </div>
              </button>

              {expandedWelders["__unassigned"] && (
                <div className="border-t border-amber-200 bg-amber-50/30 p-3 space-y-2">
                  {/* SYSTEMS */}
                  {sortedSystemNames.map((sysName) => {
                    const sysKey = `sys-${sysName}`;
                    const sysExpanded = expandedSystems[sysKey];
                    const sysSizes = Object.keys(systemGroups[sysName]).sort((a, b) => parseSize(a) - parseSize(b));
                    const sysCount = sysSizes.reduce((sum, sz) => sum + systemGroups[sysName][sz].length, 0);
                    return (
                      <div key={sysKey} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSystem(sysKey)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                              {sysName}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-slate-900 font-mono">{sysName}</div>
                              <div className="text-[10px] text-slate-500">Sistema</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              {sysCount} {sysCount === 1 ? "ISO" : "ISOs"}
                            </span>
                            {sysExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                          </div>
                        </button>

                        {sysExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 p-2 space-y-1.5">
                            {/* SIZES */}
                            {sysSizes.map((size) => {
                              const sizeKey = `${sysKey}-${size}`;
                              const sizeExpanded = expandedSizes[sizeKey];
                              const sizeIsos = systemGroups[sysName][size];
                              return (
                                <div key={sizeKey} className="bg-white border border-slate-200 rounded">
                                  <button
                                    onClick={() => toggleSize(sizeKey)}
                                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-[11px]">
                                        {size}
                                      </div>
                                      <div className="font-mono font-semibold text-slate-700 text-sm">{size}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                        {sizeIsos.length}
                                      </span>
                                      {sizeExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                    </div>
                                  </button>
                                  {sizeExpanded && (
                                    <div className="border-t border-slate-100">
                                      <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-[10px] tracking-widest text-slate-600">
                                          <tr>
                                            <th className="text-left px-3 py-1.5 font-bold">ISO</th>
                                            <th className="text-left px-3 py-1.5 font-bold">PÁG.</th>
                                            <th className="text-left px-3 py-1.5 font-bold hidden md:table-cell">DESC.</th>
                                            <th className="text-left px-3 py-1.5 font-bold">ASIGNAR A</th>
                                            <th className="px-3 py-1.5"></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {sizeIsos.map((iso) => (
                                            <tr key={iso.id} className="hover:bg-slate-50">
                                              <td className="px-3 py-2 font-mono text-blue-700 font-bold text-xs whitespace-nowrap">{iso.number}</td>
                                              <td className="px-3 py-2 text-slate-700 text-xs font-mono">P. {iso.page}</td>
                                              <td className="px-3 py-2 text-slate-600 text-xs hidden md:table-cell">{iso.description || "—"}</td>
                                              <td className="px-3 py-2">
                                                <select value={iso.welderId || ""} onChange={(e) => onAssign(iso.id, e.target.value || null)} className={selectCls + " max-w-[160px] text-xs"}>
                                                  <option value="">— Sin asignar —</option>
                                                  {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                                                </select>
                                              </td>
                                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                                <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="Ver ISO"><FileImage size={12} /></button>
                                                <button onClick={() => setEditingIso(iso)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 mr-1" title="Editar"><Edit2 size={12} /></button>
                                                <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50" title="Borrar"><Trash2 size={12} /></button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* UNCLASSIFIED ISOs (sin sistema o sin medida) */}
                  {isosWithoutSystem.length > 0 && (
                    <div className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSystem("__unclassified")}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center">
                            <AlertCircle size={16} />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-orange-900 text-sm">SIN CLASIFICAR</div>
                            <div className="text-[10px] text-orange-600">ISOs viejos sin sistema/medida — edítalos</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {isosWithoutSystem.length}
                          </span>
                          {expandedSystems["__unclassified"] ? <ChevronDown size={16} className="text-orange-600" /> : <ChevronRight size={16} className="text-orange-600" />}
                        </div>
                      </button>
                      {expandedSystems["__unclassified"] && (
                        <div className="border-t border-orange-100">
                          <table className="w-full text-sm">
                            <thead className="bg-orange-50/50 text-[10px] tracking-widest text-orange-800">
                              <tr>
                                <th className="text-left px-3 py-1.5 font-bold">ISO</th>
                                <th className="text-left px-3 py-1.5 font-bold hidden md:table-cell">DESC.</th>
                                <th className="text-left px-3 py-1.5 font-bold">EDITAR</th>
                                <th className="px-3 py-1.5"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {isosWithoutSystem.map((iso) => (
                                <tr key={iso.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-mono text-blue-700 font-bold text-xs">{iso.number}</td>
                                  <td className="px-3 py-2 text-slate-600 text-xs hidden md:table-cell">{iso.description || "—"}</td>
                                  <td className="px-3 py-2">
                                    <button onClick={() => setEditingIso(iso)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 text-[10px] font-bold tracking-widest rounded transition-colors flex items-center gap-1">
                                      <Edit2 size={10} /> CLASIFICAR
                                    </button>
                                  </td>
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="Ver ISO"><FileImage size={12} /></button>
                                    <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={12} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && <IsoModal onClose={() => setShowModal(false)} onSave={onAdd} welders={welders} systems={systems} />}
      {editingIso && <IsoModal onClose={() => setEditingIso(null)} onSave={(data) => { onUpdateIso(editingIso.id, data); setEditingIso(null); }} welders={welders} systems={systems} editing={editingIso} />}
      {showSystemsModal && <SystemsModal onClose={() => setShowSystemsModal(false)} systems={systems} onAdd={onAddSystem} onDelete={onDeleteSystem} />}
      {viewingIso && <IsoViewerModal iso={viewingIso} onClose={() => setViewingIso(null)} onUpdateIso={onUpdateIso} />}
    </div>
  );
}
function LogModal({ onClose, onSave, welders, editing, role, currentUser }) {
  const [welderId, setWelderId] = useState(editing?.welderId || (role === "welder" ? currentUser.id : ""));
  const [date, setDate] = useState(editing?.date || new Date().toISOString().split("T")[0]);
  const [jobNumber, setJobNumber] = useState(editing?.jobNumber || "");
  const [gasCylinder, setGasCylinder] = useState(editing?.gasCylinder || "");
  const [lot1, setLot1] = useState(editing?.lot1 || "");
  const [lot2, setLot2] = useState(editing?.lot2 || "");
  const [cylinder, setCylinder] = useState(editing?.cylinder || "");
  const [cylinder2, setCylinder2] = useState(editing?.cylinder2 || "");

  const submit = () => {
    if (!welderId || !date) return;
    onSave({ ...(editing || {}), welderId, date, jobNumber: jobNumber.trim(), gasCylinder: gasCylinder.trim(), lot1: lot1.trim(), lot2: lot2.trim(), cylinder: cylinder.trim(), cylinder2: cylinder2.trim() });
  };

  return (
    <ModalShell title={editing ? "EDITAR DAILY LOG" : "NUEVO DAILY LOG"} onClose={onClose}>
      {role !== "welder" && (
        <Field label="WELDER">
          <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls} autoFocus>
            <option value="">— Select —</option>
            {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
          </select>
        </Field>
      )}
      <Field label="DATE"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
      <Field label="JOB #"><input value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} className={inputCls} /></Field>
      <Field label="GAS CYLINDER"><input value={gasCylinder} onChange={(e) => setGasCylinder(e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="LOT #1"><input value={lot1} onChange={(e) => setLot1(e.target.value)} className={inputCls} /></Field>
        <Field label="LOT #2"><input value={lot2} onChange={(e) => setLot2(e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CYLINDER #1"><input value={cylinder} onChange={(e) => setCylinder(e.target.value)} className={inputCls} /></Field>
        <Field label="CYLINDER #2"><input value={cylinder2} onChange={(e) => setCylinder2(e.target.value)} className={inputCls} /></Field>
      </div>
      <button onClick={submit} className={btnPrimaryFull}>{editing ? "SAVE CHANGES" : "CREATE LOG"}</button>
    </ModalShell>
  );
}

function EntryModal({ onClose, onSave, isos, editing }) {
  const [size, setSize] = useState(editing?.size || "");
  const [machine, setMachine] = useState(editing?.machine || "");
  const [iso, setIso] = useState(editing?.iso || "");
  const [weldNumber, setWeldNumber] = useState(editing?.weldNumber || "");
  const [bottle, setBottle] = useState(editing?.bottle || "1");
  const [program, setProgram] = useState(editing?.program || "");
  const [head, setHead] = useState(editing?.head || "");
  const [system, setSystem] = useState(editing?.system || "");
  const [comments, setComments] = useState(editing?.comments || "");

  const submit = () => {
    if (!iso.trim() || !weldNumber.trim()) return;
    onSave({ size: size.trim(), machine: machine.trim(), iso: iso.trim().toUpperCase(), weldNumber: weldNumber.trim().toUpperCase(), bottle: bottle.trim(), program: program.trim(), head: head.trim(), system: system.trim(), comments: comments.trim() });
  };

  return (
    <ModalShell title={editing ? "EDIT WELD" : "NEW WELD"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SIZE"><input value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} autoFocus /></Field>
        <Field label="MACHINE NUMBER"><input value={machine} onChange={(e) => setMachine(e.target.value)} className={inputCls} /></Field>
      </div>
      <Field label="ISO NUMBER">
        {isos.length > 0 ? (
          <select value={iso} onChange={(e) => setIso(e.target.value)} className={selectCls}>
            <option value="">— Select ISO —</option>
            {isos.map((i) => <option key={i.id} value={i.number}>{i.number}</option>)}
            {iso && !isos.find((i) => i.number === iso) && iso !== "OTHER" && <option value={iso}>{iso}</option>}
            <option value="OTHER">Otro (escribir)</option>
          </select>
        ) : <input value={iso} onChange={(e) => setIso(e.target.value)} className={inputCls} />}
        {iso === "OTHER" && <input onChange={(e) => setIso(e.target.value)} className={inputCls + " mt-2"} placeholder="Type ISO" autoFocus />}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="WELD NUMBER"><input value={weldNumber} onChange={(e) => setWeldNumber(e.target.value)} className={inputCls} /></Field>
        <Field label="BOTTLE/DEWAR"><input value={bottle} onChange={(e) => setBottle(e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="PROGRAM"><input value={program} onChange={(e) => setProgram(e.target.value)} className={inputCls} /></Field>
        <Field label="HEAD"><input value={head} onChange={(e) => setHead(e.target.value)} className={inputCls} /></Field>
        <Field label="SYSTEM"><input value={system} onChange={(e) => setSystem(e.target.value)} className={inputCls} /></Field>
      </div>
      <Field label="COMMENTS"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls + " resize-none"} rows={2} /></Field>
      <button onClick={submit} className={btnPrimaryFull}>{editing ? "SAVE CHANGES" : "REGISTER WELD"}</button>
    </ModalShell>
  );
}

function generateDailyLogPDF(log, welder) {
  const dateObj = new Date(log.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dateShort = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "2-digit" });

  // Pad rows to at least 18 to match the look of the original
  const minRows = 18;
  const entries = [...log.entries];
  while (entries.length < minRows) entries.push(null);

  const rowsHTML = entries.map((e, i) => {
    if (!e) {
      return `<tr class="${i % 2 === 0 ? 'even' : ''}"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }
    return `
      <tr class="${i % 2 === 0 ? 'even' : ''}">
        <td>${e.size || ''}</td>
        <td>${e.machine || ''}</td>
        <td class="iso-col">${e.iso || ''}</td>
        <td class="weld-col">${e.weldNumber || ''}</td>
        <td>${e.bottle || ''}</td>
        <td>${e.program || ''}</td>
        <td>${e.head || ''}</td>
        <td>${e.system || ''}</td>
        <td>${e.comments || ''}</td>
        <td></td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Daily Weld Log — ${welder?.name || ''} — ${dateShort}</title>
<style>
  @page { size: letter landscape; margin: 0.4in; }
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .logo-block { display: flex; align-items: center; gap: 10px; }
  .logo-svg { width: 50px; height: 50px; flex-shrink: 0; }
  .logo-text { line-height: 1.1; }
  .logo-name { font-size: 20pt; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5pt; }
  .logo-tag { font-size: 6pt; color: #64748b; letter-spacing: 2pt; font-weight: 600; text-transform: uppercase; }
  .center-title { font-size: 18pt; font-weight: 900; color: #0f172a; }
  .right-meta { font-size: 10pt; font-weight: 700; text-align: right; }
  .info-table { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
  .info-table td { padding: 4px 0; font-size: 10pt; vertical-align: middle; }
  .info-label { font-weight: 700; width: 90px; }
  .info-value { border-bottom: 1px solid #0f172a; padding-bottom: 2px !important; padding-right: 20px !important; }
  .info-spacer { width: 30px; }
  table.welds { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #1e3a8a; }
  table.welds thead { background: #1e3a8a; color: white; }
  table.welds th { padding: 8px 4px; font-size: 8pt; font-weight: 700; text-align: center; }
  table.welds td { padding: 7px 4px; font-size: 9pt; text-align: center; border: 1px solid #cbd5e1; }
  table.welds tr.even td { background: #eff6ff; }
  table.welds td.iso-col { font-weight: 700; color: #1e40af; text-align: left; padding-left: 8px; }
  table.welds td.weld-col { font-weight: 700; }
  .footer { font-size: 9pt; color: #0f172a; }
  .footer p { margin: 2px 0; }
  @media print {
    .no-print { display: none !important; }
  }
  .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; color: white; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
  .print-bar button { padding: 8px 16px; border-radius: 6px; border: none; font-weight: 700; cursor: pointer; font-size: 13px; letter-spacing: 1px; }
  .print-btn { background: #10b981; color: white; }
  .close-btn { background: #ef4444; color: white; margin-left: 8px; }
  .content { padding-top: 70px; }
  @media print { .content { padding-top: 0; } }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <div style="font-weight:700;letter-spacing:2px;">📄 DAILY WELD LOG — ${welder?.name || ''} — ${dateShort}</div>
    <div>
      <button class="print-btn" onclick="window.print()">🖨️ IMPRIMIR / GUARDAR PDF</button>
      <button class="close-btn" onclick="window.close()">✕ CERRAR</button>
    </div>
  </div>

  <div class="content">
    <div class="header">
      <div class="logo-block">
        <svg class="logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e40af"/>
              <stop offset="100%" stop-color="#1e3a8a"/>
            </linearGradient>
          </defs>
          <rect x="5" y="42" width="90" height="20" fill="url(#g)" rx="3"/>
          <circle cx="50" cy="52" r="18" fill="white" stroke="url(#g)" stroke-width="4"/>
          <path d="M 42 52 L 48 58 L 60 46" stroke="#10b981" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="logo-text">
          <div class="logo-name">SWCS</div>
          <div class="logo-tag">Sanitary Weld Control System</div>
        </div>
      </div>
      <div class="center-title">Daily Weld Log</div>
      <div class="right-meta">Page: 1</div>
    </div>

    <table class="info-table">
      <tr>
        <td class="info-label">Date:</td>
        <td class="info-value">${dateStr}</td>
        <td class="info-spacer"></td>
        <td class="info-label">Gas Cylinder:</td>
        <td class="info-value">${log.gasCylinder || ''}</td>
      </tr>
      <tr>
        <td class="info-label">Welder:</td>
        <td class="info-value">${welder?.name || ''}</td>
        <td class="info-spacer"></td>
        <td class="info-label">Lot 1 #:</td>
        <td class="info-value">${log.lot1 || ''}</td>
      </tr>
      <tr>
        <td class="info-label">Welder ID:</td>
        <td class="info-value">#${welder?.welderId || ''}</td>
        <td class="info-spacer"></td>
        <td class="info-label">Lot 2 #:</td>
        <td class="info-value">${log.lot2 || ''}</td>
      </tr>
      <tr>
        <td class="info-label">Job #:</td>
        <td class="info-value">${log.jobNumber || ''}</td>
        <td class="info-spacer"></td>
        <td class="info-label">Cylinder:</td>
        <td class="info-value">${log.cylinder || ''}</td>
      </tr>
    </table>

    <table class="welds">
      <thead>
        <tr>
          <th style="width:5%">Size</th>
          <th style="width:9%">Machine<br/>Number</th>
          <th style="width:18%">ISO Number</th>
          <th style="width:7%">Weld<br/>Number</th>
          <th style="width:6%">Bottle/<br/>Dewar</th>
          <th style="width:7%">Program</th>
          <th style="width:9%">Head</th>
          <th style="width:6%">System</th>
          <th style="width:23%">Comments</th>
          <th style="width:10%">QC<br/>Initial</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>

    <div class="footer">
      <p>Revision: 1</p>
      <p>Approved: ____</p>
      <p>Date: ${dateShort}</p>
    </div>
  </div>

  <script>
    // Auto-trigger print dialog after 500ms so user can save as PDF
    // window.addEventListener('load', () => setTimeout(() => window.print(), 500));
  </script>
</body>
</html>`;

  // Open in new window
  const win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) {
    alert("Permite ventanas emergentes (popups) en tu navegador para generar el PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function LogsView({ role, currentUser, logs, welders, isos, inspections, onSaveLog, onDeleteLog, onAddEntry, onDeleteEntry, onUpdateEntry }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeLogId, setActiveLogId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [expandedWelderLogs, setExpandedWelderLogs] = useState({});
  const canEdit = role === "admin" || role === "welder";
  const canCreate = role === "welder" || role === "admin";

  // === Admin view: grouped by welder with collapsible cards ===
  if (role === "admin") {
    const totalWelds = logs.reduce((s, l) => s + l.entries.length, 0);
    const totalPending = logs.reduce((s, l) => s + l.entries.filter((e) => !inspections.find((i) => i.weldRef === `${l.id}-${e.id}`)).length, 0);

    // Group logs by welder
    const grouped = welders.map((w) => {
      const welderLogs = logs.filter((l) => l.welderId === w.id).sort((a, b) => new Date(b.date) - new Date(a.date));
      const welderWeldsCount = welderLogs.reduce((s, l) => s + l.entries.length, 0);
      return { welder: w, logs: welderLogs, weldsCount: welderWeldsCount };
    }).filter((g) => g.logs.length > 0);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">DAILY WELD LOG</h2>
            <p className="text-slate-500 text-xs tracking-wider font-semibold">{logs.length} REPORTS · {totalWelds} WELDS · {totalPending} PENDING</p>
          </div>
          <button onClick={() => { setEditingLog(null); setShowLogModal(true); }} disabled={welders.length === 0} className={btnPrimary + " disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"}>
            <Plus size={14} /> NEW LOG
          </button>
        </div>

        {logs.length === 0 ? <EmptyState icon={ClipboardList} text="No welds registered yet." /> : (
          <div className="space-y-2">
            {grouped.map(({ welder, logs: welderLogs, weldsCount }) => {
              const isExpanded = expandedWelderLogs[welder.id];
              return (
                <div key={welder.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedWelderLogs((prev) => ({ ...prev, [welder.id]: !prev[welder.id] }))}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <HardHat size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{welder.name}</div>
                        <div className="text-xs text-slate-500 font-mono">#{welder.welderId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {welderLogs.length} {welderLogs.length === 1 ? "log" : "logs"} · {weldsCount} welds
                      </span>
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100">
                      {welderLogs.map((log) => {
                        const logPending = log.entries.filter((e) => !inspections.find((i) => i.weldRef === `${log.id}-${e.id}`)).length;
                        const logAccepted = log.entries.filter((e) => inspections.find((i) => i.weldRef === `${log.id}-${e.id}` && i.status === "accepted")).length;
                        const logRejected = log.entries.filter((e) => inspections.find((i) => i.weldRef === `${log.id}-${e.id}` && i.status === "rejected")).length;
                        return (
                          <div key={log.id} className="bg-white">
                            <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Calendar size={14} className="text-blue-700" />
                                <span className="text-blue-700 font-bold text-sm">
                                  {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
                                </span>
                                {log.jobNumber && <span className="text-xs text-slate-600">JOB #{log.jobNumber}</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">{log.entries.length} welds:</span>
                                {logAccepted > 0 && <span className="text-emerald-600 font-bold">✓{logAccepted}</span>}
                                {logRejected > 0 && <span className="text-red-600 font-bold">✗{logRejected}</span>}
                                {logPending > 0 && <span className="text-amber-600 font-bold">{logPending} pending</span>}
                                <button
                                  onClick={() => generateDailyLogPDF(log, welder)}
                                  disabled={log.entries.length === 0}
                                  title="Exportar Daily Weld Log a PDF"
                                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded ml-2 flex items-center gap-1 transition-colors"
                                >
                                  <Download size={11} /> EXPORTAR PDF
                                </button>
                                <button onClick={() => { setEditingLog(log); setShowLogModal(true); }} className="text-slate-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded ml-1"><Edit2 size={12} /></button>
                                <button onClick={() => onDeleteLog(log.id)} className="text-slate-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                              </div>
                            </div>
                            {log.entries.length === 0 ? (
                              <div className="px-5 py-4 text-sm text-slate-400 italic">Sin welds en este log.</div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-50 text-slate-600 tracking-widest">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">SIZE</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">MACHINE</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">ISO #</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">WELD #</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">B/D</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">PROG</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">HEAD</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">SYSTEM</th>
                                      <th className="text-left px-3 py-2 font-bold whitespace-nowrap">QC</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {log.entries.map((e) => {
                                      const insp = inspections.find((i) => i.weldRef === `${log.id}-${e.id}`);
                                      return (
                                        <tr key={e.id} className={`hover:bg-slate-50 ${insp?.status === "rejected" ? "bg-red-50/50" : insp?.status === "accepted" ? "bg-emerald-50/30" : ""}`}>
                                          <td className="px-3 py-2 font-mono">{e.size}</td>
                                          <td className="px-3 py-2 font-mono text-slate-600">{e.machine}</td>
                                          <td className="px-3 py-2 font-mono text-blue-700">{e.iso}</td>
                                          <td className="px-3 py-2 font-mono font-bold">{e.weldNumber}</td>
                                          <td className="px-3 py-2 font-mono">{e.bottle}</td>
                                          <td className="px-3 py-2 font-mono">{e.program}</td>
                                          <td className="px-3 py-2 font-mono text-slate-600">{e.head}</td>
                                          <td className="px-3 py-2 font-mono">{e.system}</td>
                                          <td className="px-3 py-2 font-mono">
                                            {insp ? (insp.status === "accepted" ? <span className="text-emerald-600 font-bold">✓ {insp.qcInitial}</span> : <span className="text-red-600 font-bold">✗ {insp.qcInitial}</span>) : <span className="text-amber-600 font-semibold">PENDING</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showLogModal && <LogModal welders={welders} editing={editingLog} onClose={() => { setShowLogModal(false); setEditingLog(null); }} onSave={(l) => { onSaveLog(editingLog ? { ...editingLog, ...l } : { ...l, welderId: l.welderId || welders[0]?.id }); setShowLogModal(false); setEditingLog(null); }} role={role} currentUser={currentUser} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">DAILY WELD LOG</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{logs.length} REPORTS · {logs.reduce((s, l) => s + l.entries.length, 0)} WELDS</p>
        </div>
        {canCreate && (
          <button onClick={() => { setEditingLog(null); setShowLogModal(true); }} disabled={role === "admin" && welders.length === 0} className={btnPrimary + " disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"}>
            <Plus size={14} /> NEW LOG
          </button>
        )}
      </div>

      {logs.length === 0 ? <EmptyState icon={ClipboardList} text={role === "qc" ? "No daily logs yet." : "Create your first daily log."} /> : (
        <div className="space-y-4">
          {[...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).map((log) => {
            const welder = welders.find((w) => w.id === log.welderId);
            return (
              <div key={log.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 p-4">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-blue-700" />
                        <span className="text-blue-700 font-bold text-sm">
                          {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{welder?.name || "—"}</div>
                      <div className="text-xs text-slate-500">Welder ID: #{welder?.welderId || "—"}</div>
                    </div>
                    {canEdit && (role === "admin" || log.welderId === currentUser.id) && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingLog(log); setShowLogModal(true); }} className="text-slate-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => onDeleteLog(log.id)} className="text-slate-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    <Info label="JOB #" value={log.jobNumber} />
                    <Info label="LOT #1" value={log.lot1} />
                    <Info label="LOT #2" value={log.lot2} />
                    <Info label="CYLINDER #1" value={log.cylinder} />
                    <Info label="CYLINDER #2" value={log.cylinder2} />
                    <Info label="GAS CYLINDER" value={log.gasCylinder} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600 tracking-widest">
                      <tr>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">SIZE</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">MACHINE</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">ISO NUMBER</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">WELD #</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">B/D</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">PROG</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">HEAD</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">SYSTEM</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">COMMENTS</th>
                        <th className="text-left px-3 py-2 font-bold whitespace-nowrap">QC</th>
                        {canEdit && <th className="px-2 py-2"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {log.entries.length === 0 ? (
                        <tr><td colSpan={11} className="px-4 py-6 text-center text-slate-400">Sin welds en este log.</td></tr>
                      ) : log.entries.map((e) => {
                        const insp = inspections.find((i) => i.weldRef === `${log.id}-${e.id}`);
                        return (
                          <tr key={e.id} className={`hover:bg-slate-50 ${insp?.status === "rejected" ? "bg-red-50/50" : insp?.status === "accepted" ? "bg-emerald-50/30" : ""}`}>
                            <td className="px-3 py-2 font-mono">{e.size}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{e.machine}</td>
                            <td className="px-3 py-2 font-mono text-blue-700">{e.iso}</td>
                            <td className="px-3 py-2 font-mono font-bold">{e.weldNumber}</td>
                            <td className="px-3 py-2 font-mono">{e.bottle}</td>
                            <td className="px-3 py-2 font-mono">{e.program}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{e.head}</td>
                            <td className="px-3 py-2 font-mono">{e.system}</td>
                            <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{e.comments || "—"}</td>
                            <td className="px-3 py-2 font-mono">
                              {insp ? (insp.status === "accepted" ? <span className="text-emerald-600 font-bold">✓ {insp.qcInitial}</span> : <span className="text-red-600 font-bold">✗ {insp.qcInitial}</span>) : <span className="text-slate-300">—</span>}
                            </td>
                            {canEdit && (role === "admin" || log.welderId === currentUser.id) && (
                              <td className="px-2 py-2">
                                <div className="flex gap-1">
                                  <button onClick={() => setEditingEntry({ ...e, logId: log.id })} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50" title="Edit"><Edit2 size={12} /></button>
                                  <button onClick={() => onDeleteEntry(log.id, e.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50" title="Delete"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {canEdit && (role === "admin" || log.welderId === currentUser.id) && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex justify-between items-center">
                    <span className="text-xs text-slate-500">{log.entries.length} welds</span>
                    <button onClick={() => setActiveLogId(log.id)} className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 font-bold tracking-widest rounded flex items-center gap-1 transition-colors">
                      <Plus size={12} /> ADD WELD
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showLogModal && <LogModal onClose={() => setShowLogModal(false)} onSave={(l) => { onSaveLog(l); setShowLogModal(false); }} welders={welders} editing={editingLog} role={role} currentUser={currentUser} />}
      {activeLogId && <EntryModal onClose={() => setActiveLogId(null)} onSave={(e) => { onAddEntry(activeLogId, e); setActiveLogId(null); }} isos={isos} />}
      {editingEntry && <EntryModal onClose={() => setEditingEntry(null)} onSave={(e) => { onUpdateEntry(editingEntry.logId, editingEntry.id, e); setEditingEntry(null); }} isos={isos} editing={editingEntry} />}
    </div>
  );
}
function InspectModal({ entry, welder, onClose, onSave }) {
  const [status, setStatus] = useState("accepted");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [qcInitial, setQcInitial] = useState("");

  const submit = () => {
    if (!qcInitial.trim()) { alert("Pon tus iniciales QC"); return; }
    if (status === "rejected" && !reason) { alert("Select el motivo del rechazo"); return; }
    onSave({ weldRef: entry.weldRef, status, reason: status === "rejected" ? reason : "", comments: comments.trim(), qcInitial: qcInitial.trim().toUpperCase(), date: new Date().toISOString() });
  };

  return (
    <ModalShell title="INSPECT WELD" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-100 p-3 rounded space-y-1 text-xs">
        <div><span className="text-slate-500">Welder:</span> <span className="font-bold text-slate-900">{welder?.name}</span></div>
        <div><span className="text-slate-500">ISO:</span> <span className="font-mono text-blue-700">{entry.iso}</span></div>
        <div><span className="text-slate-500">Weld #:</span> <span className="font-mono font-bold">{entry.weldNumber}</span></div>
        <div><span className="text-slate-500">System:</span> <span className="font-mono">{entry.system}</span></div>
      </div>
      <Field label="RESULTADO">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "accepted", label: "ACCEPTED", icon: CheckCircle2, activeBg: "bg-emerald-50 border-emerald-500 text-emerald-700" },
            { v: "rejected", label: "REJECTED", icon: XCircle, activeBg: "bg-red-50 border-red-500 text-red-700" },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = status === opt.v;
            return (
              <button key={opt.v} type="button" onClick={() => setStatus(opt.v)}
                className={`p-3 border-2 text-xs font-bold tracking-wider flex flex-col items-center gap-1 transition-all rounded ${active ? opt.activeBg : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                <Icon size={18} />{opt.label}
              </button>
            );
          })}
        </div>
      </Field>
      {status === "rejected" && (
        <Field label="MOTIVO DEL RECHAZO">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={selectCls}>
            <option value="">— Select motivo —</option>
            <option>Porosidad</option>
            <option>Falta de fusión</option>
            <option>Falta de penetración</option>
            <option>Inclusión de escoria</option>
            <option>Socavadura (undercut)</option>
            <option>Grieta</option>
            <option>Mordedura</option>
            <option>Sobremonta excesiva</option>
            <option>Desalineación</option>
            <option>Color/oxidación</option>
            <option>Otro</option>
          </select>
        </Field>
      )}
      <Field label="COMMENTS (OPTIONAL)"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder="Additional notes..." /></Field>
      <Field label="QC INITIALS"><input value={qcInitial} onChange={(e) => setQcInitial(e.target.value)} className={inputCls}  maxLength={5} /></Field>
      <button onClick={submit} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors shadow-sm">REGISTRAR INSPECCIÓN</button>
    </ModalShell>
  );
}

function InspectionsView({ role, logs, welders, inspections, onAdd, onDelete }) {
  const [showInspectModal, setShowInspectModal] = useState(null);
  const allEntries = logs.flatMap((l) => l.entries.map((e) => ({ ...e, logId: l.id, logDate: l.date, welderId: l.welderId, jobNumber: l.jobNumber, weldRef: `${l.id}-${e.id}` })));
  const inspectedRefs = new Set(inspections.map((i) => i.weldRef));
  const pending = allEntries.filter((e) => !inspectedRefs.has(e.weldRef));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">CONTROL DE CALIDAD</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">{pending.length} PENDING · {inspections.filter((i) => i.status === "rejected").length} REJECTED</p>
      </div>
      {role === "qc" && (
        <div className="bg-cyan-50 border border-cyan-200 px-4 py-3 text-xs text-cyan-800 flex items-start gap-2 rounded">
          <Eye size={14} className="mt-0.5 flex-shrink-0" />
          <div>Como inspector QC, eres el único que puede aprobar o rechazar welds.</div>
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-blue-700">PENDING DE INSPECCIÓN ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">No hay welds pending.</div>
        ) : (
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 tracking-widest">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold">FECHA</th>
                    <th className="text-left px-3 py-2 font-bold">WELDER</th>
                    <th className="text-left px-3 py-2 font-bold">ISO</th>
                    <th className="text-left px-3 py-2 font-bold">WELD #</th>
                    <th className="text-left px-3 py-2 font-bold">SYSTEM</th>
                    {role === "qc" && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending.map((e) => {
                    const w = welders.find((w) => w.id === e.welderId);
                    return (
                      <tr key={e.weldRef} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-600">{new Date(e.logDate + "T00:00:00").toLocaleDateString("en-US", { day: "2-digit", month: "short" })}</td>
                        <td className="px-3 py-2 font-medium">{w?.name || "—"}</td>
                        <td className="px-3 py-2 font-mono text-blue-700">{e.iso}</td>
                        <td className="px-3 py-2 font-mono font-bold">{e.weldNumber}</td>
                        <td className="px-3 py-2 font-mono">{e.system}</td>
                        {role === "qc" && (
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => setShowInspectModal(e)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-xs font-bold tracking-widest rounded transition-colors">INSPECCIONAR</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-slate-700">INSPECCIONES REALIZADAS ({inspections.length})</h3>
        {inspections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">Sin inspections registradas.</div>
        ) : (
          <div className="space-y-2">
            {[...inspections].sort((a, b) => new Date(b.date) - new Date(a.date)).map((insp) => {
              const entry = allEntries.find((e) => e.weldRef === insp.weldRef);
              const w = welders.find((w) => w.id === entry?.welderId);
              return (
                <div key={insp.id} className={`bg-white border-l-4 border border-slate-200 p-3 rounded-r ${insp.status === "rejected" ? "border-l-red-500" : "border-l-emerald-500"}`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded ${insp.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {insp.status === "accepted" ? "✓ ACCEPTED" : "✗ REJECTED"}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(insp.date).toLocaleDateString("en-US")}</span>
                        <span className="text-xs text-cyan-700 font-semibold">QC: {insp.qcInitial}</span>
                      </div>
                      {entry ? (
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">{w?.name}</span> · <span className="font-mono text-blue-700">{entry.iso}</span> · Weld <span className="font-mono">{entry.weldNumber}</span>
                        </div>
                      ) : <div className="text-xs text-slate-400">Soldadura eliminada</div>}
                      {insp.status === "rejected" && insp.reason && (
                        <div className="mt-1 flex items-start gap-1.5 text-xs text-red-700">
                          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                          <span>{insp.reason}</span>
                        </div>
                      )}
                      {insp.comments && <div className="mt-1 text-xs text-slate-500 italic">"{insp.comments}"</div>}
                    </div>
                    {role === "qc" && <button onClick={() => onDelete(insp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showInspectModal && <InspectModal entry={showInspectModal} welder={welders.find((w) => w.id === showInspectModal.welderId)} onClose={() => setShowInspectModal(null)} onSave={(data) => { onAdd(data); setShowInspectModal(null); }} />}
    </div>
  );
}

function ToolModal({ onClose, onSave, welders }) {
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [welderId, setWelderId] = useState("");
  const submit = () => { if (!name.trim() || !serial.trim()) return; onSave({ name: name.trim(), serial: serial.trim().toUpperCase(), welderId: welderId || null }); onClose(); };
  return (
    <ModalShell title="NEW TOOL" onClose={onClose}>
      <Field label="NAME / DESCRIPTION"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoFocus /></Field>
      <Field label="SERIAL NUMBER"><input value={serial} onChange={(e) => setSerial(e.target.value)} className={inputCls} /></Field>
      <Field label="ASSIGN TO WELDER">
        <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls}>
          <option value="">— Sin asignar —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </Field>
      <button onClick={submit} className={btnPrimaryFull}>REGISTRAR</button>
    </ModalShell>
  );
}

function ToolsView({ role, currentUser, tools, welders, onAdd, onDelete, onReassign }) {
  const [showModal, setShowModal] = useState(false);
  const [expandedWelders, setExpandedWelders] = useState({});
  const visibleTools = role === "welder" ? tools.filter((t) => t.welderId === currentUser.id) : tools;
  const canManage = role === "admin";

  const toggleWelder = (welderId) => {
    setExpandedWelders((prev) => ({ ...prev, [welderId]: !prev[welderId] }));
  };

  // Group tools by welder
  const groupedTools = welders.map((w) => ({
    welder: w,
    tools: visibleTools.filter((t) => t.welderId === w.id),
  })).filter((g) => g.tools.length > 0 || canManage);

  const unassignedTools = visibleTools.filter((t) => !t.welderId);

  // For welder role, just show their tools directly (no grouping needed)
  if (role === "welder") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">MY TOOLS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{visibleTools.length} REGISTRADAS</p>
        </div>
        {visibleTools.length === 0 ? <EmptyState icon={Wrench} text="No tienes herramientas assigned." /> : (
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold">HERRAMIENTA</th>
                    <th className="text-left px-4 py-3 font-bold">SERIAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTools.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-blue-700 text-xs">{t.serial}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">HERRAMIENTAS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{visibleTools.length} REGISTRADAS · {welders.length} SOLDADORES</p>
        </div>
        {canManage && <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVA</button>}
      </div>

      {visibleTools.length === 0 ? <EmptyState icon={Wrench} text="No hay herramientas registradas." /> : (
        <div className="space-y-2">
          {groupedTools.map(({ welder, tools: welderTools }) => {
            const isExpanded = expandedWelders[welder.id];
            return (
              <div key={welder.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleWelder(welder.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <HardHat size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{welder.name}</div>
                      <div className="text-xs text-slate-500 font-mono">#{welder.welderId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {welderTools.length} {welderTools.length === 1 ? "herramienta" : "herramientas"}
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {welderTools.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-slate-400 italic">Sin herramientas asignadas a este soldador.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                          <tr>
                            <th className="text-left px-5 py-2 font-bold">HERRAMIENTA</th>
                            <th className="text-left px-5 py-2 font-bold">SERIAL</th>
                            {canManage && <th className="text-left px-5 py-2 font-bold">REASIGNAR</th>}
                            {canManage && <th className="px-5 py-2"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {welderTools.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="px-5 py-3 font-bold text-slate-900">{t.name}</td>
                              <td className="px-5 py-3 font-mono text-blue-700 text-xs">{t.serial}</td>
                              {canManage && (
                                <td className="px-5 py-3">
                                  <select value={t.welderId || ""} onChange={(e) => onReassign(t.id, e.target.value || null)} className={selectCls + " max-w-[180px]"}>
                                    <option value="">— Sin asignar —</option>
                                    {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                                  </select>
                                </td>
                              )}
                              {canManage && (
                                <td className="px-5 py-3 text-right">
                                  <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {unassignedTools.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleWelder("__unassigned")}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-amber-900">SIN ASIGNAR</div>
                    <div className="text-xs text-amber-600">Herramientas sin soldador</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {unassignedTools.length} {unassignedTools.length === 1 ? "herramienta" : "herramientas"}
                  </span>
                  {expandedWelders["__unassigned"] ? <ChevronDown size={18} className="text-amber-600" /> : <ChevronRight size={18} className="text-amber-600" />}
                </div>
              </button>
              {expandedWelders["__unassigned"] && (
                <div className="border-t border-amber-100">
                  <table className="w-full text-sm">
                    <thead className="bg-amber-50/50 text-xs tracking-widest text-amber-800">
                      <tr>
                        <th className="text-left px-5 py-2 font-bold">HERRAMIENTA</th>
                        <th className="text-left px-5 py-2 font-bold">SERIAL</th>
                        {canManage && <th className="text-left px-5 py-2 font-bold">ASIGNAR A</th>}
                        {canManage && <th className="px-5 py-2"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unassignedTools.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold text-slate-900">{t.name}</td>
                          <td className="px-5 py-3 font-mono text-blue-700 text-xs">{t.serial}</td>
                          {canManage && (
                            <td className="px-5 py-3">
                              <select value={t.welderId || ""} onChange={(e) => onReassign(t.id, e.target.value || null)} className={selectCls + " max-w-[180px]"}>
                                <option value="">— Sin asignar —</option>
                                {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                              </select>
                            </td>
                          )}
                          {canManage && (
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {showModal && <ToolModal onClose={() => setShowModal(false)} onSave={onAdd} welders={welders} />}
    </div>
  );
}

function ChartsView({ data, getEntryRef }) {
  const [dateRange, setDateRange] = useState("all");
  const [selectedWelder, setSelectedWelder] = useState("all");

  // Filter logs by date range
  const filterByDate = (date) => {
    if (dateRange === "all") return true;
    const logDate = new Date(date + "T00:00:00");
    const now = new Date();
    const daysAgo = (now - logDate) / (1000 * 60 * 60 * 24);
    if (dateRange === "week") return daysAgo <= 7;
    if (dateRange === "month") return daysAgo <= 30;
    if (dateRange === "quarter") return daysAgo <= 90;
    return true;
  };

  // Filter logs by selected welder
  const filteredLogs = data.dailyLogs.filter((l) => {
    if (selectedWelder !== "all" && l.welderId !== selectedWelder) return false;
    return filterByDate(l.date);
  });

  // Build all entries with status
  const allEntries = filteredLogs.flatMap((l) =>
    l.entries.map((e) => {
      const insp = data.inspections.find((i) => i.weldRef === getEntryRef(l.id, e.id));
      return {
        date: l.date,
        welderId: l.welderId,
        status: insp ? insp.status : "pending",
      };
    })
  );

  // ===== GLOBAL METRICS =====
  const total = allEntries.length;
  const accepted = allEntries.filter((e) => e.status === "accepted").length;
  const rejected = allEntries.filter((e) => e.status === "rejected").length;
  const pending = allEntries.filter((e) => e.status === "pending").length;
  const acceptRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0";
  const rejectRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0";

  // ===== TIMELINE DATA (line chart) =====
  // Group by date
  const timelineMap = {};
  allEntries.forEach((e) => {
    if (!timelineMap[e.date]) timelineMap[e.date] = { date: e.date, accepted: 0, rejected: 0, pending: 0 };
    timelineMap[e.date][e.status]++;
  });
  const timelineData = Object.values(timelineMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((d) => ({
      ...d,
      label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      total: d.accepted + d.rejected + d.pending,
    }));

  // ===== BY WELDER (bar chart) =====
  const welderData = data.welders.map((w) => {
    const wEntries = allEntries.filter((e) => e.welderId === w.id);
    return {
      name: w.name.length > 12 ? w.name.substring(0, 12) + "…" : w.name,
      fullName: w.name,
      welderId: w.welderId,
      accepted: wEntries.filter((e) => e.status === "accepted").length,
      rejected: wEntries.filter((e) => e.status === "rejected").length,
      pending: wEntries.filter((e) => e.status === "pending").length,
      total: wEntries.length,
    };
  }).filter((w) => w.total > 0).sort((a, b) => b.total - a.total);

  // ===== PIE CHART DATA =====
  const pieData = [
    { name: "Accepted", value: accepted, color: "#10b981" },
    { name: "Rejected", value: rejected, color: "#ef4444" },
    { name: "Pending", value: pending, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const dateRangeLabels = { all: "TODO EL TIEMPO", week: "ÚLTIMA SEMANA", month: "ÚLTIMO MES", quarter: "ÚLTIMOS 90 DÍAS" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">CHARTS &amp; ANALYTICS</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">PROGRESO Y RENDIMIENTO DE SOLDADURAS</p>
      </div>

      {/* FILTERS */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="RANGO DE FECHA">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={selectCls}>
              <option value="all">Todo el tiempo</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Últimos 90 días</option>
            </select>
          </Field>
          <Field label="SOLDADOR">
            <select value={selectedWelder} onChange={(e) => setSelectedWelder(e.target.value)} className={selectCls}>
              <option value="all">Todos los soldadores</option>
              {data.welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <Activity size={12} />
          <span className="tracking-widest font-semibold">VIENDO: {dateRangeLabels[dateRange]} {selectedWelder !== "all" ? "· " + (data.welders.find(w => w.id === selectedWelder)?.name || "") : ""}</span>
        </div>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="TOTAL WELDS" value={total} sub="en el período" color="blue" />
        <KPI label="ACCEPTED" value={accepted} sub={`${acceptRate}% del total`} color="emerald" />
        <KPI label="REJECTED" value={rejected} sub={`${rejectRate}% del total`} color="red" />
        <KPI label="PENDING" value={pending} sub="por inspeccionar" color="amber" />
      </div>

      {total === 0 ? (
        <EmptyState icon={BarChart3} text="No hay datos en el rango seleccionado. Cambia los filtros o registra welds." />
      ) : (
        <>
          {/* TIMELINE LINE CHART */}
          <Card title="EVOLUCIÓN EN EL TIEMPO" subtitle="welds por día">
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                  <Line type="monotone" dataKey="accepted" name="Accepted" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* GRID: BAR + PIE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* BAR CHART BY WELDER */}
            <Card title="POR SOLDADOR" subtitle="ranking de welds">
              {welderData.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No hay datos por soldador.</div>
              ) : (
                <div className="w-full" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={welderData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" angle={-15} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                        labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                        labelFormatter={(label, payload) => {
                          const item = payload && payload[0] && payload[0].payload;
                          return item ? `${item.fullName} (#${item.welderId})` : label;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                      <Bar dataKey="accepted" name="Accepted" stackId="a" fill="#10b981" />
                      <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* PIE CHART */}
            <Card title="DISTRIBUCIÓN GLOBAL" subtitle="% del total">
              <div className="w-full" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* WELDER PERFORMANCE TABLE */}
          {welderData.length > 0 && (
            <Card title="DESEMPEÑO POR SOLDADOR" subtitle="% de aceptación" noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold">SOLDADOR</th>
                      <th className="text-right px-4 py-3 font-bold">TOTAL</th>
                      <th className="text-right px-4 py-3 font-bold">✓ OK</th>
                      <th className="text-right px-4 py-3 font-bold">✗ RX</th>
                      <th className="text-right px-4 py-3 font-bold">PENDING</th>
                      <th className="text-right px-4 py-3 font-bold">% ACEPTACIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {welderData.map((w) => {
                      const rate = w.total > 0 ? ((w.accepted / w.total) * 100).toFixed(1) : "0.0";
                      const rateColor = parseFloat(rate) >= 90 ? "text-emerald-600" : parseFloat(rate) >= 70 ? "text-amber-600" : "text-red-600";
                      return (
                        <tr key={w.welderId} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{w.fullName}</div>
                            <div className="text-xs text-slate-500 font-mono">#{w.welderId}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">{w.total}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">{w.accepted}</td>
                          <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">{w.rejected}</td>
                          <td className="px-4 py-3 text-right font-mono text-amber-600 font-bold">{w.pending}</td>
                          <td className={`px-4 py-3 text-right font-mono text-lg font-black ${rateColor}`}>{rate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function IsoViewerModal({ iso, onClose, onUpdateIso }) {
  const [tool, setTool] = useState("pan");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [revisions, setRevisions] = useState(iso.revisions || []);
  const [activeRev, setActiveRev] = useState(0);
  const [imageData, setImageData] = useState(iso.imageData || null);
  const [pendingMark, setPendingMark] = useState(null);
  const [markLabel, setMarkLabel] = useState("");
  const [pendingText, setPendingText] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [color, setColor] = useState("#1e40af");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [drawing, setDrawing] = useState(null); // { type, points, start, end, color, strokeWidth }
  const fileInputRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const overlayRef = React.useRef(null);

  const COLORS = [
    { name: "Azul", value: "#1e40af" },
    { name: "Rojo", value: "#dc2626" },
    { name: "Verde", value: "#059669" },
    { name: "Amarillo", value: "#eab308" },
    { name: "Naranja", value: "#ea580c" },
    { name: "Negro", value: "#000000" },
  ];

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Sube una imagen (JPG, PNG) o un PDF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImageData(dataUrl);
      if (revisions.length === 0) {
        const rev0 = { id: "rev-0", name: "Rev 0 — Original", date: new Date().toISOString(), marks: [], annotations: [], locked: true };
        setRevisions([rev0]);
        setActiveRev(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAll = () => {
    onUpdateIso(iso.id, { imageData, revisions });
    onClose();
  };

  const createRevision = () => {
    const nextNum = revisions.length;
    const newRev = {
      id: `rev-${Date.now()}`,
      name: `Rev ${nextNum} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" })}`,
      date: new Date().toISOString(),
      marks: [],
      annotations: [],
      locked: false,
    };
    setRevisions([...revisions, newRev]);
    setActiveRev(revisions.length);
  };

  const deleteRevision = (idx) => {
    if (idx === 0) { alert("No se puede borrar Rev 0 (Original)"); return; }
    if (!confirm("¿Borrar esta revisión?")) return;
    const newRevs = revisions.filter((_, i) => i !== idx);
    setRevisions(newRevs);
    setActiveRev(Math.max(0, activeRev - (idx <= activeRev ? 1 : 0)));
  };

  const undoLast = () => {
    if (revisions[activeRev]?.locked) { alert("Rev 0 está bloqueada."); return; }
    const newRevs = [...revisions];
    const rev = { ...newRevs[activeRev] };
    const annotations = rev.annotations || [];
    const marks = rev.marks || [];
    if (annotations.length > 0) {
      rev.annotations = annotations.slice(0, -1);
    } else if (marks.length > 0) {
      rev.marks = marks.slice(0, -1);
    } else {
      return;
    }
    newRevs[activeRev] = rev;
    setRevisions(newRevs);
  };

  const getRelativeCoords = (e) => {
    if (!imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleImageMouseDown = (e) => {
    if (revisions[activeRev]?.locked) {
      if (tool !== "pan") {
        alert("Rev 0 (Original) está bloqueada. Crea una nueva revisión para añadir anotaciones.");
        return;
      }
    }
    const coords = getRelativeCoords(e);
    if (!coords) return;

    if (tool === "mark") {
      setPendingMark(coords);
      setMarkLabel("");
    } else if (tool === "text") {
      setPendingText(coords);
      setTextValue("");
    } else if (tool === "arrow" || tool === "line" || tool === "circle" || tool === "rectangle") {
      setDrawing({
        type: tool,
        start: coords,
        end: coords,
        color,
        strokeWidth,
      });
    } else if (tool === "pencil" || tool === "highlighter") {
      setDrawing({
        type: tool,
        points: [coords],
        color: tool === "highlighter" ? color : color,
        strokeWidth: tool === "highlighter" ? 18 : strokeWidth,
        opacity: tool === "highlighter" ? 0.4 : 1,
      });
    }
  };

  const handleImageMouseMove = (e) => {
    if (!drawing) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;

    if (drawing.type === "pencil" || drawing.type === "highlighter") {
      setDrawing({ ...drawing, points: [...drawing.points, coords] });
    } else {
      setDrawing({ ...drawing, end: coords });
    }
  };

  const handleImageMouseUp = () => {
    if (!drawing) return;
    const annotation = { id: Date.now().toString(), ...drawing };
    const newRevs = [...revisions];
    newRevs[activeRev] = {
      ...newRevs[activeRev],
      annotations: [...(newRevs[activeRev].annotations || []), annotation],
    };
    setRevisions(newRevs);
    setDrawing(null);
  };

  const confirmMark = () => {
    if (!pendingMark || !markLabel.trim()) {
      alert("Escribe un label (ej: FW01, FW02)");
      return;
    }
    const newMark = {
      id: Date.now().toString(),
      x: pendingMark.x,
      y: pendingMark.y,
      label: markLabel.trim().toUpperCase(),
      color,
      createdAt: new Date().toISOString(),
    };
    const newRevs = [...revisions];
    newRevs[activeRev] = { ...newRevs[activeRev], marks: [...(newRevs[activeRev].marks || []), newMark] };
    setRevisions(newRevs);
    setPendingMark(null);
    setMarkLabel("");
  };

  const confirmText = () => {
    if (!pendingText || !textValue.trim()) {
      setPendingText(null);
      return;
    }
    const annotation = {
      id: Date.now().toString(),
      type: "text",
      x: pendingText.x,
      y: pendingText.y,
      text: textValue.trim(),
      color,
      fontSize: 14 + (strokeWidth * 2),
    };
    const newRevs = [...revisions];
    newRevs[activeRev] = {
      ...newRevs[activeRev],
      annotations: [...(newRevs[activeRev].annotations || []), annotation],
    };
    setRevisions(newRevs);
    setPendingText(null);
    setTextValue("");
  };

  const deleteMark = (markId) => {
    const newRevs = [...revisions];
    newRevs[activeRev] = {
      ...newRevs[activeRev],
      marks: newRevs[activeRev].marks.filter((m) => m.id !== markId),
    };
    setRevisions(newRevs);
  };

  const deleteAnnotation = (annId) => {
    const newRevs = [...revisions];
    newRevs[activeRev] = {
      ...newRevs[activeRev],
      annotations: (newRevs[activeRev].annotations || []).filter((a) => a.id !== annId),
    };
    setRevisions(newRevs);
  };

  const startPan = (e) => {
    if (tool !== "pan") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const movePan = (e) => {
    if (!isDragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const endPan = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const currentRev = revisions[activeRev];
  const allMarks = currentRev?.marks || [];
  const allAnnotations = currentRev?.annotations || [];
  const baseMarks = activeRev > 0 ? (revisions[0]?.marks || []) : [];
  const baseAnnotations = activeRev > 0 ? (revisions[0]?.annotations || []) : [];

  const cursorByTool = {
    pan: isDragging ? "grabbing" : "grab",
    mark: "crosshair",
    text: "text",
    arrow: "crosshair",
    line: "crosshair",
    circle: "crosshair",
    rectangle: "crosshair",
    pencil: "crosshair",
    highlighter: "crosshair",
  };

  // Render annotation as SVG element
  const renderAnnotation = (ann, opacity = 1) => {
    if (ann.type === "arrow" || ann.type === "line") {
      const x1 = ann.start.x, y1 = ann.start.y;
      const x2 = ann.end.x, y2 = ann.end.y;
      return (
        <g key={ann.id} opacity={opacity}>
          <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={ann.color} strokeWidth={ann.strokeWidth} strokeLinecap="round" />
          {ann.type === "arrow" && (() => {
            const dx = x2 - x1, dy = y2 - y1;
            const angle = Math.atan2(dy, dx);
            const headLen = 2.5;
            const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
            const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
            const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
            const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6);
            return (
              <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={ann.color} transform={`scale(1)`} />
            );
          })()}
        </g>
      );
    }
    if (ann.type === "circle") {
      const cx = (ann.start.x + ann.end.x) / 2;
      const cy = (ann.start.y + ann.end.y) / 2;
      const rx = Math.abs(ann.end.x - ann.start.x) / 2;
      const ry = Math.abs(ann.end.y - ann.start.y) / 2;
      return <ellipse key={ann.id} cx={`${cx}%`} cy={`${cy}%`} rx={`${rx}%`} ry={`${ry}%`} stroke={ann.color} strokeWidth={ann.strokeWidth} fill="none" opacity={opacity} />;
    }
    if (ann.type === "rectangle") {
      const x = Math.min(ann.start.x, ann.end.x);
      const y = Math.min(ann.start.y, ann.end.y);
      const w = Math.abs(ann.end.x - ann.start.x);
      const h = Math.abs(ann.end.y - ann.start.y);
      return <rect key={ann.id} x={`${x}%`} y={`${y}%`} width={`${w}%`} height={`${h}%`} stroke={ann.color} strokeWidth={ann.strokeWidth} fill="none" opacity={opacity} />;
    }
    if (ann.type === "pencil" || ann.type === "highlighter") {
      const pts = ann.points.map(p => `${p.x},${p.y}`).join(" ");
      return <polyline key={ann.id} points={pts} stroke={ann.color} strokeWidth={ann.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={(ann.opacity || 1) * opacity} vectorEffect="non-scaling-stroke" />;
    }
    if (ann.type === "text") {
      return (
        <text key={ann.id} x={`${ann.x}%`} y={`${ann.y}%`} fill={ann.color} fontSize={ann.fontSize || 14} fontWeight="bold" opacity={opacity} style={{ userSelect: "none" }}>
          {ann.text}
        </text>
      );
    }
    return null;
  };

  const tools = [
    { id: "pan", icon: Move, label: "MOVER" },
    { id: "mark", icon: MousePointer2, label: "WELD" },
    { id: "arrow", icon: ArrowUpRight, label: "FLECHA" },
    { id: "line", icon: Minus, label: "LÍNEA" },
    { id: "circle", icon: Circle, label: "CÍRCULO" },
    { id: "rectangle", icon: Square, label: "RECTÁNGULO" },
    { id: "pencil", icon: Pencil, label: "DIBUJAR" },
    { id: "highlighter", icon: Highlighter, label: "MARCAR" },
    { id: "text", icon: Type, label: "TEXTO" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-stretch">
      <div className="flex-1 flex flex-col bg-slate-100">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <FileImage size={20} className="text-blue-700 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 font-mono truncate">{iso.number}</div>
              <div className="text-[10px] text-slate-500 tracking-widest font-semibold">ISO VIEWER &amp; MARKUP</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveAll} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold tracking-widest rounded flex items-center gap-1.5 transition-colors">
              <Save size={14} /> GUARDAR
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-red-600 p-2 hover:bg-red-50 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {imageData && (
          <>
            {/* Tools row */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1 flex-wrap">
              {tools.map((t) => {
                const Icon = t.icon;
                const active = tool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    className={`px-2.5 py-1.5 text-[10px] font-bold tracking-widest rounded flex items-center gap-1 transition-colors ${active ? "bg-blue-700 text-white" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"}`}
                  >
                    <Icon size={12} /> {t.label}
                  </button>
                );
              })}

              <div className="w-px h-6 bg-slate-300 mx-1" />

              {/* Color picker */}
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.value ? "border-slate-800 scale-110" : "border-white"}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-slate-300 mx-1" />

              {/* Stroke width */}
              <div className="flex items-center gap-1">
                {[2, 3, 5, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    title={`Grosor ${w}`}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${strokeWidth === w ? "bg-blue-700" : "bg-white border border-slate-300 hover:bg-slate-100"}`}
                  >
                    <div className="rounded-full" style={{ width: `${w}px`, height: `${w}px`, backgroundColor: strokeWidth === w ? "white" : color }} />
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-slate-300 mx-1" />

              <button onClick={undoLast} title="Deshacer última" className="px-2 py-1.5 text-[10px] font-bold tracking-widest rounded flex items-center gap-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors">
                <Undo2 size={12} /> DESHACER
              </button>
            </div>

            {/* Zoom row */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(0.3, zoom - 0.2))} className="p-1 text-slate-700 hover:bg-slate-200 rounded">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 px-1 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(4, zoom + 0.2))} className="p-1 text-slate-700 hover:bg-slate-200 rounded">
                <ZoomIn size={14} />
              </button>
              <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="ml-1 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-700 hover:bg-slate-200 rounded">
                RESET
              </button>
              <div className="w-px h-5 bg-slate-300 mx-2" />
              <span className="text-[10px] text-slate-500 italic">
                {tool === "mark" ? "Clic para marcar weld point" : tool === "pan" ? "Arrastra para mover" : tool === "text" ? "Clic para añadir texto" : tool === "pencil" || tool === "highlighter" ? "Mantén presionado y arrastra" : "Clic y arrastra para dibujar"}
              </span>
            </div>
          </>
        )}

        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative bg-slate-200"
          onMouseDown={tool === "pan" ? startPan : undefined}
          onMouseMove={tool === "pan" ? movePan : undefined}
          onMouseUp={tool === "pan" ? endPan : undefined}
          onMouseLeave={tool === "pan" ? endPan : undefined}
          style={{ cursor: cursorByTool[tool] || "default" }}
        >
          {!imageData ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center max-w-md">
                <FileImage size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Subir ISO</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Sube una imagen (JPG, PNG) o PDF del isométrico para visualizarlo y anotarlo.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold tracking-widest rounded inline-flex items-center gap-2 transition-colors"
                >
                  <Upload size={14} /> SELECCIONAR ARCHIVO
                </button>
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.1s",
              }}
            >
              <div
                className="relative inline-block"
                onMouseDown={tool !== "pan" ? handleImageMouseDown : undefined}
                onMouseMove={tool !== "pan" && drawing ? handleImageMouseMove : undefined}
                onMouseUp={tool !== "pan" && drawing ? handleImageMouseUp : undefined}
              >
                {imageData.startsWith("data:application/pdf") ? (
                  <embed src={imageData} type="application/pdf" style={{ width: "800px", height: "600px", maxWidth: "90vw", pointerEvents: "none" }} />
                ) : (
                  <img
                    ref={imgRef}
                    src={imageData}
                    alt="ISO"
                    className="max-w-full block shadow-2xl"
                    style={{ maxHeight: "80vh", pointerEvents: "none" }}
                    draggable={false}
                  />
                )}

                {/* SVG overlay for annotations */}
                <svg
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                  style={{ overflow: "visible" }}
                >
                  {/* Base annotations from Rev 0 if in higher rev */}
                  {baseAnnotations.map((ann) => renderAnnotation(ann, 0.35))}
                  {/* Current rev annotations */}
                  {allAnnotations.map((ann) => renderAnnotation(ann, 1))}
                  {/* Drawing in progress */}
                  {drawing && renderAnnotation({ ...drawing, id: "preview" }, 0.7)}
                </svg>

                {/* Marks overlay */}
                {imgRef.current && (
                  <>
                    {baseMarks.map((mark) => (
                      <div
                        key={`base-${mark.id}`}
                        className="absolute pointer-events-none"
                        style={{ left: `${mark.x}%`, top: `${mark.y}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-400/40 border-2 border-slate-500 flex items-center justify-center shadow-md">
                          <span className="text-[8px] font-black text-slate-700">{mark.label}</span>
                        </div>
                      </div>
                    ))}
                    {allMarks.map((mark) => (
                      <div
                        key={mark.id}
                        className="absolute group"
                        style={{ left: `${mark.x}%`, top: `${mark.y}%`, transform: "translate(-50%, -50%)", pointerEvents: "auto" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: mark.color || "#1e40af" }}
                        >
                          <span className="text-[9px] font-black text-white">{mark.label}</span>
                        </div>
                        {!currentRev?.locked && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMark(mark.id); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {pendingMark && (
                      <div className="absolute" style={{ left: `${pendingMark.x}%`, top: `${pendingMark.y}%`, transform: "translate(-50%, -50%)" }}>
                        <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white animate-pulse flex items-center justify-center shadow-lg">
                          <span className="text-[9px] font-black text-white">?</span>
                        </div>
                      </div>
                    )}
                    {pendingText && (
                      <div className="absolute" style={{ left: `${pendingText.x}%`, top: `${pendingText.y}%`, transform: "translate(-50%, 0)" }}>
                        <div className="w-2 h-6 bg-amber-500 animate-pulse" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {pendingMark && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 w-80">
              <div className="text-xs font-bold tracking-widest text-slate-700 mb-2">NUEVA MARCA DE WELD</div>
              <input
                value={markLabel}
                onChange={(e) => setMarkLabel(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") confirmMark(); if (e.key === "Escape") setPendingMark(null); }}
                placeholder="Ej: FW01, FW02, BW03..."
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPendingMark(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">CANCELAR</button>
                <button onClick={confirmMark} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">AÑADIR</button>
              </div>
            </div>
          )}

          {pendingText && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 w-96">
              <div className="text-xs font-bold tracking-widest text-slate-700 mb-2">AÑADIR TEXTO</div>
              <input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmText(); if (e.key === "Escape") setPendingText(null); }}
                placeholder="Escribe tu nota..."
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPendingText(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">CANCELAR</button>
                <button onClick={confirmText} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">AÑADIR</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {imageData && (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-blue-700" />
              <h3 className="text-sm font-bold tracking-widest text-slate-800">REVISIONES</h3>
            </div>
            <button onClick={createRevision} className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 text-[10px] font-bold tracking-widest rounded flex items-center gap-1 transition-colors">
              <Plus size={12} /> NUEVA
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {revisions.map((rev, idx) => (
              <div
                key={rev.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${activeRev === idx ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                onClick={() => setActiveRev(idx)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900">{rev.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(rev.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {rev.marks?.length || 0} welds
                      </span>
                      <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {rev.annotations?.length || 0} notas
                      </span>
                      {rev.locked && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          🔒
                        </span>
                      )}
                    </div>
                  </div>
                  {idx > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteRevision(idx); }} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="text-[10px] text-slate-500 italic mt-3 px-2">
              💡 La <strong>Rev 0</strong> es el original y siempre queda bloqueado. Crea revisiones nuevas para añadir o cambiar anotaciones.
            </div>
          </div>

          {currentRev && (
            <div className="border-t border-slate-200 p-3 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2">CONTENIDO DE {currentRev.name}</div>
              {(currentRev.marks?.length || 0) === 0 && (currentRev.annotations?.length || 0) === 0 ? (
                <div className="text-xs text-slate-400 italic">Sin contenido en esta revisión.</div>
              ) : (
                <div className="space-y-1">
                  {currentRev.marks?.map((mark) => (
                    <div key={mark.id} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-1.5 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: mark.color || "#1e40af" }}>
                          <span className="text-[7px] font-black text-white">{mark.label}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-700">{mark.label}</span>
                      </div>
                      {!currentRev.locked && (
                        <button onClick={() => deleteMark(mark.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                  {currentRev.annotations?.map((ann) => {
                    const typeLabel = ann.type === "arrow" ? "Flecha" : ann.type === "line" ? "Línea" : ann.type === "circle" ? "Círculo" : ann.type === "rectangle" ? "Rectángulo" : ann.type === "pencil" ? "Dibujo" : ann.type === "highlighter" ? "Marcador" : ann.type === "text" ? "Texto" : ann.type;
                    return (
                      <div key={ann.id} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-1.5 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ann.color }} />
                          <span className="text-slate-700">{typeLabel}{ann.text ? `: "${ann.text.substring(0, 20)}${ann.text.length > 20 ? '…' : ''}"` : ''}</span>
                        </div>
                        {!currentRev.locked && (
                          <button onClick={() => deleteAnnotation(ann.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-200 p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => { if (confirm("¿Reemplazar la imagen del ISO?")) fileInputRef.current?.click(); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold tracking-widest py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={12} /> REEMPLAZAR IMAGEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeldApp() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    async function load() {
      try {
        const r = localStorage.getItem(STORAGE_KEY);
        if (r) {
          const parsed = JSON.parse(r);
          if (!parsed.users.find((u) => u.username === "admin")) parsed.users.push({ id: "u1", username: "admin", password: "admin", role: "admin", name: "Administrator" });
          if (!parsed.users.find((u) => u.username === "qc")) parsed.users.push({ id: "u2", username: "qc", password: "qc", role: "qc", name: "QC Inspector" });
          setData(parsed);
        }
        const sess = localStorage.getItem("weld_session_v4");
        if (sess) setCurrentUser(JSON.parse(sess));
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    (() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {} })();
  }, [data, loading]);

  const login = async (user) => {
    setCurrentUser(user);
    try { localStorage.setItem("weld_session_v4", JSON.stringify(user)); } catch (e) {}
    setView("dashboard");
  };

  const logout = async () => {
    setCurrentUser(null);
    try { localStorage.removeItem("weld_session_v4"); } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-blue-700 font-semibold text-sm tracking-widest animate-pulse">CARGANDO SISTEMA...</div>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen users={data.users} welders={data.welders} onLogin={login} />;
  return <AppShell data={data} setData={setData} currentUser={currentUser} logout={logout} view={view} setView={setView} />;
}
