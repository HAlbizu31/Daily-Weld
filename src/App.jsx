import React, { useState, useEffect } from "react";
import { Plus, Users, FileText, BarChart3, Trash2, CheckCircle2, XCircle, X, Search, Wrench, ClipboardList, Calendar, AlertCircle, Edit2, LogOut, Shield, HardHat, Eye, LogIn, Menu, BookOpen, ShieldCheck, Thermometer, FileCheck, AlertTriangle, ChevronRight, ChevronDown, Award, Layers, Droplet, Sparkles, Link2, TrendingUp, Activity, PieChart as PieChartIcon, Upload, FileImage, MousePointer2, GitBranch, ZoomIn, ZoomOut, Move, Save, Download, ArrowUpRight, Circle, Type, Pencil, Highlighter, Minus, Square, Undo2, Palette } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STORAGE_KEY = "weld_app_v4";

const initialData = {
  users: [
    { id: "u1", username: "admin", password: "admin", role: "admin", name: "Administrator" },
    { id: "u2", username: "qc", password: "qc", role: "qc", name: "QC Inspector" },
  ],
  welders: [], isos: [], dailyLogs: [], inspections: [], tools: [], systems: [], coupons: [],
  project: null, // { id, name, client, jobNumber, floorPlanUrl, zones: [...] }
};

const inputCls = "w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";
const selectCls = "w-full bg-white border border-slate-300 text-sm px-2 py-1.5 rounded focus:border-blue-600 focus:outline-none";
const btnPrimary = "bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-colors rounded shadow-sm";
const btnPrimaryFull = "w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 text-xs tracking-widest mt-2 rounded transition-colors shadow-sm";

function Logo({ size = "md" }) {
  const sizes = {
    sm: { icon: 40, text: "text-2xl", tag: "text-[9px]" },
    md: { icon: 72, text: "text-4xl", tag: "text-[11px]" },
    lg: { icon: 110, text: "text-6xl", tag: "text-sm" },
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
        {/* Horizontal pipe */}
        <rect x="5" y="42" width="90" height="20" fill="url(#logoGrad)" rx="3" />
        {/* Weld point - white circle with blue border */}
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
            <label className="text-xs text-slate-600 font-semibold tracking-wider block mb-1.5">PASSWORD</label>
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
      title: "Orbital Welding",
      ref: "U328 — Welding",
      icon: Wrench,
      color: "blue",
      summary: "GTAW orbital autogenous is the required process for sanitary piping.",
      points: [
        { label: "Required process", value: "GTAW Orbital Autogenous (no filler)" },
        { label: "Manual exceptions", value: "Only tack welds or where the orbital head doesn't apply (with owner approval)" },
        { label: "Purge gas (back-purge)", value: "Argon 99.999% min. — type change requires WPS requalification" },
        { label: "Tack welds", value: "Must be completely consumed when welding the final pass" },
        { label: "WPS / WPQ", value: "Qualified per ASME Sec. IX + ASME BPE criteria" },
      ],
    },
    {
      id: "coupons",
      title: "Weld Coupons",
      ref: "U328.4.4 / U344.8",
      icon: FileCheck,
      color: "indigo",
      summary: "Test coupons required at start of each shift and after any change.",
      points: [
        { label: "Minimum frequency", value: "At the start of each shift (start-of-shift)" },
        { label: "Purge gas change", value: "Requires new coupon before production" },
        { label: "Power supply change", value: "Requires new coupon" },
        { label: "Tungsten electrode change", value: "Requires new coupon" },
        { label: "O.D. or wall thickness change", value: "Requires new coupon" },
        { label: "Operator change", value: "Each operator must have their representative coupon" },
      ],
    },
    {
      id: "joints",
      title: "Sanitary Joints",
      ref: "U335.7 / U335.8",
      icon: Link2,
      color: "cyan",
      summary: "Tri-Clamp, face seal y hygienic clamp joints para conexiones desmontables.",
      points: [
        { label: "Hygienic Clamp (Tri-Clamp)", value: "Ferrules Type A (¼\"-1\") and Type B (≥1\") per ASME BPE" },
        { label: "Tipos de clamp", value: "Two-piece single/double pin, three-piece, two-bolt heavy duty" },
        { label: "Metal Face Seal", value: "Allowed — install per manufacturer (gland + metallic gasket)" },
        { label: "Compression fittings", value: "Permitidos solo si stress intensity factor ≤ 1.5" },
        { label: "Threaded joints", value: "Evitar siempre que sea posible (U314)" },
        { label: "Brazing / Soldering", value: "❌ NO permitido en High Purity (U333)" },
      ],
    },
    {
      id: "materials",
      title: "Materials & Finish",
      ref: "U323 / ASME BPE Part SF",
      icon: Layers,
      color: "violet",
      summary: "Austenitic stainless steels with controlled interior finish.",
      points: [
        { label: "Typical materials", value: "316L (UNS S31603), 304L, duplex, nickel alloys" },
        { label: "Maximum carbon", value: "0.030% (L grade) to avoid weld sensitization" },
        { label: "SF1 mechanical finish", value: "Ra ≤ 0.51 μm (20 μin) — product-contact surface" },
        { label: "SF4 electropolished finish", value: "Ra ≤ 0.38 μm (15 μin) — critical pharmaceutical products" },
        { label: "Passivation", value: "Required post-fabrication (citric or nitric acid)" },
        { label: "MTR traceability", value: "Heat number on each component (pipe, fittings, valves)" },
      ],
    },
    {
      id: "preparation",
      title: "Edge Preparation",
      ref: "U328.4.2",
      icon: Sparkles,
      color: "orange",
      summary: "End preparation per wall thickness and orbital weld type.",
      points: [
        { label: "Wall ≤ 3.18 mm (0.125\")", value: "Square cut per ASME BPE / SEMI" },
        { label: "Pared 4.76 – 22.22 mm", value: "Bisel \"J\" o modificado conforme ASME B16.25" },
        { label: "Land thickness", value: "1.5 mm (1/16\") — extension ≥ land" },
        { label: "Root opening", value: "0 a 0.8 mm (0 a 1/32\")" },
        { label: "Internal alignment", value: "Hi-lo within ASME BPE tolerance (typ. ≤ 15% thickness)" },
        { label: "Pre-weld cleaning", value: "Residue-free solvent, free of oils and marks" },
      ],
    },
    {
      id: "examination",
      title: "Examination",
      ref: "U341 / U344",
      icon: Eye,
      color: "emerald",
      summary: "Internal visual inspection with borescope + documented coupons.",
      points: [
        { label: "External visual (VT)", value: "100% of welds — color, profile, alignment" },
        { label: "Internal borescope", value: "Accepted and recommended (U344.2) — penetration and discoloration" },
        { label: "Production coupons", value: "Replace 5% RT when orbital GTAW is used" },
        { label: "Internal color/oxidation", value: "Per ASME BPE Table MJ-8.4 (typically AWS D18.1/D18.2)" },
        { label: "Non-permitted defects", value: "Excessive concavity, lack of fusion, loose oxide, crack" },
        { label: "Examiner", value: "Independent of welder (U342.2) — SNT-TC-1A qualified" },
      ],
    },
    {
      id: "documentation",
      title: "Documentation",
      ref: "ASME BPE Part GR",
      icon: ShieldCheck,
      color: "rose",
      summary: "Complete traceability of each weld and test for audit.",
      points: [
        { label: "Weld Map / ISO", value: "Each weld numbered and assigned to its welder" },
        { label: "Weld Log", value: "Date, shift, orbital program, head, gas, pipe lot" },
        { label: "Coupon Log", value: "Each coupon result with photo/borescope" },
        { label: "Passivation report", value: "Method, concentration, time, free iron test" },
        { label: "MTRs", value: "Per each pipe, fitting and filler heat (if applicable)" },
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
        <p className="text-slate-500 text-xs tracking-wider font-semibold">TECHNICAL REFERENCE · HIGH PURITY PIPING</p>
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
                <p className="text-xl sm:text-2xl font-light mt-2 text-cyan-100">Pharmaceutical, biotech and food applications</p>
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
          <strong className="font-bold">Compliance notice:</strong> This summary is an operational reference for sanitary/high purity piping. All qualification, welding, examination and testing must be performed per the full text of <strong>ASME B31.3-2024 Chapter X</strong>, <strong>ASME BPE</strong> and the project specifications. In case of discrepancy, the code and owner spec prevail.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AUTO-ASSIGN HELPERS — map ISOs to Project Map zones by pattern
// ============================================================
// Converts a user-friendly pattern like "737-102*" or "*HPUR*" or "737-*-RV-*"
// into a case-insensitive RegExp. "*" acts as a wildcard matching any chars.
function patternToRegex(pattern) {
  if (!pattern || !pattern.trim()) return null;
  // Escape regex special chars EXCEPT '*' which we convert to '.*'
  const escaped = pattern.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regexStr = "^" + escaped.replace(/\*/g, ".*") + "$";
  try { return new RegExp(regexStr, "i"); } catch (e) { return null; }
}
// Returns the first zone whose isoPattern matches this ISO number, or null.
function findMatchingZone(isoNumber, zones) {
  if (!isoNumber || !zones || zones.length === 0) return null;
  for (const zone of zones) {
    if (!zone.isoPattern) continue;
    const regex = patternToRegex(zone.isoPattern);
    if (regex && regex.test(isoNumber)) return zone;
  }
  return null;
}

function AppShell({ data, setData, currentUser, logout, view, setView }) {
  const role = currentUser.role;
  const [menuOpen, setMenuOpen] = useState(false);

  const addWelder = (w) => setData((d) => ({ ...d, welders: [...d.welders, { ...w, id: Date.now().toString() }] }));
  const deleteWelder = (id) => { if (!confirm("Delete welder?")) return; setData((d) => ({ ...d, welders: d.welders.filter((w) => w.id !== id) })); };
  // addIso: creates ISO + auto-assigns it to first zone whose isoPattern matches the ISO number
  const addIso = (iso) => setData((d) => {
    const newIso = { ...iso, id: Date.now().toString() };
    const matchingZone = findMatchingZone(newIso.number, d.project?.zones || []);
    const newProject = (matchingZone && d.project)
      ? { ...d.project, zones: d.project.zones.map((z) =>
          z.id === matchingZone.id ? { ...z, isoIds: [...(z.isoIds || []), newIso.id] } : z) }
      : d.project;
    return { ...d, isos: [...d.isos, newIso], project: newProject };
  });
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
  const deleteSystem = (id) => { if (!confirm("Delete system? ISOs with this system will become unclassified.")) return; setData((d) => ({ ...d, systems: (d.systems || []).filter((s) => s.id !== id) })); };
  const updateIso = (isoId, fields) => setData((d) => ({ ...d, isos: d.isos.map((i) => i.id === isoId ? { ...i, ...fields } : i) }));
  const addCoupon = (c) => setData((d) => ({ ...d, coupons: [...(d.coupons || []), { ...c, id: Date.now().toString(), createdAt: new Date().toISOString() }] }));
  const updateCoupon = (id, fields) => setData((d) => ({ ...d, coupons: (d.coupons || []).map((c) => c.id === id ? { ...c, ...fields } : c) }));
  const deleteCoupon = (id) => { if (!confirm("Delete coupon?")) return; setData((d) => ({ ...d, coupons: (d.coupons || []).filter((c) => c.id !== id) })); };

  // === PROJECT & ZONES handlers ===
  const saveProject = (projectData) => setData((d) => ({ ...d, project: { ...(d.project || {}), ...projectData } }));
  const addZone = (zone) => setData((d) => ({
    ...d,
    project: {
      ...(d.project || { id: "p1", name: "New Project", zones: [] }),
      zones: [...((d.project && d.project.zones) || []), { ...zone, id: Date.now().toString(), photos: zone.photos || [], isoIds: zone.isoIds || [] }],
    },
  }));
  const updateZone = (zoneId, fields) => setData((d) => ({
    ...d,
    project: d.project ? { ...d.project, zones: (d.project.zones || []).map((z) => z.id === zoneId ? { ...z, ...fields } : z) } : d.project,
  }));
  const deleteZone = (zoneId) => { if (!confirm("Delete this zone?")) return; setData((d) => ({
    ...d,
    project: d.project ? { ...d.project, zones: (d.project.zones || []).filter((z) => z.id !== zoneId) } : d.project,
  })); };
  const addZonePhoto = (zoneId, photoData) => setData((d) => ({
    ...d,
    project: d.project ? { ...d.project, zones: (d.project.zones || []).map((z) =>
      z.id === zoneId ? { ...z, photos: [...(z.photos || []), { id: Date.now().toString(), url: photoData.url, caption: photoData.caption || "", uploadedAt: new Date().toISOString() }] } : z
    ) } : d.project,
  }));
  const deleteZonePhoto = (zoneId, photoId) => setData((d) => ({
    ...d,
    project: d.project ? { ...d.project, zones: (d.project.zones || []).map((z) =>
      z.id === zoneId ? { ...z, photos: (z.photos || []).filter((p) => p.id !== photoId) } : z
    ) } : d.project,
  }));

  // === AUTO-ASSIGN all existing ISOs to zones based on isoPattern ===
  // Preserves manual assignments; only places ISOs that are not currently in any zone.
  const autoAssignAllIsos = () => {
    setData((d) => {
      if (!d.project || !(d.project.zones || []).length) {
        setTimeout(() => alert("⚠️ No zones defined yet. Draw zones on the Project Map first and give each one an ISO pattern."), 50);
        return d;
      }
      const zones = d.project.zones;
      const alreadyAssigned = new Set();
      zones.forEach((z) => (z.isoIds || []).forEach((id) => alreadyAssigned.add(id)));
      let matched = 0, unmatched = 0, kept = alreadyAssigned.size;
      const assignments = {}; // isoId -> zoneId
      d.isos.forEach((iso) => {
        if (alreadyAssigned.has(iso.id)) return; // keep manual assignment
        const z = findMatchingZone(iso.number, zones);
        if (z) { assignments[iso.id] = z.id; matched++; }
        else unmatched++;
      });
      const newZones = zones.map((z) => {
        const newIds = [...(z.isoIds || [])];
        Object.entries(assignments).forEach(([isoId, zoneId]) => {
          if (zoneId === z.id && !newIds.includes(isoId)) newIds.push(isoId);
        });
        return { ...z, isoIds: newIds };
      });
      setTimeout(() => alert(`✅ AUTO-ASSIGN COMPLETE\n\n🔵 ${matched} ISOs newly assigned to zones\n🟢 ${kept} ISOs kept in current zone (manual assignments preserved)\n🟡 ${unmatched} ISOs with no matching pattern (check Zone patterns or assign manually)`), 100);
      return { ...d, project: { ...d.project, zones: newZones } };
    });
  };

  // === BULK IMPORT ISOs from CSV ===
  // Expected columns (first row headers, case-insensitive):
  //   iso_number (or "iso" or "number")   REQUIRED
  //   system                              optional
  //   size                                optional
  //   welder                              optional (matches welder name OR welderId)
  //   zone                                optional (if present, forces zone — overrides pattern match)
  const bulkImportIsos = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) { alert("CSV is empty or has no data rows."); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
    const idxNumber = headers.findIndex((h) => ["iso_number", "iso", "number", "iso #", "iso#"].includes(h));
    const idxSystem = headers.findIndex((h) => h === "system");
    const idxSize = headers.findIndex((h) => h === "size");
    const idxWelder = headers.findIndex((h) => h === "welder");
    const idxZone = headers.findIndex((h) => h === "zone");
    if (idxNumber === -1) { alert("CSV must have a column named 'iso_number', 'iso', or 'number'."); return; }
    setData((d) => {
      const newIsos = [];
      const assignments = {}; // isoId -> zoneId
      let skipped = 0;
      const existingNumbers = new Set(d.isos.map((i) => i.number.trim().toLowerCase()));
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const number = cols[idxNumber];
        if (!number) { skipped++; return; }
        if (existingNumbers.has(number.toLowerCase())) { skipped++; return; } // skip duplicates
        existingNumbers.add(number.toLowerCase());
        const welderName = idxWelder > -1 ? cols[idxWelder] : "";
        const matchedWelder = welderName ? d.welders.find((w) =>
          w.name.toLowerCase() === welderName.toLowerCase() ||
          w.welderId === welderName ||
          w.name.toLowerCase().startsWith(welderName.toLowerCase())
        ) : null;
        const iso = {
          id: `${Date.now()}-${i}`,
          number,
          system: idxSystem > -1 ? cols[idxSystem] : "",
          size: idxSize > -1 ? cols[idxSize] : "",
          welderId: matchedWelder ? matchedWelder.id : null,
          photos: [],
        };
        newIsos.push(iso);
        // Determine zone: explicit "zone" column wins, otherwise pattern match
        const zones = d.project?.zones || [];
        let targetZone = null;
        if (idxZone > -1 && cols[idxZone]) {
          targetZone = zones.find((z) => z.name.toLowerCase() === cols[idxZone].toLowerCase());
        }
        if (!targetZone) targetZone = findMatchingZone(number, zones);
        if (targetZone) assignments[iso.id] = targetZone.id;
      });
      let matched = Object.keys(assignments).length;
      let unmatched = newIsos.length - matched;
      const newZones = (d.project?.zones || []).map((z) => {
        const newIds = [...(z.isoIds || [])];
        Object.entries(assignments).forEach(([isoId, zoneId]) => {
          if (zoneId === z.id && !newIds.includes(isoId)) newIds.push(isoId);
        });
        return { ...z, isoIds: newIds };
      });
      setTimeout(() => alert(`✅ BULK IMPORT COMPLETE\n\n📥 ${newIsos.length} ISOs imported\n🔵 ${matched} auto-assigned to zones\n🟡 ${unmatched} without zone match\n⏩ ${skipped} skipped (duplicates or blank rows)`), 100);
      return {
        ...d,
        isos: [...d.isos, ...newIsos],
        project: d.project ? { ...d.project, zones: newZones } : d.project,
      };
    });
  };

  // === ISO PHOTOS (uploaded by welders, visible by admin in project map) ===
  const addIsoPhoto = (isoId, photoData) => setData((d) => ({
    ...d,
    isos: d.isos.map((iso) => iso.id === isoId ? {
      ...iso,
      photos: [...(iso.photos || []), {
        id: Date.now().toString(),
        url: photoData.url,
        caption: photoData.caption || "",
        uploadedBy: photoData.uploadedBy,
        uploadedByName: photoData.uploadedByName,
        uploadedAt: new Date().toISOString(),
      }],
    } : iso),
  }));
  const deleteIsoPhoto = (isoId, photoId) => setData((d) => ({
    ...d,
    isos: d.isos.map((iso) => iso.id === isoId ? { ...iso, photos: (iso.photos || []).filter((p) => p.id !== photoId) } : iso),
  }));

  // === DEMO DATA for presentations ===
  const loadDemoData = () => {
    if (!confirm("Load demo data? This will replace all current data with a realistic WARP10 HYGIENIC project demo.")) return;
    const today = new Date();
    const d = (daysAgo) => { const dt = new Date(today); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString().split("T")[0]; };
    const time = (h, m) => `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;

    const welders = [
      { id: "w1", name: "Hector Albizu", welderId: "5892", password: "5892", stamp: "HA-5892" },
      { id: "w2", name: "Nelvin Ojeda", welderId: "6789", password: "6789", stamp: "NO-6789" },
      { id: "w3", name: "Nathaniel Jacob", welderId: "3456", password: "3456", stamp: "NJ-3456" },
      { id: "w4", name: "Michael Rodriguez", welderId: "4521", password: "4521", stamp: "MR-4521" },
      { id: "w5", name: "David Santiago", welderId: "7823", password: "7823", stamp: "DS-7823" },
      { id: "w6", name: "Jose Martinez", welderId: "2914", password: "2914", stamp: "JM-2914" },
      { id: "w7", name: "Carlos Ramirez", welderId: "6102", password: "6102", stamp: "CR-6102" },
      { id: "w8", name: "Luis Fernandez", welderId: "8347", password: "8347", stamp: "LF-8347" },
    ];

    const systems = [
      { id: "s1", name: "RV" }, { id: "s2", name: "HPUR" }, { id: "s3", name: "PV" },
      { id: "s4", name: "RO" }, { id: "s5", name: "CIPS" }, { id: "s6", name: "CIPR" },
    ];

    const isos = [
      { id: "i01", number: "2.00-RV-SS12-3035001-N-4", systemId: "s1", size: '2.00"', page: "4", welderId: "w1", description: "WARP10 Hygienic - RV distribution line" },
      { id: "i02", number: "2.00-RV-SS12-3035002-N-4", systemId: "s1", size: '2.00"', page: "4", welderId: "w1", description: "WARP10 Hygienic - RV return loop" },
      { id: "i03", number: "2.00-RV-SS12-3035036-N-5", systemId: "s1", size: '2.00"', page: "5", welderId: "w1", description: "WARP10 Hygienic - RV platform connection" },
      { id: "i04", number: "1.50-HPUR-SS12-3012010-N-2", systemId: "s2", size: '1.50"', page: "2", welderId: "w2", description: "HPUR skid tie-in" },
      { id: "i05", number: "1.50-HPUR-SS12-3012011-N-2", systemId: "s2", size: '1.50"', page: "2", welderId: "w2", description: "HPUR distribution branch" },
      { id: "i06", number: "3.00-HPUR-SS12-3012020-N-3", systemId: "s2", size: '3.00"', page: "3", welderId: "w3", description: "HPUR main header" },
      { id: "i07", number: "3.00-HPUR-SS12-3012021-N-3", systemId: "s2", size: '3.00"', page: "3", welderId: "w3", description: "HPUR header continuation" },
      { id: "i08", number: "1.00-PV-SS12-3045101-N-1", systemId: "s3", size: '1.00"', page: "1", welderId: "w4", description: "PV sample port" },
      { id: "i09", number: "2.00-PV-SS12-3045102-N-2", systemId: "s3", size: '2.00"', page: "2", welderId: "w4", description: "PV main line" },
      { id: "i10", number: "1.50-RO-SS12-3067010-N-1", systemId: "s4", size: '1.50"', page: "1", welderId: "w5", description: "RO water supply" },
      { id: "i11", number: "1.50-RO-SS12-3067011-N-1", systemId: "s4", size: '1.50"', page: "1", welderId: "w5", description: "RO return" },
      { id: "i12", number: "4.00-CIPS-SS12-3089001-N-6", systemId: "s5", size: '4.00"', page: "6", welderId: "w6", description: "CIP supply header" },
      { id: "i13", number: "4.00-CIPR-SS12-3089002-N-6", systemId: "s6", size: '4.00"', page: "6", welderId: "w6", description: "CIP return header" },
      { id: "i14", number: "2.00-RV-SS12-3035040-N-7", systemId: "s1", size: '2.00"', page: "7", welderId: "w7", description: "RV sampling branch" },
      { id: "i15", number: "1.00-HPUR-SS12-3012030-N-4", systemId: "s2", size: '1.00"', page: "4", welderId: "w8", description: "HPUR point of use" },
    ];

    // === Attach demo photos to a few ISOs (SVG placeholders that simulate weld progress photos) ===
    const makePhotoSvg = (label, color) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#1e293b"/></linearGradient><radialGradient id="shine" cx="0.3" cy="0.3" r="0.6"><stop offset="0" stop-color="rgba(255,255,255,0.3)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="400" height="300" fill="url(#bg)"/><circle cx="200" cy="150" r="80" fill="#64748b" stroke="#cbd5e1" stroke-width="3"/><circle cx="200" cy="150" r="60" fill="none" stroke="#f1f5f9" stroke-width="2"/><rect x="80" y="140" width="240" height="20" fill="#94a3b8" opacity="0.7"/><rect width="400" height="300" fill="url(#shine)"/><text x="20" y="30" fill="white" font-family="Helvetica" font-size="14" font-weight="bold" opacity="0.9">${label}</text><text x="20" y="280" fill="white" font-family="Helvetica" font-size="10" opacity="0.7">FIELD PHOTO · DEMO</text></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };
    const photoOn = (isoIdx, welder, label, color, daysAgo = 0) => {
      const dt = new Date(today); dt.setDate(dt.getDate() - daysAgo);
      if (!isos[isoIdx].photos) isos[isoIdx].photos = [];
      isos[isoIdx].photos.push({
        id: `ph-${isoIdx}-${isos[isoIdx].photos.length}`,
        url: makePhotoSvg(label, color),
        caption: label,
        uploadedBy: welder,
        uploadedByName: welders.find((w) => w.id === welder)?.name || "Welder",
        uploadedAt: dt.toISOString(),
      });
    };
    // Hector's ISOs (zones Mezzanine + HVAC)
    photoOn(0, "w1", "FW03 after root pass", "#475569", 3);
    photoOn(0, "w1", "Weld face finished", "#334155", 2);
    photoOn(1, "w1", "RV header orbital complete", "#1e3a8a", 1);
    // Nelvin's ISOs (zone Buffer Prep)
    photoOn(3, "w2", "Skid tie-in area", "#78350f", 5);
    photoOn(4, "w2", "HPUR branch connection", "#047857", 2);
    // Nathaniel's ISOs (zone Process Corridor)
    photoOn(5, "w3", "3in header pre-weld prep", "#7c3aed", 7);
    photoOn(6, "w3", "After final pass - visual OK", "#059669", 1);
    // Jose's ISOs (zone Central CIP)
    photoOn(11, "w6", "CIP supply header weld #1", "#0891b2", 4);
    // Michael's ISOs (zone Media Prep)
    photoOn(7, "w4", "Sample port installation", "#be123c", 6);

    // === BUILD DAILY LOGS distributed over 90 days (realistic pattern) ===
    const dailyLogs = [];
    const machines = {
      w1: { machine: "8507420200", head: "8277410259", gasCyl: "31833260", lot: "S111605P" },
      w2: { machine: "8507420185", head: "8277410244", gasCyl: "31833270", lot: "S111612A" },
      w3: { machine: "8507420210", head: "8277410268", gasCyl: "31833281", lot: "S111628B" },
      w4: { machine: "8507420195", head: "8277410251", gasCyl: "31833295", lot: "S111640C" },
      w5: { machine: "8507420202", head: "8277410262", gasCyl: "31833302", lot: "S111655D" },
      w6: { machine: "8507420221", head: "8277410278", gasCyl: "31833315", lot: "S111670E" },
      w7: { machine: "8507420215", head: "8277410271", gasCyl: "31833322", lot: "S111685F" },
      w8: { machine: "8507420198", head: "8277410254", gasCyl: "31833338", lot: "S111692G" },
    };

    // Welder-to-ISO assignments
    const welderWork = {
      w1: [{iso: isos[0], size: "2.00", sys: "RV", prog: "5"}, {iso: isos[1], size: "2.00", sys: "RV", prog: "5"}, {iso: isos[2], size: "2.00", sys: "RV", prog: "5"}],
      w2: [{iso: isos[3], size: "1.50", sys: "HPUR", prog: "3"}, {iso: isos[4], size: "1.50", sys: "HPUR", prog: "3"}],
      w3: [{iso: isos[5], size: "3.00", sys: "HPUR", prog: "7"}, {iso: isos[6], size: "3.00", sys: "HPUR", prog: "7"}],
      w4: [{iso: isos[7], size: "1.00", sys: "PV", prog: "2"}, {iso: isos[8], size: "2.00", sys: "PV", prog: "5"}],
      w5: [{iso: isos[9], size: "1.50", sys: "RO", prog: "3"}, {iso: isos[10], size: "1.50", sys: "RO", prog: "3"}],
      w6: [{iso: isos[11], size: "4.00", sys: "CIPS", prog: "9"}, {iso: isos[12], size: "4.00", sys: "CIPR", prog: "9"}],
      w7: [{iso: isos[13], size: "2.00", sys: "RV", prog: "5"}],
      w8: [{iso: isos[14], size: "1.00", sys: "HPUR", prog: "2"}],
    };

    // Deterministic pseudo-random (reproducible demo)
    let seed = 42;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    let logIdCounter = 0;
    const weldCounters = { w1: 1, w2: 1, w3: 1, w4: 1, w5: 1, w6: 1, w7: 1, w8: 1 };

    // Generate 90 days of welds — recent 7 days ALWAYS have data (incl. today/yesterday/weekends)
    // Older days skip weekends. Intensity scales with recency.
    for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
      const dt = new Date(today); dt.setDate(dt.getDate() - daysAgo);
      const dayOfWeek = dt.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isRecent = daysAgo <= 6; // last 7 days always get data
      if (isWeekend && !isRecent) continue; // older weekends: skip
      const dateStr = dt.toISOString().split("T")[0];
      const recencyFactor = 1 - (daysAgo / 120);
      // Weekend crews are smaller (fewer welders show up for overtime)
      const weekendDamper = isWeekend ? 0.5 : 1;

      Object.keys(welderWork).forEach((wId) => {
        // On weekends only ~50% of welders come in; weekdays follow normal pattern
        const workProb = (0.4 + recencyFactor * 0.4) * weekendDamper;
        // Guarantee TODAY has at least some action: on daysAgo===0, force first 3 welders in
        if (daysAgo === 0 && ["w1","w2","w3"].includes(wId)) {
          // forced work for today's demo
        } else if (rnd() > workProb) return;

        const m = machines[wId];
        const workItems = welderWork[wId];
        const workItem = workItems[Math.floor(rnd() * workItems.length)];
        const numWelds = Math.max(2, Math.floor(2 + rnd() * 5 + recencyFactor * 2));

        const entries = Array.from({length: numWelds}, (_, n) => {
          const weldNum = weldCounters[wId]++;
          // Realistic supports: ~70% of welds have 0-1, some have 2-3
          const supportsRoll = Math.random();
          const supports = supportsRoll < 0.4 ? 0 : supportsRoll < 0.75 ? 1 : supportsRoll < 0.92 ? 2 : 3;
          // Realistic linear feet: scales with pipe size (2" ≈ 2-5 ft, 4" ≈ 4-8 ft)
          const sizeNum = parseFloat(workItem.size) || 2;
          const baseFt = 2 + sizeNum * 0.8;
          const linearFeet = Math.round((baseFt + Math.random() * 4) * 2) / 2; // round to .5
          return {
            id: `e-${wId}-${daysAgo}-${n}`,
            size: workItem.size,
            machine: m.machine,
            iso: workItem.iso.number,
            weldNumber: `FW${String(weldNum).padStart(2,"0")}`,
            bottle: "1",
            program: workItem.prog,
            head: m.head,
            system: workItem.sys,
            supports,
            linearFeet,
            comments: "",
          };
        });

        dailyLogs.push({
          id: `log-${logIdCounter++}`,
          welderId: wId,
          date: dateStr,
          jobNumber: "24.715.0002",
          gasCylinder: m.gasCyl,
          lot1: m.lot,
          lot2: "",
          cylinder: m.gasCyl,
          cylinder2: "",
          entries,
        });
      });
    }

    // === INSPECTIONS - most accepted, a few rejected, some pending ===
    const inspections = [];
    const rejReasons = ["Lack of fusion", "Lack of penetration", "Color/oxidation", "Misalignment"];
    let inspIdx = 0;
    dailyLogs.forEach((log) => {
      log.entries.forEach((e, i) => {
        // ~85% get inspected, ~5% rejected, 10% pending
        const roll = Math.random();
        if (roll < 0.85) {
          const isRejected = Math.random() < 0.06;
          inspections.push({
            id: `insp-${inspIdx++}`,
            weldRef: `${log.id}-${e.id}`,
            status: isRejected ? "rejected" : "accepted",
            qcInitial: "BC",
            date: log.date,
            reason: isRejected ? rejReasons[Math.floor(Math.random() * rejReasons.length)] : "",
            comments: "",
          });
        }
      });
    });

    // === COUPONS ===
    const coupons = [
      { id: "c1", welderId: "w1", welderName: "Hector Albizu", date: d(0), time: time(7, 15), reason: "START OF SHIFT", size: "2.00", machine: machines.w1.machine, head: machines.w1.head, status: "accepted", qcInitial: "BC", reviewedTime: time(7, 32), createdAt: new Date().toISOString() },
      { id: "c2", welderId: "w2", welderName: "Nelvin Ojeda", date: d(0), time: time(7, 20), reason: "START OF SHIFT", size: "1.50", machine: machines.w2.machine, head: machines.w2.head, status: "accepted", qcInitial: "BC", reviewedTime: time(7, 38), createdAt: new Date().toISOString() },
      { id: "c3", welderId: "w3", welderName: "Nathaniel Jacob", date: d(0), time: time(7, 25), reason: "START OF SHIFT", size: "3.00", machine: machines.w3.machine, head: machines.w3.head, status: "accepted", qcInitial: "BC", reviewedTime: time(7, 45), createdAt: new Date().toISOString() },
      { id: "c4", welderId: "w5", welderName: "David Santiago", date: d(0), time: time(7, 30), reason: "START OF SHIFT", size: "1.50", machine: "8507420202", head: "8277410262", status: "accepted", qcInitial: "BC", reviewedTime: time(7, 50), createdAt: new Date().toISOString() },
      { id: "c5", welderId: "w1", welderName: "Hector Albizu", date: d(0), time: time(10, 45), reason: "ADDITIONAL COUPON", size: "2.00", machine: machines.w1.machine, head: machines.w1.head, status: "ready", createdAt: new Date().toISOString() },
      { id: "c6", welderId: "w2", welderName: "Nelvin Ojeda", date: d(1), time: time(7, 18), reason: "START OF SHIFT", size: "1.50", machine: machines.w2.machine, head: machines.w2.head, status: "accepted", qcInitial: "BC", reviewedTime: time(7, 40), createdAt: new Date().toISOString() },
      { id: "c7", welderId: "w3", welderName: "Nathaniel Jacob", date: d(1), time: time(7, 22), reason: "START OF SHIFT", size: "3.00", machine: machines.w3.machine, head: machines.w3.head, status: "rejected", qcInitial: "BC", reviewedTime: time(7, 55), rejectReason: "Color/oxidation on inside — purge issue", createdAt: new Date().toISOString() },
      { id: "c8", welderId: "w3", welderName: "Nathaniel Jacob", date: d(1), time: time(8, 15), reason: "ADDITIONAL COUPON", size: "3.00", machine: machines.w3.machine, head: machines.w3.head, status: "accepted", qcInitial: "BC", reviewedTime: time(8, 30), createdAt: new Date().toISOString() },
      { id: "c9", welderId: "w1", welderName: "Hector Albizu", date: d(2), time: time(7, 10), reason: "START OF SHIFT", size: "2.00", machine: machines.w1.machine, head: machines.w1.head, status: "accepted", qcInitial: "BC", reviewedTime: time(7, 28), createdAt: new Date().toISOString() },
      { id: "c10", welderId: "w6", welderName: "Jose Martinez", date: d(2), time: time(7, 15), reason: "START OF SHIFT", size: "4.00", machine: "8507420221", head: "8277410278", status: "accepted", qcInitial: "BC", reviewedTime: time(7, 40), createdAt: new Date().toISOString() },
    ];

    // === TOOLS ===
    const tools = [
      { id: "t1", name: "Arc Machines Model 207A Power Supply", serial: machines.w1.machine, welderId: "w1" },
      { id: "t2", name: 'Weld Head 2" OD (Model 9-2500)', serial: machines.w1.head, welderId: "w1" },
      { id: "t3", name: "Arc Machines Model 207A Power Supply", serial: machines.w2.machine, welderId: "w2" },
      { id: "t4", name: 'Weld Head 1.5" OD (Model 9-1500)', serial: machines.w2.head, welderId: "w2" },
      { id: "t5", name: "Arc Machines Model 207A Power Supply", serial: machines.w3.machine, welderId: "w3" },
      { id: "t6", name: 'Weld Head 3" OD (Model 9-3000)', serial: machines.w3.head, welderId: "w3" },
      { id: "t7", name: "Olympus IPLEX G Borescope", serial: "BRS-00231", welderId: null },
      { id: "t8", name: "Argon Flowmeter 0-30 CFH", serial: "FM-10045", welderId: null },
      { id: "t9", name: "Tungsten Grinder - Diamond Ground", serial: "TG-DGT-7723", welderId: null },
      { id: "t10", name: "Purge Dam Kit 1-4 inch", serial: "PDK-040", welderId: null },
    ];

    // === PROJECT MAP intentionally left EMPTY ===
    // The admin/supervisor sets up the Project Map LIVE during the demo to show the workflow.
    // All welders, ISOs, photos, logs, etc. are pre-loaded — but Project Map starts blank
    // so you can upload the floor plan, draw zones, and assign ISOs in front of the PM.
    // The pre-loaded ISO photos will auto-appear in each zone as soon as you assign the ISOs.
    const project = null;

    setData((d) => ({ ...d, welders, systems, isos, dailyLogs, inspections, coupons, tools, project }));
    alert(
      "✓ Demo data loaded successfully!\n\n" +
      `Project: WARP10 Hygienic (Job #24.715.0002)\n` +
      `• ${welders.length} welders · ${isos.length} ISOs · ${dailyLogs.length} daily logs\n` +
      `• ${dailyLogs.reduce((s,l) => s + l.entries.length, 0)} total welds · ${inspections.length} inspections · ${coupons.length} coupons\n` +
      `• Data spans the last 90 days\n\n` +
      "LOGIN CREDENTIALS FOR DEMO:\n" +
      "─────────────────────────────\n" +
      "ADMIN:  admin / admin\n" +
      "QC:     qc / qc\n\n" +
      "WELDERS (login with Welder ID + password):\n" +
      "• Hector Albizu     → 5892 / 5892\n" +
      "• Nelvin Ojeda      → 6789 / 6789\n" +
      "• Nathaniel Jacob   → 3456 / 3456\n" +
      "• Michael Rodriguez → 4521 / 4521\n" +
      "• David Santiago    → 7823 / 7823\n" +
      "• Jose Martinez     → 2914 / 2914\n" +
      "• Carlos Ramirez    → 6102 / 6102\n" +
      "• Luis Fernandez    → 8347 / 8347"
    );
  };

  const clearAllData = () => {
    if (!confirm("Clear ALL data? This cannot be undone.")) return;
    if (!confirm("Are you ABSOLUTELY sure? All welders, ISOs, logs, inspections, coupons and tools will be deleted.")) return;
    setData((d) => ({ ...d, welders: [], isos: [], dailyLogs: [], inspections: [], tools: [], systems: [], coupons: [], project: null }));
    alert("All data cleared.");
  };

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
  const pendingCouponsCount = (data.coupons || []).filter((c) => c.status === "ready").length;
  const [prevPendingCount, setPrevPendingCount] = useState(pendingCount);
  const [prevCouponsCount, setPrevCouponsCount] = useState(pendingCouponsCount);

  useEffect(() => {
    if (role === "qc" && (pendingCount > prevPendingCount || pendingCouponsCount > prevCouponsCount)) {
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
    setPrevCouponsCount(pendingCouponsCount);
  }, [pendingCount, pendingCouponsCount, role]);

  const tabs = role === "admin" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "projectmap", icon: Layers, label: "PROJECT MAP" },
    { id: "reports", icon: FileCheck, label: "REPORTS" },
    { id: "welders", icon: Users, label: "WELDERS" },
    { id: "isos", icon: FileText, label: "ISOS" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: Eye, label: "QC" },
    { id: "coupons", icon: Award, label: "COUPONS" },
    { id: "tools", icon: Wrench, label: "TOOLS" },
    { id: "charts", icon: TrendingUp, label: "CHARTS" },
    { id: "codes", icon: BookOpen, label: "CODES" },
  ] : role === "qc" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: CheckCircle2, label: "INSPECT" },
    { id: "coupons", icon: Award, label: "COUPONS" },
    { id: "codes", icon: BookOpen, label: "CODES" },
  ] : [
    { id: "dashboard", icon: BarChart3, label: "MY DASHBOARD" },
    { id: "myisos", icon: FileImage, label: "MY ISOS" },
    { id: "logs", icon: ClipboardList, label: "MY DAILY LOGS" },
    { id: "coupons", icon: Award, label: "MY COUPONS" },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
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
            {role === "admin" && (
              <>
                <button
                  onClick={loadDemoData}
                  className="hidden md:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold tracking-widest px-2.5 py-1.5 rounded transition-colors"
                  title="Load realistic demo data for presentations"
                >
                  <Sparkles size={12} /> DEMO DATA
                </button>
                <button
                  onClick={clearAllData}
                  className="hidden md:flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-[10px] font-bold tracking-widest px-2.5 py-1.5 rounded border border-slate-200 transition-colors"
                  title="Clear all data"
                >
                  <Trash2 size={12} /> CLEAR
                </button>
              </>
            )}
            <button onClick={logout} className="text-slate-500 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors" title="Logout">
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
                const showCouponBadge = role === "qc" && t.id === "coupons" && pendingCouponsCount > 0;
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
                    {showCouponBadge && <span className="ml-auto bg-amber-500 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center animate-pulse">{pendingCouponsCount}</span>}
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
            const showCouponBadge = role === "qc" && t.id === "coupons" && pendingCouponsCount > 0;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`px-4 py-3 text-xs font-bold tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap relative ${
                  active ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Icon size={14} />
                {t.label}
                {showBadge && <span className="bg-red-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-pulse">{pendingCount}</span>}
                {showCouponBadge && <span className="bg-amber-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-pulse">{pendingCouponsCount}</span>}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {view === "dashboard" && <DashboardView role={role} stats={stats} data={data} visibleLogs={visibleLogs} getWelderStats={getWelderStats} currentUser={currentUser} />}
        {view === "welders" && role === "admin" && <WeldersView welders={data.welders} isos={data.isos} tools={data.tools} getStats={getWelderStats} onAdd={addWelder} onDelete={deleteWelder} />}
        {view === "isos" && role === "admin" && <IsosView isos={data.isos} welders={data.welders} systems={data.systems || []} project={data.project} onAdd={addIso} onDelete={deleteIso} onAssign={assignIso} onAddSystem={addSystem} onDeleteSystem={deleteSystem} onUpdateIso={updateIso} onBulkImport={bulkImportIsos} />}
        {view === "logs" && <LogsView role={role} currentUser={currentUser} logs={visibleLogs} welders={data.welders} isos={data.isos} inspections={data.inspections} onSaveLog={saveLog} onDeleteLog={deleteLog} onAddEntry={addEntry} onDeleteEntry={deleteEntry} onUpdateEntry={updateEntry} />}
        {view === "inspections" && (role === "admin" || role === "qc") && <InspectionsView role={role} logs={data.dailyLogs} welders={data.welders} inspections={data.inspections} onAdd={addInspection} onDelete={deleteInspection} />}
        {view === "coupons" && <CouponsView role={role} currentUser={currentUser} welders={data.welders} coupons={data.coupons || []} dailyLogs={data.dailyLogs} onAdd={addCoupon} onUpdate={updateCoupon} onDelete={deleteCoupon} />}
        {view === "projectmap" && role === "admin" && <ProjectMapView project={data.project} isos={data.isos} welders={data.welders} dailyLogs={data.dailyLogs} inspections={data.inspections} onSaveProject={saveProject} onAddZone={addZone} onUpdateZone={updateZone} onDeleteZone={deleteZone} onAddPhoto={addZonePhoto} onDeletePhoto={deleteZonePhoto} onAutoAssign={autoAssignAllIsos} />}
        {view === "myisos" && role === "welder" && <MyIsosView currentUser={currentUser} isos={data.isos} systems={data.systems || []} onAddPhoto={addIsoPhoto} onDeletePhoto={deleteIsoPhoto} />}
        {view === "tools" && <ToolsView role={role} currentUser={currentUser} tools={data.tools} welders={data.welders} onAdd={addTool} onDelete={deleteTool} onReassign={reassignTool} />}
        {view === "charts" && role === "admin" && <ChartsView data={data} getEntryRef={getEntryRef} />}
        {view === "reports" && role === "admin" && <ReportsView data={data} currentUser={currentUser} />}
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
          <KPI label="PENDING" value={myStats.pending} sub="pending inspection" color="amber" />
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
            {myTools.length === 0 ? <div className="text-slate-400 text-sm">No tools assigned</div> : (
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
        <p className="text-slate-500 text-xs tracking-wider font-semibold">CURRENT OPERATIONS STATUS</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="WELDERS" value={data.welders.length} sub="active in plant" />
        <KPI label="ACTIVE ISOs" value={`${data.isos.filter((i) => i.welderId).length}/${data.isos.length}`} sub="assigned / total" color="blue" />
        <KPI label="ACCEPTED" value={stats.accepted} sub={`${stats.acceptRate}% of total`} color="emerald" />
        <KPI label="REJECTED" value={stats.rejected} sub={`${stats.rejectRate}% of total`} color="red" />
      </div>
      <Card>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs text-slate-500 tracking-widest font-semibold">TOTAL WELDS</div>
            <div className="text-4xl font-black mt-1 text-slate-900">{stats.total}</div>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <div className="text-emerald-600 font-medium">● Accepted: {stats.accepted}</div>
            <div className="text-red-600 font-medium">● Rejected: {stats.rejected}</div>
            <div className="text-amber-600 font-medium">● Not inspected: {stats.pending}</div>
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
          <div className="p-8 text-center text-slate-400 text-sm">No welders registered yet.</div>
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
        <div className="text-[10px] text-slate-500 mt-1">This is the password the welder will use to log in.</div>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <button onClick={submit} className={btnPrimaryFull}>REGISTER</button>
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
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{welders.length} REGISTERED</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NEW</button>
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
    if (!systemId) { setError("Select a system (HPUR, CIPR, etc.). If it doesn't exist, create it first in MANAGE SYSTEMS."); return; }
    if (!size.trim()) { setError("Indica la medida del tubo (ej: 2\")"); return; }
    if (!page.toString().trim()) { setError("Enter page number"); return; }
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
            <div className="text-xs">Before creating an ISO, you must first create at least one system (HPUR, CIPR, RO, etc.) using the <strong>MANAGE SYSTEMS</strong>.</div>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors">CLOSE</button>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={editing ? "EDITAR ISO" : "NEW ISO"} onClose={onClose}>
      <Field label="ISO NUMBER">
        <input value={number} onChange={(e) => setNumber(e.target.value)} className={inputCls} autoFocus placeholder="2.00-HPUR-SS02-3456008-F4-34" />
      </Field>
      <Field label="DESCRIPTION (OPTIONAL)">
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
      <Field label="PAGE NUMBER *">
        <input type="number" value={page} onChange={(e) => setPage(e.target.value)} className={inputCls} placeholder="34" min="1" />
      </Field>
      <Field label="ASSIGN A WELDER (OPCIONAL)">
        <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls}>
          <option value="">— Unassigned —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <button onClick={submit} className={btnPrimaryFull}>{editing ? "SAVE CAMBIOS" : "REGISTER"}</button>
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
    <ModalShell title="MANAGE SYSTEMS" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-slate-600">
        Systems (ex: <strong>HPUR</strong>, <strong>CIPR</strong>, <strong>RO</strong>, <strong>CIPS</strong>) vary per project. Create here the ones you neeesites.
      </div>
      <Field label="NEW SISTEMA">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className={inputCls} placeholder="Ej: HPUR, CIPR, RO..." autoFocus />
          <button onClick={submit} className="bg-blue-700 hover:bg-blue-800 text-white px-4 text-xs font-bold tracking-widest rounded transition-colors flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>
      </Field>
      {error && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
      <div>
        <div className="text-xs text-slate-600 tracking-wider font-semibold mb-2">SYSTEMS REGISTERED ({systems.length})</div>
        {systems.length === 0 ? (
          <div className="text-slate-400 text-sm italic text-center py-4">No systems created yet.</div>
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
      <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors">CLOSE</button>
    </ModalShell>
  );
}

function IsosView({ isos, welders, systems, project, onAdd, onDelete, onAssign, onAddSystem, onDeleteSystem, onUpdateIso, onBulkImport }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSystemsModal, setShowSystemsModal] = useState(false);
  const [editingIso, setEditingIso] = useState(null);
  const [viewingIso, setViewingIso] = useState(null);
  const [expandedWelders, setExpandedWelders] = useState({});
  const [expandedSystems, setExpandedSystems] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const bulkFileInputRef = React.useRef(null);
  const zonePatternCount = (project?.zones || []).filter((z) => z.isoPattern).length;

  const handleBulkImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) { alert("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onBulkImport(ev.target.result);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const sampleRows = [
      "iso_number,system,size,welder,zone",
      "737-10200-RV-001,RV,2\",Hector,Mezzanine",
      "737-10250-HPUR-002,HPUR,1.5\",Nelvin,HVAC Mechanical",
      "737-10400-PV-003,PV,2\",Michael,Process Corridor",
    ];
    const blob = new Blob([sampleRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "swcs_iso_import_template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <option value="">— Unassigned —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </td>
      <td className="px-5 py-3 text-right whitespace-nowrap">
        <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="View ISO"><FileImage size={14} /></button>
        <button onClick={() => setEditingIso(iso)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 mr-1" title="Edit"><Edit2 size={14} /></button>
        <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">ISOMETRICS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{isos.length} TOTAL · {isos.filter((i) => i.welderId).length} ASSIGNED · {unassignedIsos.length} UNASSIGNED · {systems.length} SYSTEMS</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={bulkFileInputRef} type="file" accept=".csv" onChange={handleBulkImportFile} className="hidden" />
          <button
            onClick={downloadCsvTemplate}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-[10px] font-bold tracking-widest flex items-center gap-1 transition-colors rounded border border-slate-200"
            title="Download a sample CSV template"
          >
            <Download size={12} /> TEMPLATE
          </button>
          {onBulkImport && (
            <button
              onClick={() => bulkFileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 text-[10px] font-bold tracking-widest flex items-center gap-1 transition-all hover:scale-[1.02] rounded shadow-sm"
              title={zonePatternCount > 0 ? `Will auto-assign to ${zonePatternCount} zone pattern(s)` : "Draw zones with patterns first for auto-assign"}
            >
              <Upload size={12} /> BULK IMPORT CSV
              {zonePatternCount > 0 && (
                <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[9px] font-black ml-1">AUTO</span>
              )}
            </button>
          )}
          <button onClick={() => setShowSystemsModal(true)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-colors rounded shadow-sm">
            <Layers size={14} /> SYSTEMS
          </button>
          <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NEW ISO</button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ISO..." className={inputCls + " pl-9"} />
      </div>

      {isos.length === 0 ? <EmptyState icon={FileText} text="No ISOs registered." /> : filteredIsos.length === 0 ? (
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
                            <th className="text-left px-5 py-2 font-bold">PG.</th>
                            <th className="text-left px-5 py-2 font-bold hidden md:table-cell">DESCRIPTION</th>
                            <th className="text-left px-5 py-2 font-bold">REASSIGN</th>
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
                    <div className="font-bold text-amber-900">UNASSIGNED</div>
                    <div className="text-xs text-amber-600">Classified by system · size · page</div>
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
                                            <th className="text-left px-3 py-1.5 font-bold">PG.</th>
                                            <th className="text-left px-3 py-1.5 font-bold hidden md:table-cell">DESC.</th>
                                            <th className="text-left px-3 py-1.5 font-bold">ASSIGN A</th>
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
                                                  <option value="">— Unassigned —</option>
                                                  {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                                                </select>
                                              </td>
                                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                                <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="View ISO"><FileImage size={12} /></button>
                                                <button onClick={() => setEditingIso(iso)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 mr-1" title="Edit"><Edit2 size={12} /></button>
                                                <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50" title="Delete"><Trash2 size={12} /></button>
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
                            <div className="font-bold text-orange-900 text-sm">UNCLASSIFIED</div>
                            <div className="text-[10px] text-orange-600">Old ISOs without system/size — edit them</div>
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
                                      <Edit2 size={10} /> CLASSIFY
                                    </button>
                                  </td>
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <button onClick={() => setViewingIso(iso)} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 mr-1" title="View ISO"><FileImage size={12} /></button>
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
    <ModalShell title={editing ? "EDITAR DAILY LOG" : "NEW DAILY LOG"} onClose={onClose}>
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
  const [supports, setSupports] = useState(editing?.supports || "");
  const [linearFeet, setLinearFeet] = useState(editing?.linearFeet || "");
  const [comments, setComments] = useState(editing?.comments || "");

  const submit = () => {
    if (!iso.trim() || !weldNumber.trim()) return;
    onSave({
      size: size.trim(),
      machine: machine.trim(),
      iso: iso.trim().toUpperCase(),
      weldNumber: weldNumber.trim().toUpperCase(),
      bottle: bottle.trim(),
      program: program.trim(),
      head: head.trim(),
      system: system.trim(),
      supports: Number(supports) || 0,
      linearFeet: Number(linearFeet) || 0,
      comments: comments.trim(),
    });
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
      {/* === NEW: Supports & Linear Feet for Reports === */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
        <div className="text-[10px] font-black tracking-widest text-blue-900 mb-2 flex items-center gap-1">
          <TrendingUp size={11} /> QUANTITIES FOR REPORTS <span className="text-slate-500 font-semibold ml-1">(optional)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SUPPORTS INSTALLED">
            <input type="number" min="0" step="1" value={supports} onChange={(e) => setSupports(e.target.value)} className={inputCls} placeholder="0" />
          </Field>
          <Field label="LINEAR FEET (ft)">
            <input type="number" min="0" step="0.5" value={linearFeet} onChange={(e) => setLinearFeet(e.target.value)} className={inputCls} placeholder="0" />
          </Field>
        </div>
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
      <button class="print-btn" onclick="window.print()">🖨️ PRINT / SAVE PDF</button>
      <button class="close-btn" onclick="window.close()">✕ CLOSE</button>
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
    alert("Allow popups in your browser to generate PDF.");
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
                                  title="Export Daily Weld Log to PDF"
                                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded ml-2 flex items-center gap-1 transition-colors"
                                >
                                  <Download size={11} /> EXPORT PDF
                                </button>
                                <button onClick={() => { setEditingLog(log); setShowLogModal(true); }} className="text-slate-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded ml-1"><Edit2 size={12} /></button>
                                <button onClick={() => onDeleteLog(log.id)} className="text-slate-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                              </div>
                            </div>
                            {log.entries.length === 0 ? (
                              <div className="px-5 py-4 text-sm text-slate-400 italic">No welds in this log.</div>
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
                        <tr><td colSpan={11} className="px-4 py-6 text-center text-slate-400">No welds in this log.</td></tr>
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
            <option>Lack of fusion</option>
            <option>Lack of penetration</option>
            <option>Slag inclusion</option>
            <option>Socavadura (undercut)</option>
            <option>Grieta</option>
            <option>Mordedura</option>
            <option>Sobremonta excesiva</option>
            <option>Misalignment</option>
            <option>Color/oxidation</option>
            <option>Otro</option>
          </select>
        </Field>
      )}
      <Field label="COMMENTS (OPTIONAL)"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder="Additional notes..." /></Field>
      <Field label="QC INITIALS"><input value={qcInitial} onChange={(e) => setQcInitial(e.target.value)} className={inputCls}  maxLength={5} /></Field>
      <button onClick={submit} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 text-xs tracking-widest rounded transition-colors shadow-sm">REGISTER INSPECTION</button>
    </ModalShell>
  );
}

function InspectionsView({ role, logs, welders, inspections, onAdd, onDelete }) {
  const [showInspectModal, setShowInspectModal] = useState(null);
  const [expandedWelders, setExpandedWelders] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const allEntries = logs.flatMap((l) => l.entries.map((e) => ({ ...e, logId: l.id, logDate: l.date, welderId: l.welderId, jobNumber: l.jobNumber, weldRef: `${l.id}-${e.id}` })));
  const inspectedRefs = new Set(inspections.map((i) => i.weldRef));
  const pending = allEntries.filter((e) => !inspectedRefs.has(e.weldRef));

  // Group inspections by welder, then by date (uses the log's date, not the inspection date)
  const groupedInspections = welders.map((w) => {
    const welderInspections = inspections
      .map((insp) => {
        const entry = allEntries.find((e) => e.weldRef === insp.weldRef);
        return entry && entry.welderId === w.id ? { ...insp, entry } : null;
      })
      .filter(Boolean);

    // Group by logDate (date the welds were done, not when QC inspected)
    const byDate = {};
    welderInspections.forEach((insp) => {
      const d = insp.entry.logDate;
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(insp);
    });

    // Sort dates desc
    const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
    const datesArr = dates.map((d) => ({
      date: d,
      inspections: byDate[d].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }));

    const totalCount = welderInspections.length;
    const acceptedCount = welderInspections.filter((i) => i.status === "accepted").length;
    const rejectedCount = welderInspections.filter((i) => i.status === "rejected").length;

    return { welder: w, dates: datesArr, totalCount, acceptedCount, rejectedCount };
  }).filter((g) => g.totalCount > 0);

  // Also count inspections whose weld was deleted (entry not found) — show in "Otros" group
  const orphanInspections = inspections.filter((insp) => {
    const entry = allEntries.find((e) => e.weldRef === insp.weldRef);
    return !entry;
  });

  const toggleWelder = (id) => setExpandedWelders((p) => ({ ...p, [id]: !p[id] }));
  const toggleDate = (key) => setExpandedDates((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">QUALITY CONTROL</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">{pending.length} PENDING · {inspections.filter((i) => i.status === "rejected").length} REJECTED · {inspections.filter((i) => i.status === "accepted").length} ACCEPTED</p>
      </div>
      {role === "qc" && (
        <div className="bg-cyan-50 border border-cyan-200 px-4 py-3 text-xs text-cyan-800 flex items-start gap-2 rounded">
          <Eye size={14} className="mt-0.5 flex-shrink-0" />
          <div>As QC inspector, you are the only one who can approve or reject welds.</div>
        </div>
      )}

      {/* PENDING SECTION */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-blue-700">PENDING INSPECTION ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">No welds pending.</div>
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
                            <button onClick={() => setShowInspectModal(e)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-xs font-bold tracking-widest rounded transition-colors">INSPECT</button>
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

      {/* INSPECTED SECTION — grouped by welder → date */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-slate-700">COMPLETED INSPECTIONS ({inspections.length})</h3>
        {inspections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">No inspections registered.</div>
        ) : (
          <div className="space-y-2">
            {groupedInspections.map(({ welder: w, dates, totalCount, acceptedCount, rejectedCount }) => {
              const isExpanded = expandedWelders[w.id];
              return (
                <div key={w.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleWelder(w.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
                        <HardHat size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{w.name}</div>
                        <div className="text-xs text-slate-500 font-mono">#{w.welderId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {totalCount} {totalCount === 1 ? "inspection" : "inspections"}
                      </span>
                      {acceptedCount > 0 && (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✓ {acceptedCount}
                        </span>
                      )}
                      {rejectedCount > 0 && (
                        <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✗ {rejectedCount}
                        </span>
                      )}
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100">
                      {dates.map(({ date, inspections: dateInsps }) => {
                        const dateKey = `${w.id}-${date}`;
                        const isDateExpanded = expandedDates[dateKey];
                        const dateAccepted = dateInsps.filter((i) => i.status === "accepted").length;
                        const dateRejected = dateInsps.filter((i) => i.status === "rejected").length;
                        return (
                          <div key={date} className="bg-white">
                            <button
                              onClick={() => toggleDate(dateKey)}
                              className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-wrap">
                                <Calendar size={14} className="text-blue-700" />
                                <span className="text-blue-700 font-bold text-sm">
                                  {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">{dateInsps.length} {dateInsps.length === 1 ? "weld" : "welds"}:</span>
                                {dateAccepted > 0 && <span className="text-emerald-600 font-bold">✓{dateAccepted}</span>}
                                {dateRejected > 0 && <span className="text-red-600 font-bold">✗{dateRejected}</span>}
                                {isDateExpanded ? <ChevronDown size={16} className="text-slate-400 ml-2" /> : <ChevronRight size={16} className="text-slate-400 ml-2" />}
                              </div>
                            </button>

                            {isDateExpanded && (
                              <div className="px-3 pb-3 space-y-2">
                                {dateInsps.map((insp) => {
                                  const entry = insp.entry;
                                  return (
                                    <div key={insp.id} className={`bg-white border-l-4 border border-slate-200 p-3 rounded-r ${insp.status === "rejected" ? "border-l-red-500" : "border-l-emerald-500"}`}>
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded ${insp.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                              {insp.status === "accepted" ? "✓ ACCEPTED" : "✗ REJECTED"}
                                            </span>
                                            <span className="text-xs text-slate-500">Inspected: {new Date(insp.date).toLocaleDateString("en-US")}</span>
                                            <span className="text-xs text-cyan-700 font-semibold">QC: {insp.qcInitial}</span>
                                          </div>
                                          <div className="text-xs">
                                            <span className="font-mono text-blue-700">{entry.iso}</span> · Weld <span className="font-mono font-bold">{entry.weldNumber}</span> · <span className="font-mono">{entry.system}</span>
                                          </div>
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
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Orphan inspections (welds that were deleted) */}
            {orphanInspections.length > 0 && (
              <div className="bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-xs font-bold tracking-widest text-amber-800">INSPECTIONS WITHOUT WELD ({orphanInspections.length})</span>
                  <span className="text-[10px] text-amber-600 italic">— the original weld was deleted</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {orphanInspections.map((insp) => (
                    <div key={insp.id} className={`p-3 border-l-4 ${insp.status === "rejected" ? "border-l-red-500" : "border-l-emerald-500"}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded ${insp.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                              {insp.status === "accepted" ? "✓ ACCEPTED" : "✗ REJECTED"}
                            </span>
                            <span className="text-xs text-slate-500">{new Date(insp.date).toLocaleDateString("en-US")}</span>
                            <span className="text-xs text-cyan-700 font-semibold">QC: {insp.qcInitial}</span>
                          </div>
                          <div className="text-xs text-slate-400">Weld deleted</div>
                        </div>
                        {role === "qc" && <button onClick={() => onDelete(insp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <option value="">— Unassigned —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </Field>
      <button onClick={submit} className={btnPrimaryFull}>REGISTER</button>
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
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{visibleTools.length} REGISTERED</p>
        </div>
        {visibleTools.length === 0 ? <EmptyState icon={Wrench} text="No tienes tools assigned." /> : (
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
          <h2 className="text-2xl font-black tracking-tight text-slate-900">TOOLS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{visibleTools.length} REGISTERED · {welders.length} WELDERS</p>
        </div>
        {canManage && <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NEW</button>}
      </div>

      {visibleTools.length === 0 ? <EmptyState icon={Wrench} text="No tools registered." /> : (
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
                      {welderTools.length} {welderTools.length === 1 ? "tool" : "tools"}
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {welderTools.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-slate-400 italic">No tools asignadas a este soldador.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                          <tr>
                            <th className="text-left px-5 py-2 font-bold">HERRAMIENTA</th>
                            <th className="text-left px-5 py-2 font-bold">SERIAL</th>
                            {canManage && <th className="text-left px-5 py-2 font-bold">REASSIGN</th>}
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
                                    <option value="">— Unassigned —</option>
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
                    <div className="font-bold text-amber-900">UNASSIGNED</div>
                    <div className="text-xs text-amber-600">Herramientas sin soldador</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {unassignedTools.length} {unassignedTools.length === 1 ? "tool" : "tools"}
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
                        {canManage && <th className="text-left px-5 py-2 font-bold">ASSIGN A</th>}
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
                                <option value="">— Unassigned —</option>
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

// ============================================================
// REPORTS VIEW — easy executive summaries for bosses & clients
// ============================================================
function ReportsView({ data, currentUser }) {
  const [period, setPeriod] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [expandedWelders, setExpandedWelders] = useState({});
  const [showSystemsCard, setShowSystemsCard] = useState(false);
  const [showIsosCard, setShowIsosCard] = useState(false);
  const [showDailyTrend, setShowDailyTrend] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const toggleWelder = (id) => setExpandedWelders((p) => ({ ...p, [id]: !p[id] }));

  // === Compute date range from preset ===
  const today = new Date();
  const toISO = (d) => d.toISOString().split("T")[0];
  const addDays = (d, days) => { const n = new Date(d); n.setDate(n.getDate() + days); return n; };
  const startOfWeek = (d) => { const n = new Date(d); const day = n.getDay() || 7; n.setDate(n.getDate() - day + 1); return n; };

  const { start, end, label } = (() => {
    const t = toISO(today);
    if (period === "today") return { start: t, end: t, label: "TODAY" };
    if (period === "yesterday") { const y = toISO(addDays(today, -1)); return { start: y, end: y, label: "YESTERDAY" }; }
    if (period === "thisweek") { const s = toISO(startOfWeek(today)); return { start: s, end: t, label: "THIS WEEK" }; }
    if (period === "lastweek") { const sow = startOfWeek(today); const s = toISO(addDays(sow, -7)); const e = toISO(addDays(sow, -1)); return { start: s, end: e, label: "LAST WEEK" }; }
    if (period === "thismonth") { const s = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`; return { start: s, end: t, label: "THIS MONTH" }; }
    if (period === "lastmonth") { const d = new Date(today.getFullYear(), today.getMonth() - 1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); return { start: toISO(d), end: toISO(e), label: "LAST MONTH" }; }
    if (period === "custom" && customStart && customEnd) return { start: customStart, end: customEnd, label: "CUSTOM" };
    return { start: t, end: t, label: "TODAY" };
  })();

  // === Filter logs to range ===
  const filteredLogs = (data.dailyLogs || []).filter((l) => l.date >= start && l.date <= end);

  const getSystemFromEntry = (entry) => {
    if (entry.system) return entry.system;
    const iso = (data.isos || []).find((i) => i.number === entry.iso);
    if (!iso) return "—";
    const sys = (data.systems || []).find((s) => s.id === iso.systemId);
    return sys?.name || "—";
  };

  // === Aggregate totals ===
  const activeWelders = new Set();
  const isosWorked = new Set();
  const systemsWorked = new Set();
  let totalWelds = 0, totalSupports = 0, totalLinearFeet = 0;
  filteredLogs.forEach((l) => {
    activeWelders.add(l.welderId);
    (l.entries || []).forEach((e) => {
      totalWelds++;
      totalSupports += Number(e.supports) || 0;
      totalLinearFeet += Number(e.linearFeet) || 0;
      if (e.iso) isosWorked.add(e.iso);
      const sys = getSystemFromEntry(e);
      if (sys && sys !== "—") systemsWorked.add(sys);
    });
  });

  // === Inspections in range ===
  const inspectionsInRange = (data.inspections || []).filter((i) => {
    if (!i.weldRef) return false;
    const logId = i.weldRef.split("-")[0];
    const log = (data.dailyLogs || []).find((l) => l.id === logId);
    return log && log.date >= start && log.date <= end;
  });
  const accepted = inspectionsInRange.filter((i) => i.status === "accepted").length;
  const rejected = inspectionsInRange.filter((i) => i.status === "rejected").length;
  const inspTotal = accepted + rejected;
  const passRate = inspTotal > 0 ? Math.round((accepted / inspTotal) * 100) : null;

  // === Coupons in range ===
  const couponsInRange = (data.coupons || []).filter((c) => {
    const cd = (c.createdAt || "").split("T")[0];
    return cd && cd >= start && cd <= end;
  });

  // === By welder breakdown (enriched: systems, isos, coupons per welder) ===
  const welderBreakdown = (data.welders || []).map((w) => {
    const wlogs = filteredLogs.filter((l) => l.welderId === w.id);
    let welds = 0, supports = 0, linearFeet = 0;
    const wSystems = new Set();
    const wIsos = new Set();
    const wIsoSizes = {}; // iso -> {welds, supports, linearFeet, weldNumbers}
    wlogs.forEach((l) => (l.entries || []).forEach((e) => {
      welds++;
      supports += Number(e.supports) || 0;
      linearFeet += Number(e.linearFeet) || 0;
      const sys = getSystemFromEntry(e);
      if (sys && sys !== "—") wSystems.add(sys);
      if (e.iso) {
        wIsos.add(e.iso);
        if (!wIsoSizes[e.iso]) wIsoSizes[e.iso] = { welds: 0, supports: 0, linearFeet: 0, weldNumbers: [] };
        wIsoSizes[e.iso].welds++;
        wIsoSizes[e.iso].supports += Number(e.supports) || 0;
        wIsoSizes[e.iso].linearFeet += Number(e.linearFeet) || 0;
        if (e.weldNumber) wIsoSizes[e.iso].weldNumbers.push({ number: e.weldNumber, date: l.date });
      }
    }));
    const wInsp = inspectionsInRange.filter((i) => {
      const logId = i.weldRef?.split("-")[0];
      const log = filteredLogs.find((l) => l.id === logId);
      return log && log.welderId === w.id;
    });
    const wAccepted = wInsp.filter((i) => i.status === "accepted").length;
    const wRejected = wInsp.filter((i) => i.status === "rejected").length;
    const wPassRate = (wAccepted + wRejected) > 0 ? Math.round((wAccepted / (wAccepted + wRejected)) * 100) : null;
    const wCoupons = (data.coupons || []).filter((c) => {
      const cd = (c.createdAt || "").split("T")[0];
      return c.welderId === w.id && cd && cd >= start && cd <= end;
    });
    const sortW = (arr) => {
      // arr is [{number, date}] — dedupe by number keeping earliest date, then sort numerically
      const map = {};
      arr.forEach((x) => {
        if (!x.number) return;
        if (!map[x.number] || x.date < map[x.number]) map[x.number] = x.date;
      });
      return Object.entries(map)
        .map(([number, date]) => ({ number, date }))
        .sort((a, b) => (parseInt(a.number.replace(/\D/g, ""), 10) || 0) - (parseInt(b.number.replace(/\D/g, ""), 10) || 0));
    };
    const wIsoRows = Object.entries(wIsoSizes).map(([num, v]) => ({ number: num, ...v, weldNumbers: sortW(v.weldNumbers || []) })).sort((a, b) => b.welds - a.welds);
    return {
      welder: w, welds, supports, linearFeet,
      systems: Array.from(wSystems).sort(),
      isos: Array.from(wIsos),
      isoRows: wIsoRows,
      coupons: wCoupons.length,
      passRate: wPassRate,
      rejections: wRejected,
      inspTotal: wAccepted + wRejected,
      accepted: wAccepted,
    };
  }).filter((r) => r.welds > 0 || r.supports > 0 || r.linearFeet > 0)
    .sort((a, b) => b.welds - a.welds);

  // === By system breakdown ===
  const systemBreakdown = {};
  filteredLogs.forEach((l) => (l.entries || []).forEach((e) => {
    const sys = getSystemFromEntry(e);
    if (!systemBreakdown[sys]) systemBreakdown[sys] = { welds: 0, supports: 0, linearFeet: 0 };
    systemBreakdown[sys].welds++;
    systemBreakdown[sys].supports += Number(e.supports) || 0;
    systemBreakdown[sys].linearFeet += Number(e.linearFeet) || 0;
  }));
  const systemRows = Object.entries(systemBreakdown).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.welds - a.welds);

  // === By ISO breakdown (with weld numbers + welders) ===
  const isoBreakdown = {};
  filteredLogs.forEach((l) => (l.entries || []).forEach((e) => {
    if (!e.iso) return;
    if (!isoBreakdown[e.iso]) isoBreakdown[e.iso] = { welds: 0, supports: 0, linearFeet: 0, weldNumbers: [], welders: new Set(), system: "" };
    isoBreakdown[e.iso].welds++;
    isoBreakdown[e.iso].supports += Number(e.supports) || 0;
    isoBreakdown[e.iso].linearFeet += Number(e.linearFeet) || 0;
    if (e.weldNumber) isoBreakdown[e.iso].weldNumbers.push({ number: e.weldNumber, date: l.date });
    const w = (data.welders || []).find((x) => x.id === l.welderId);
    if (w) isoBreakdown[e.iso].welders.add(w.name);
    if (!isoBreakdown[e.iso].system) isoBreakdown[e.iso].system = getSystemFromEntry(e);
  }));
  // Natural-sort weld numbers (FW01 < FW02 < FW10) and build display string
  const sortWeldNums = (arr) => {
    // arr is [{number, date}] — dedupe by number (keep earliest date), sort by number numerically
    const map = {};
    arr.forEach((x) => {
      if (!x.number) return;
      if (!map[x.number] || x.date < map[x.number]) map[x.number] = x.date;
    });
    return Object.entries(map)
      .map(([number, date]) => ({ number, date }))
      .sort((a, b) => (parseInt(a.number.replace(/\D/g, ""), 10) || 0) - (parseInt(b.number.replace(/\D/g, ""), 10) || 0));
  };
  const isoRows = Object.entries(isoBreakdown).map(([number, v]) => ({
    number,
    welds: v.welds,
    supports: v.supports,
    linearFeet: v.linearFeet,
    weldNumbers: sortWeldNums(v.weldNumbers),
    welderNames: Array.from(v.welders).join(", "),
    system: v.system,
  })).sort((a, b) => b.welds - a.welds);

  // === Daily trend ===
  const dailyTrend = {};
  filteredLogs.forEach((l) => {
    if (!dailyTrend[l.date]) dailyTrend[l.date] = { welds: 0, supports: 0, linearFeet: 0 };
    (l.entries || []).forEach((e) => {
      dailyTrend[l.date].welds++;
      dailyTrend[l.date].supports += Number(e.supports) || 0;
      dailyTrend[l.date].linearFeet += Number(e.linearFeet) || 0;
    });
  });
  const trendRows = Object.entries(dailyTrend).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));
  const maxDailyWelds = Math.max(1, ...trendRows.map((r) => r.welds));

  const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtDateRange = () => start === end ? fmtDate(start) : `${fmtDate(start)} — ${fmtDate(end)}`;
  const fmtNum = (n) => Number(n).toLocaleString("en-US");

  // === COPY SUMMARY (WhatsApp-ready) ===
  const copySummary = () => {
    const topWelder = welderBreakdown[0];
    const welderNames = welderBreakdown.slice(0, 6).map((w) => w.welder.name.split(" ")[0]).join(", ");
    const text = `📊 WELD REPORT — ${label}
${fmtDateRange()}

✅ ${fmtNum(totalWelds)} welds completed
🔧 ${fmtNum(totalSupports)} supports installed
📏 ${fmtNum(totalLinearFeet)} ft of pipe
👷 ${activeWelders.size} welders active${welderNames ? ` (${welderNames})` : ""}
📋 ${isosWorked.size} ISOs advanced
🧪 ${couponsInRange.length} coupons tested
${passRate !== null ? `✓ ${passRate}% inspection pass rate${rejected > 0 ? ` (${rejected} rejection${rejected === 1 ? "" : "s"})` : ""}` : "✓ No inspections yet"}
${topWelder ? `\n🏆 Top performer: ${topWelder.welder.name} — ${fmtNum(topWelder.welds)} welds` : ""}
📂 Systems: ${Array.from(systemsWorked).join(", ") || "—"}

— Generated by SWCS`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback("✅ Copied! Paste in WhatsApp, email, or text.");
      setTimeout(() => setCopyFeedback(""), 3500);
    }).catch(() => {
      setCopyFeedback("⚠️ Could not copy. Please select & copy manually.");
      setTimeout(() => setCopyFeedback(""), 3500);
    });
  };

  const copyDetailed = () => {
    let text = `📊 DETAILED WELD REPORT — ${label}\n${fmtDateRange()}\n\nTOTALS\n`;
    text += `• ${fmtNum(totalWelds)} welds · ${fmtNum(totalSupports)} supports · ${fmtNum(totalLinearFeet)} ft\n`;
    text += `• ${activeWelders.size} welders · ${isosWorked.size} ISOs · ${couponsInRange.length} coupons\n`;
    if (passRate !== null) text += `• ${passRate}% pass rate (${accepted} accepted · ${rejected} rejected)\n`;
    text += `\n`;
    if (welderBreakdown.length > 0) {
      text += `BY WELDER\n`;
      welderBreakdown.forEach((w) => {
        text += `• ${w.welder.name}: ${w.welds} welds, ${w.supports} supports, ${w.linearFeet} ft`;
        if (w.rejections > 0) text += ` · ⚠️ ${w.rejections} rejected`;
        text += `\n`;
      });
      text += `\n`;
    }
    if (systemRows.length > 0) {
      text += `BY SYSTEM\n`;
      systemRows.forEach((s) => { text += `• ${s.name}: ${s.welds} welds, ${s.supports} supports, ${s.linearFeet} ft\n`; });
    }
    text += `\n— Generated by SWCS`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback("✅ Detailed report copied.");
      setTimeout(() => setCopyFeedback(""), 3500);
    });
  };

  const exportCSV = () => {
    const rows = [["Date", "Welder", "ISO", "Weld #", "Size", "System", "Supports", "Linear Feet", "Comments"]];
    filteredLogs.forEach((l) => {
      const w = (data.welders || []).find((x) => x.id === l.welderId);
      (l.entries || []).forEach((e) => {
        rows.push([
          l.date, w?.name || "", e.iso || "", e.weldNumber || "", e.size || "",
          getSystemFromEntry(e), e.supports || 0, e.linearFeet || 0,
          (e.comments || "").replace(/"/g, '""').replace(/[\r\n]+/g, " "),
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `swcs_report_${start}_to_${end}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    const welderRowsHTML = welderBreakdown.map((r) => `<tr><td style="font-weight:700">${r.welder.name}</td><td style="text-align:right">${fmtNum(r.welds)}</td><td style="text-align:right">${fmtNum(r.supports)}</td><td style="text-align:right">${fmtNum(r.linearFeet)}</td><td style="text-align:right">${r.passRate !== null ? r.passRate + "%" : "—"}</td></tr>`).join("");
    const systemRowsHTML = systemRows.map((r) => `<tr><td style="font-weight:700">${r.name}</td><td style="text-align:right">${fmtNum(r.welds)}</td><td style="text-align:right">${fmtNum(r.supports)}</td><td style="text-align:right">${fmtNum(r.linearFeet)}</td></tr>`).join("");
    const isoRowsHTML = isoRows.map((r) => `<tr>
      <td style="font-family:monospace;font-weight:700;color:#1e40af">${r.number}</td>
      <td style="font-size:8pt;color:#475569">${r.system || "—"}</td>
      <td style="font-size:8pt;color:#475569">${r.welderNames || "—"}</td>
      <td style="text-align:right;font-weight:700">${fmtNum(r.welds)}</td>
      <td style="text-align:right">${fmtNum(r.supports)}</td>
      <td style="text-align:right">${fmtNum(r.linearFeet)}</td>
      <td style="font-family:monospace;font-size:7.5pt;color:#334155;word-break:break-word;line-height:1.5">${r.weldNumbers.length ? r.weldNumbers.map((wn) => `${wn.number}<span style="color:#94a3b8;font-size:7pt;"> (${wn.date ? wn.date.slice(5).replace("-", "/") : "—"})</span>`).join(", ") : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Weld Report — ${label} — ${fmtDateRange()}</title>
<style>@page{size:letter;margin:0.5in}body{font-family:Helvetica,Arial,sans-serif;color:#0f172a;margin:0;padding:0}
.pb{position:fixed;top:0;left:0;right:0;background:#1e3a8a;color:white;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;z-index:1000}
.pb button{padding:8px 16px;border-radius:6px;border:none;font-weight:700;cursor:pointer;font-size:13px;letter-spacing:1px}
.print-btn{background:#10b981;color:white}.close-btn{background:#ef4444;color:white;margin-left:8px}
.content{padding-top:70px;max-width:7.5in;margin:0 auto;padding-left:0.25in;padding-right:0.25in}
@media print{.no-print{display:none !important}.content{padding-top:0}}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #1e3a8a;margin-bottom:20px}
.hdr .logo{font-size:28pt;font-weight:900;color:#1e3a8a;letter-spacing:-1pt}
.hdr .tag{font-size:7pt;color:#64748b;letter-spacing:3pt;text-transform:uppercase;font-weight:600}
.hdr .meta{text-align:right;font-size:9pt;color:#334155}
h1{font-size:22pt;font-weight:900;color:#0f172a;margin:0 0 4px 0}
.sub{font-size:11pt;color:#64748b;font-weight:600;margin-bottom:24px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.kpi{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:8pt;padding:14pt;text-align:center}
.kpi .num{font-size:28pt;font-weight:900;color:#1e40af;line-height:1}
.kpi .lbl{font-size:8pt;color:#1e3a8a;letter-spacing:1.5pt;font-weight:800;text-transform:uppercase;margin-top:6pt}
.section-title{font-size:12pt;font-weight:900;color:#0f172a;letter-spacing:1pt;text-transform:uppercase;margin:20pt 0 8pt 0;padding-bottom:4pt;border-bottom:1px solid #cbd5e1}
.section-subtitle{font-size:8pt;color:#64748b;font-weight:600;margin-top:-4pt;margin-bottom:8pt;font-style:italic}
table{width:100%;border-collapse:collapse;margin-bottom:16pt;font-size:10pt;table-layout:fixed}
th{background:#1e3a8a;color:white;padding:8pt;font-size:8pt;font-weight:700;letter-spacing:1pt;text-align:left;text-transform:uppercase;vertical-align:middle}
th.right{text-align:right}
td{padding:7pt 8pt;border-bottom:1px solid #e2e8f0;vertical-align:top;word-break:break-word}
tr:nth-child(even) td{background:#f8fafc}
.simple-table{table-layout:auto}
.simple-table th:not(:first-child){text-align:right}
.iso-table th{font-size:7pt;padding:6pt 6pt}
.iso-table td{font-size:9pt;padding:6pt 6pt}
.iso-table col.c1{width:1.3in}
.iso-table col.c2{width:0.55in}
.iso-table col.c3{width:1.1in}
.iso-table col.c4{width:0.5in}
.iso-table col.c5{width:0.65in}
.iso-table col.c6{width:0.65in}
.iso-table col.c7{width:1.75in}
.ft{margin-top:24pt;padding-top:12pt;border-top:1px solid #cbd5e1;font-size:8pt;color:#64748b;text-align:center}
tr{page-break-inside:avoid}
</style></head><body>
<div class="pb no-print"><div style="font-weight:700;letter-spacing:2px">📊 WELD REPORT — ${label}</div><div><button class="print-btn" onclick="window.print()">🖨️ PRINT / SAVE PDF</button><button class="close-btn" onclick="window.close()">✕ CLOSE</button></div></div>
<div class="content">
<div class="hdr"><div><div class="logo">SWCS</div><div class="tag">Sanitary Weld Control System</div></div><div class="meta"><div><strong>Report Period:</strong> ${label}</div><div>${fmtDateRange()}</div><div style="margin-top:6pt;font-size:8pt;color:#94a3b8">Generated ${new Date().toLocaleString("en-US")}</div></div></div>
<h1>Project Progress Report</h1>
<div class="sub">${fmtDateRange()}</div>
<div class="kpi-grid">
<div class="kpi"><div class="num">${fmtNum(totalWelds)}</div><div class="lbl">Welds Completed</div></div>
<div class="kpi"><div class="num">${fmtNum(totalSupports)}</div><div class="lbl">Supports Installed</div></div>
<div class="kpi"><div class="num">${fmtNum(totalLinearFeet)}</div><div class="lbl">Linear Feet</div></div>
<div class="kpi"><div class="num">${activeWelders.size}</div><div class="lbl">Active Welders</div></div>
<div class="kpi"><div class="num">${isosWorked.size}</div><div class="lbl">ISOs Advanced</div></div>
<div class="kpi"><div class="num">${passRate !== null ? passRate + "%" : "—"}</div><div class="lbl">Pass Rate</div></div>
</div>
${welderBreakdown.length > 0 ? `<div class="section-title">Breakdown by Welder</div>
<table class="simple-table"><thead><tr><th>Welder</th><th class="right">Welds</th><th class="right">Supports</th><th class="right">Linear Feet</th><th class="right">Pass Rate</th></tr></thead>
<tbody>${welderRowsHTML}</tbody></table>` : ""}
${systemRows.length > 0 ? `<div class="section-title">Breakdown by System</div>
<table class="simple-table"><thead><tr><th>System</th><th class="right">Welds</th><th class="right">Supports</th><th class="right">Linear Feet</th></tr></thead>
<tbody>${systemRowsHTML}</tbody></table>` : ""}
${isoRows.length > 0 ? `<div class="section-title">Breakdown by ISO</div>
<div class="section-subtitle">${isoRows.length} ISO${isoRows.length === 1 ? "" : "s"} worked · each weld number shown with the date it was completed (MM/DD format)</div>
<table class="iso-table">
<colgroup><col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5"><col class="c6"><col class="c7"></colgroup>
<thead><tr>
<th>ISO Number</th>
<th>System</th>
<th>Welder(s)</th>
<th class="right">Welds</th>
<th class="right">Supports</th>
<th class="right">Lin. Ft</th>
<th>Weld Numbers · Dates</th>
</tr></thead>
<tbody>${isoRowsHTML}</tbody></table>` : ""}
<div class="ft">Report generated by SWCS · Sanitary Weld Control System · ${new Date().toISOString().split("T")[0]}</div>
</div></body></html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* === TOP === */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">REPORTS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">
            WELDS · SUPPORTS · LINEAR FEET — BY WELDER AND COMBINED TOTALS
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={copySummary} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded transition-all hover:scale-[1.02] flex items-center gap-1 shadow-sm">
            <ClipboardList size={11} /> COPY FOR WHATSAPP
          </button>
          <button onClick={copyDetailed} className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded transition-colors flex items-center gap-1 shadow-sm">
            <FileText size={11} /> COPY DETAILED
          </button>
          <button onClick={exportCSV} className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded transition-colors flex items-center gap-1 shadow-sm">
            <Download size={11} /> EXPORT CSV
          </button>
          <button onClick={exportPDF} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded transition-all hover:scale-[1.02] flex items-center gap-1 shadow-sm">
            <FileCheck size={11} /> EXPORT PDF
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded flex items-center gap-2">
          <CheckCircle2 size={14} /> {copyFeedback}
        </div>
      )}

      {/* === PERIOD SELECTOR === */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="text-[10px] font-black tracking-widest text-slate-500 mb-2">REPORT PERIOD</div>
        <div className="flex flex-wrap gap-2">
          {[["today","TODAY"],["yesterday","YESTERDAY"],["thisweek","THIS WEEK"],["lastweek","LAST WEEK"],["thismonth","THIS MONTH"],["lastmonth","LAST MONTH"],["custom","CUSTOM"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setPeriod(id)}
              className={`text-[10px] font-black tracking-widest px-3 py-2 rounded border transition-all ${period === id ? "bg-blue-700 border-blue-700 text-white shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              {lbl}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="FROM"><input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className={inputCls} /></Field>
            <Field label="TO"><input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className={inputCls} /></Field>
          </div>
        )}
        <div className="mt-3 text-xs text-slate-600 font-semibold">
          Showing: <span className="text-blue-700 font-bold">{fmtDateRange()}</span>
          <span className="text-slate-400"> · {filteredLogs.length} daily logs</span>
        </div>
      </div>

      {/* === WELDER CARDS (Daily Log style) === */}
      {welderBreakdown.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-slate-500" />
            <span className="text-xs font-black tracking-widest text-slate-500">BY WELDER ({welderBreakdown.length})</span>
          </div>
          <div className="space-y-2">
            {welderBreakdown.map((r, i) => {
              const isExpanded = expandedWelders[r.welder.id];
              const passColor = r.passRate === null ? "text-slate-400" : r.passRate >= 90 ? "text-emerald-700" : r.passRate >= 70 ? "text-amber-700" : "text-red-700";
              return (
                <div key={r.welder.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleWelder(r.welder.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 relative">
                        <HardHat size={20} />
                        {i === 0 && welderBreakdown.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow">1</span>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-bold text-slate-900 truncate">{r.welder.name}</div>
                        <div className="text-xs text-slate-500 font-mono">#{r.welder.welderId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="hidden sm:flex gap-1.5">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black px-2 py-1 rounded-full tracking-wider">
                          {fmtNum(r.welds)} WELDS
                        </span>
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full tracking-wider">
                          {fmtNum(r.supports)} SUP
                        </span>
                        <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black px-2 py-1 rounded-full tracking-wider">
                          {fmtNum(r.linearFeet)} FT
                        </span>
                        {r.passRate !== null && (
                          <span className={`bg-white border border-slate-200 text-[10px] font-black px-2 py-1 rounded-full tracking-wider ${passColor}`}>
                            {r.passRate}%
                          </span>
                        )}
                      </div>
                      <div className="sm:hidden flex gap-1 text-[10px] font-black">
                        <span className="text-blue-700">{fmtNum(r.welds)}W</span>
                        <span className="text-emerald-700">{fmtNum(r.supports)}S</span>
                        <span className="text-purple-700">{fmtNum(r.linearFeet)}&apos;</span>
                      </div>
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-white border-l-4 border-blue-500 rounded p-3 shadow-sm">
                          <div className="text-[9px] font-black tracking-widest text-blue-700">WELDS</div>
                          <div className="text-3xl font-black text-blue-900 mt-1">{fmtNum(r.welds)}</div>
                        </div>
                        <div className="bg-white border-l-4 border-emerald-500 rounded p-3 shadow-sm">
                          <div className="text-[9px] font-black tracking-widest text-emerald-700">SUPPORTS</div>
                          <div className="text-3xl font-black text-emerald-900 mt-1">{fmtNum(r.supports)}</div>
                        </div>
                        <div className="bg-white border-l-4 border-purple-500 rounded p-3 shadow-sm">
                          <div className="text-[9px] font-black tracking-widest text-purple-700">LINEAR FEET</div>
                          <div className="text-3xl font-black text-purple-900 mt-1">{fmtNum(r.linearFeet)}</div>
                        </div>
                        <div className={`bg-white border-l-4 rounded p-3 shadow-sm ${r.passRate === null ? "border-slate-300" : r.passRate >= 90 ? "border-emerald-500" : r.passRate >= 70 ? "border-amber-500" : "border-red-500"}`}>
                          <div className={`text-[9px] font-black tracking-widest ${passColor}`}>PASS RATE</div>
                          <div className={`text-3xl font-black mt-1 ${r.passRate === null ? "text-slate-400" : r.passRate >= 90 ? "text-emerald-900" : r.passRate >= 70 ? "text-amber-900" : "text-red-900"}`}>
                            {r.passRate !== null ? r.passRate + "%" : "—"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            {r.inspTotal > 0 ? `${r.accepted}/${r.inspTotal} welds` : "no inspections"}
                            {r.rejections > 0 && <span className="ml-1 text-red-600 font-bold">⚠ {r.rejections} rej.</span>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white rounded p-3 border border-slate-200">
                          <div className="text-[9px] font-black tracking-widest text-slate-500 mb-1">SYSTEMS WORKED</div>
                          <div className="font-mono font-bold text-blue-700 text-sm">
                            {r.systems.length > 0 ? r.systems.join(" · ") : <span className="text-slate-400">—</span>}
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 border border-slate-200">
                          <div className="text-[9px] font-black tracking-widest text-slate-500 mb-1">ISOs ADVANCED</div>
                          <div className="font-bold text-slate-900 text-sm">{r.isos.length} <span className="text-slate-500 font-normal">ISO{r.isos.length === 1 ? "" : "s"}</span></div>
                        </div>
                        <div className="bg-white rounded p-3 border border-slate-200">
                          <div className="text-[9px] font-black tracking-widest text-slate-500 mb-1">COUPONS TESTED</div>
                          <div className="font-bold text-slate-900 text-sm">{r.coupons}</div>
                        </div>
                      </div>

                      {r.isoRows.length > 0 && (
                        <div className="bg-white rounded border border-slate-200 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-black tracking-widest text-slate-600">
                            PER-ISO BREAKDOWN · WELD NUMBERS WITH DATES
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                  <th className="px-3 py-2 text-left text-[9px] font-black tracking-widest text-slate-500 w-32">ISO</th>
                                  <th className="px-2 py-2 text-right text-[9px] font-black tracking-widest text-slate-500 w-14">WELDS</th>
                                  <th className="px-2 py-2 text-right text-[9px] font-black tracking-widest text-slate-500 w-14">SUP</th>
                                  <th className="px-2 py-2 text-right text-[9px] font-black tracking-widest text-slate-500 w-14">FEET</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-black tracking-widest text-slate-500">WELD #s</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.isoRows.map((row) => (
                                  <tr key={row.number} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 align-top">
                                    <td className="px-3 py-2 font-mono font-bold text-blue-700 text-xs">{row.number}</td>
                                    <td className="px-2 py-2 text-right font-mono font-bold text-slate-900">{fmtNum(row.welds)}</td>
                                    <td className="px-2 py-2 text-right font-mono text-emerald-700">{fmtNum(row.supports)}</td>
                                    <td className="px-2 py-2 text-right font-mono text-purple-700">{fmtNum(row.linearFeet)}</td>
                                    <td className="px-3 py-2 font-mono text-[10px] text-slate-700 break-words leading-relaxed">
                                      {(row.weldNumbers || []).length === 0 ? (
                                        <span className="text-slate-400 italic">—</span>
                                      ) : (
                                        row.weldNumbers.map((wn, idx) => (
                                          <span key={idx}>
                                            <span className="font-bold text-slate-800">{wn.number}</span>
                                            <span className="text-slate-400 text-[9px]"> ({wn.date ? wn.date.slice(5).replace("-", "/") : "—"})</span>
                                            {idx < row.weldNumbers.length - 1 && ", "}
                                          </span>
                                        ))
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <div className="text-slate-500 font-bold text-sm">No daily logs in this period</div>
          <div className="text-slate-400 text-xs mt-1">Try selecting a different date range above</div>
        </div>
      ) : null}

      {systemRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button onClick={() => setShowSystemsCard(!showSystemsCard)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-blue-700" />
              <span className="font-black text-slate-900 text-sm">BY SYSTEM</span>
              <span className="text-xs text-slate-500">({systemRows.length})</span>
            </div>
            {showSystemsCard ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          </button>
          {showSystemsCard && (
            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-black tracking-widest text-slate-500">SYSTEM</th>
                    <th className="px-4 py-2 text-right text-[10px] font-black tracking-widest text-slate-500">WELDS</th>
                    <th className="px-4 py-2 text-right text-[10px] font-black tracking-widest text-slate-500">SUPPORTS</th>
                    <th className="px-4 py-2 text-right text-[10px] font-black tracking-widest text-slate-500">LINEAR FEET</th>
                  </tr>
                </thead>
                <tbody>
                  {systemRows.map((r) => (
                    <tr key={r.name} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">{r.name}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">{fmtNum(r.welds)}</td>
                      <td className="px-4 py-2 text-right font-mono text-emerald-700">{fmtNum(r.supports)}</td>
                      <td className="px-4 py-2 text-right font-mono text-purple-700">{fmtNum(r.linearFeet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {trendRows.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button onClick={() => setShowDailyTrend(!showDailyTrend)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-700" />
              <span className="font-black text-slate-900 text-sm">DAILY TREND</span>
              <span className="text-xs text-slate-500">({trendRows.length} days)</span>
            </div>
            {showDailyTrend ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          </button>
          {showDailyTrend && (
            <div className="p-4 border-t border-slate-100 space-y-2">
              {trendRows.map((r) => (
                <div key={r.date} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-mono text-slate-600 flex-shrink-0">{fmtDate(r.date)}</div>
                  <div className="flex-1 bg-slate-100 rounded h-6 relative overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500" style={{ width: `${(r.welds / maxDailyWelds) * 100}%` }} />
                    <div className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white mix-blend-difference">
                      {r.welds} welds · {r.supports} sup · {r.linearFeet} ft
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === BIG TOTALS CARD (bottom) === */}
      {filteredLogs.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 shadow-xl ring-1 ring-blue-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-300" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-[3pt] text-blue-200">TOTAL — ALL WELDERS COMBINED</div>
              <div className="text-sm font-bold text-white">{label} · {fmtDateRange()}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-[10px] font-black tracking-widest text-blue-200">WELDS</div>
              <div className="text-4xl font-black text-white mt-1">{fmtNum(totalWelds)}</div>
              <div className="text-[10px] text-blue-200/80 mt-0.5 font-semibold">completed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-[10px] font-black tracking-widest text-emerald-200">SUPPORTS</div>
              <div className="text-4xl font-black text-emerald-300 mt-1">{fmtNum(totalSupports)}</div>
              <div className="text-[10px] text-emerald-200/80 mt-0.5 font-semibold">installed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-[10px] font-black tracking-widest text-purple-200">LINEAR FEET</div>
              <div className="text-4xl font-black text-purple-300 mt-1">{fmtNum(totalLinearFeet)}</div>
              <div className="text-[10px] text-purple-200/80 mt-0.5 font-semibold">of pipe</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className={`text-[10px] font-black tracking-widest ${passRate === null ? "text-slate-300" : passRate >= 90 ? "text-emerald-200" : passRate >= 70 ? "text-amber-200" : "text-red-200"}`}>PASS RATE</div>
              <div className={`text-4xl font-black mt-1 ${passRate === null ? "text-slate-400" : passRate >= 90 ? "text-emerald-300" : passRate >= 70 ? "text-amber-300" : "text-red-300"}`}>
                {passRate !== null ? passRate + "%" : "—"}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-semibold">
                {inspTotal > 0 ? `${accepted}/${inspTotal} welds` : "no inspections"}
                {rejected > 0 && <span className="ml-1 text-red-300">⚠ {rejected}</span>}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-blue-100 flex flex-wrap gap-x-6 gap-y-1.5">
            <span>👷 <strong className="text-white">{activeWelders.size}</strong> welders active</span>
            <span>📋 <strong className="text-white">{isosWorked.size}</strong> ISOs advanced</span>
            <span>🧪 <strong className="text-white">{couponsInRange.length}</strong> coupons tested</span>
            <span>📂 Systems: <strong className="text-white">{Array.from(systemsWorked).join(", ") || "—"}</strong></span>
          </div>
          {welderBreakdown[0] && welderBreakdown.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs">
              <span className="text-amber-300 text-base">🏆</span>
              <span className="text-blue-100">Top performer:</span>
              <strong className="text-white">{welderBreakdown[0].welder.name}</strong>
              <span className="text-blue-200">— {fmtNum(welderBreakdown[0].welds)} welds, {fmtNum(welderBreakdown[0].linearFeet)} ft</span>
            </div>
          )}
        </div>
      )}
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

  const dateRangeLabels = { all: "ALL TIME", week: "LAST WEEK", month: "LAST MONTH", quarter: "LAST 90 DAYS" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">CHARTS &amp; ANALYTICS</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">WELD PROGRESS AND PERFORMANCE</p>
      </div>

      {/* FILTERS */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="DATE RANGE">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={selectCls}>
              <option value="all">All time</option>
              <option value="week">Last week</option>
              <option value="month">Last month</option>
              <option value="quarter">Last 90 days</option>
            </select>
          </Field>
          <Field label="WELDER">
            <select value={selectedWelder} onChange={(e) => setSelectedWelder(e.target.value)} className={selectCls}>
              <option value="all">All welders</option>
              {data.welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <Activity size={12} />
          <span className="tracking-widest font-semibold">VIEWING: {dateRangeLabels[dateRange]} {selectedWelder !== "all" ? "· " + (data.welders.find(w => w.id === selectedWelder)?.name || "") : ""}</span>
        </div>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="TOTAL WELDS" value={total} sub="in the period" color="blue" />
        <KPI label="ACCEPTED" value={accepted} sub={`${acceptRate}% of total`} color="emerald" />
        <KPI label="REJECTED" value={rejected} sub={`${rejectRate}% of total`} color="red" />
        <KPI label="PENDING" value={pending} sub="pending inspection" color="amber" />
      </div>

      {total === 0 ? (
        <EmptyState icon={BarChart3} text="No data in selected range. Change filters or register welds." />
      ) : (
        <>
          {/* TIMELINE LINE CHART */}
          <Card title="EVOLUTION OVER TIME" subtitle="welds per day">
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
            <Card title="POR WELDER" subtitle="ranking de welds">
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
            <Card title="GLOBAL DISTRIBUTION" subtitle="% of total">
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
            <Card title="WELDER PERFORMANCE" subtitle="% acceptance" noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold">WELDER</th>
                      <th className="text-right px-4 py-3 font-bold">TOTAL</th>
                      <th className="text-right px-4 py-3 font-bold">✓ OK</th>
                      <th className="text-right px-4 py-3 font-bold">✗ RX</th>
                      <th className="text-right px-4 py-3 font-bold">PENDING</th>
                      <th className="text-right px-4 py-3 font-bold">% ACCEPTANCE</th>
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

function CouponsView({ role, currentUser, welders, coupons, dailyLogs, onAdd, onUpdate, onDelete }) {
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [expandedWelders, setExpandedWelders] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  const todayStr = new Date().toISOString().split("T")[0];

  // === Detect changes that require a new coupon ===
  // Get last weld of the welder (for today) to detect diameter/machine/head changes
  const getLastWeldForWelder = (welderId) => {
    const welderLogs = dailyLogs.filter((l) => l.welderId === welderId && l.date === todayStr);
    if (welderLogs.length === 0) return null;
    const allEntries = welderLogs.flatMap((l) => l.entries.map((e) => ({ ...e, logDate: l.date })));
    if (allEntries.length === 0) return null;
    return allEntries[allEntries.length - 1];
  };

  // Check if a welder needs a coupon TODAY (for the warnings/badges)
  const couponNeededReason = (welderId) => {
    const todayCoupons = coupons.filter((c) => c.welderId === welderId && c.date === todayStr);

    // Has a coupon today? At least morning is covered
    if (todayCoupons.length === 0) return "START OF SHIFT";

    const lastWeld = getLastWeldForWelder(welderId);
    if (!lastWeld) return null; // No welds yet today, but already has morning coupon

    // Check if size/machine/head matches the most recent coupon
    const lastCoupon = [...todayCoupons].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (lastCoupon.size && lastWeld.size && lastCoupon.size !== lastWeld.size) {
      return `DIAMETER CHANGE (${lastCoupon.size}" → ${lastWeld.size}")`;
    }
    if (lastCoupon.machine && lastWeld.machine && lastCoupon.machine !== lastWeld.machine) {
      return `MACHINE CHANGE`;
    }
    if (lastCoupon.head && lastWeld.head && lastCoupon.head !== lastWeld.head) {
      return `HEAD CHANGE`;
    }
    return null;
  };

  // === Welder action: notify coupon ready ===
  const notifyCouponReady = () => {
    // Auto-detect reason
    const todayCoupons = coupons.filter((c) => c.welderId === currentUser.id && c.date === todayStr);
    let reason = "START OF SHIFT";
    let size = "";
    let machine = "";
    let head = "";

    const lastWeld = getLastWeldForWelder(currentUser.id);
    if (todayCoupons.length > 0 && lastWeld) {
      const lastCoupon = [...todayCoupons].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (lastCoupon.size !== lastWeld.size) reason = `DIAMETER CHANGE (${lastWeld.size}")`;
      else if (lastCoupon.machine !== lastWeld.machine) reason = `MACHINE CHANGE`;
      else if (lastCoupon.head !== lastWeld.head) reason = `HEAD CHANGE`;
      else reason = "ADDITIONAL COUPON";
      size = lastWeld.size || "";
      machine = lastWeld.machine || "";
      head = lastWeld.head || "";
    } else if (lastWeld) {
      size = lastWeld.size || "";
      machine = lastWeld.machine || "";
      head = lastWeld.head || "";
    }

    onAdd({
      welderId: currentUser.id,
      welderName: currentUser.name,
      date: todayStr,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      reason,
      size,
      machine,
      head,
      status: "ready",
    });
  };

  // === QC action: approve coupon ===
  const approveCoupon = (couponId) => {
    onUpdate(couponId, {
      status: "accepted",
      qcInitial: currentUser.username?.toUpperCase() || currentUser.name?.substring(0, 2).toUpperCase() || "QC",
      reviewedAt: new Date().toISOString(),
      reviewedTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    });
  };

  // === QC action: reject coupon ===
  const rejectCoupon = (couponId, reason) => {
    onUpdate(couponId, {
      status: "rejected",
      qcInitial: currentUser.username?.toUpperCase() || currentUser.name?.substring(0, 2).toUpperCase() || "QC",
      rejectReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    });
  };

  // === Filter coupons based on role ===
  const visibleCoupons = role === "welder"
    ? coupons.filter((c) => c.welderId === currentUser.id)
    : coupons;

  const pendingCoupons = visibleCoupons.filter((c) => c.status === "ready");
  const acceptedCount = visibleCoupons.filter((c) => c.status === "accepted").length;
  const rejectedCount = visibleCoupons.filter((c) => c.status === "rejected").length;

  // Today's coupon for current welder (used for welder UI)
  const myTodayCoupons = role === "welder"
    ? coupons.filter((c) => c.welderId === currentUser.id && c.date === todayStr)
    : [];
  const myReason = role === "welder" ? couponNeededReason(currentUser.id) : null;

  // Welders who need a coupon today (for admin/QC dashboard)
  const weldersNeedingCoupon = welders
    .map((w) => ({ welder: w, reason: couponNeededReason(w.id) }))
    .filter((x) => x.reason);

  // === Group coupons by welder → date ===
  const grouped = welders.map((w) => {
    const wCoupons = visibleCoupons.filter((c) => c.welderId === w.id);
    if (wCoupons.length === 0) return null;
    const byDate = {};
    wCoupons.forEach((c) => {
      if (!byDate[c.date]) byDate[c.date] = [];
      byDate[c.date].push(c);
    });
    const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).map((d) => ({
      date: d,
      coupons: byDate[d].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    }));
    const total = wCoupons.length;
    const accepted = wCoupons.filter((c) => c.status === "accepted").length;
    const rejected = wCoupons.filter((c) => c.status === "rejected").length;
    const ready = wCoupons.filter((c) => c.status === "ready").length;
    return { welder: w, dates, total, accepted, rejected, ready };
  }).filter(Boolean);

  const toggleWelder = (id) => setExpandedWelders((p) => ({ ...p, [id]: !p[id] }));
  const toggleDate = (key) => setExpandedDates((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">QUALIFICATION COUPONS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">
            {visibleCoupons.length} TOTAL · {pendingCoupons.length} PENDING QC · {acceptedCount} APPROVED · {rejectedCount} REJECTED
          </p>
        </div>
      </div>

      {/* === WELDER VIEW: BIG BUTTON TO NOTIFY COUPON READY === */}
      {role === "welder" && (
        <>
          {myReason && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 flex items-start gap-3">
              <AlertTriangle size={22} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-amber-900 text-sm mb-1">⚠️ COUPON REQUIRED</div>
                <div className="text-xs text-amber-800">Reason: <strong>{myReason}</strong></div>
                <div className="text-xs text-amber-700 mt-1">Make your coupon physically, then press the button below to notify QC.</div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Award size={24} />
              <div>
                <div className="font-black text-lg">COUPON READY</div>
                <div className="text-xs text-blue-100 tracking-wider">Notify QC when you've finished your coupon</div>
              </div>
            </div>
            <button
              onClick={notifyCouponReady}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black py-4 rounded-lg shadow-md transition-all hover:scale-[1.02] tracking-widest text-sm flex items-center justify-center gap-2"
            >
              🔔 NOTIFY COUPON READY
            </button>
          </div>

          {/* Today's coupons for the welder */}
          {myTodayCoupons.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold tracking-widest text-slate-700 mb-3">MY COUPONS TODAY</h3>
              <div className="space-y-2">
                {myTodayCoupons.map((c) => (
                  <div key={c.id} className={`p-3 rounded border-l-4 ${
                    c.status === "ready" ? "bg-amber-50 border-l-amber-500" :
                    c.status === "accepted" ? "bg-emerald-50 border-l-emerald-500" :
                    "bg-red-50 border-l-red-500"
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded ${
                            c.status === "ready" ? "bg-amber-100 text-amber-700" :
                            c.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {c.status === "ready" ? "⏳ WAITING QC" : c.status === "accepted" ? "✓ APPROVED" : "✗ REJECTED"}
                          </span>
                          <span className="text-xs text-slate-600 font-mono">{c.time}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1"><strong>Reason:</strong> {c.reason}</div>
                        {c.size && <div className="text-xs text-slate-500 mt-0.5">Diameter: {c.size}" {c.machine && `· Machine: ${c.machine}`}</div>}
                        {c.qcInitial && <div className="text-xs text-cyan-700 mt-0.5">Reviewed by QC: <strong>{c.qcInitial}</strong> at {c.reviewedTime}</div>}
                        {c.rejectReason && <div className="text-xs text-red-700 mt-1 italic">Rejection reason: {c.rejectReason}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* === QC VIEW: LIST OF PENDING COUPONS === */}
      {role === "qc" && pendingCoupons.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-amber-600" />
            <h3 className="text-sm font-black tracking-widest text-amber-900">
              🔔 {pendingCoupons.length} COUPONS WAITING FOR INSPECTION
            </h3>
          </div>
          <div className="space-y-2">
            {pendingCoupons
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((c) => {
                const w = welders.find((x) => x.id === c.welderId);
                return (
                  <div key={c.id} className="bg-white border border-amber-200 rounded p-3">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <HardHat size={14} className="text-blue-700" />
                          <span className="font-bold text-slate-900 text-sm">{w?.name || c.welderName}</span>
                          <span className="text-xs text-slate-500 font-mono">#{w?.welderId}</span>
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">{c.time}</span>
                        </div>
                        <div className="text-xs text-slate-700"><strong>Reason:</strong> {c.reason}</div>
                        {(c.size || c.machine || c.head) && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {c.size && <span>Diameter: {c.size}"</span>}
                            {c.machine && <span> · Machine: {c.machine}</span>}
                            {c.head && <span> · Head: {c.head}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => approveCoupon(c.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> APPROVE
                        </button>
                        <button
                          onClick={() => setShowRejectModal(c)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-colors flex items-center gap-1"
                        >
                          <XCircle size={12} /> REJECT
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* === ADMIN VIEW: WELDERS NEEDING COUPON TODAY === */}
      {role === "admin" && weldersNeedingCoupon.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-sm font-black tracking-widest text-amber-900">
              ⚠️ {weldersNeedingCoupon.length} WELDERS NEED COUPON
            </h3>
          </div>
          <div className="space-y-1">
            {weldersNeedingCoupon.map(({ welder: w, reason }) => (
              <div key={w.id} className="bg-white border border-amber-200 rounded p-2 flex items-center gap-2 flex-wrap">
                <HardHat size={14} className="text-blue-700" />
                <span className="font-bold text-slate-900 text-sm">{w.name}</span>
                <span className="text-xs text-slate-500 font-mono">#{w.welderId}</span>
                <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === HISTORY: GROUPED BY WELDER → DATE === */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-slate-700">COUPON HISTORY</h3>
        {grouped.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">
            {role === "welder" ? "You haven't made any coupons yet." : "No coupons registered yet."}
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.map(({ welder: w, dates, total, accepted, rejected, ready }) => {
              const isExpanded = expandedWelders[w.id];
              return (
                <div key={w.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleWelder(w.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <HardHat size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{w.name}</div>
                        <div className="text-xs text-slate-500 font-mono">#{w.welderId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {total} {total === 1 ? "coupon" : "coupons"}
                      </span>
                      {ready > 0 && (
                        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                          ⏳ {ready}
                        </span>
                      )}
                      {accepted > 0 && (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✓ {accepted}
                        </span>
                      )}
                      {rejected > 0 && (
                        <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✗ {rejected}
                        </span>
                      )}
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100">
                      {dates.map(({ date, coupons: dCoupons }) => {
                        const dateKey = `${w.id}-${date}`;
                        const isDateExpanded = expandedDates[dateKey];
                        const dAccepted = dCoupons.filter((c) => c.status === "accepted").length;
                        const dRejected = dCoupons.filter((c) => c.status === "rejected").length;
                        const dReady = dCoupons.filter((c) => c.status === "ready").length;
                        return (
                          <div key={date} className="bg-white">
                            <button
                              onClick={() => toggleDate(dateKey)}
                              className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-wrap">
                                <Calendar size={14} className="text-blue-700" />
                                <span className="text-blue-700 font-bold text-sm">
                                  {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">{dCoupons.length} {dCoupons.length === 1 ? "coupon" : "coupons"}:</span>
                                {dReady > 0 && <span className="text-amber-600 font-bold">⏳{dReady}</span>}
                                {dAccepted > 0 && <span className="text-emerald-600 font-bold">✓{dAccepted}</span>}
                                {dRejected > 0 && <span className="text-red-600 font-bold">✗{dRejected}</span>}
                                {isDateExpanded ? <ChevronDown size={16} className="text-slate-400 ml-2" /> : <ChevronRight size={16} className="text-slate-400 ml-2" />}
                              </div>
                            </button>
                            {isDateExpanded && (
                              <div className="px-3 pb-3 space-y-2">
                                {dCoupons.map((c) => (
                                  <div key={c.id} className={`bg-white border-l-4 border border-slate-200 p-3 rounded-r ${
                                    c.status === "ready" ? "border-l-amber-500" :
                                    c.status === "accepted" ? "border-l-emerald-500" :
                                    "border-l-red-500"
                                  }`}>
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <span className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded ${
                                            c.status === "ready" ? "bg-amber-100 text-amber-700" :
                                            c.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                                            "bg-red-100 text-red-700"
                                          }`}>
                                            {c.status === "ready" ? "⏳ WAITING QC" : c.status === "accepted" ? "✓ APPROVED" : "✗ REJECTED"}
                                          </span>
                                          <span className="text-xs text-slate-500 font-mono">{c.time}</span>
                                          {c.qcInitial && <span className="text-xs text-cyan-700 font-semibold">QC: {c.qcInitial}</span>}
                                        </div>
                                        <div className="text-xs text-slate-700"><strong>Reason:</strong> {c.reason}</div>
                                        {(c.size || c.machine || c.head) && (
                                          <div className="text-xs text-slate-500 mt-0.5">
                                            {c.size && <span>Ø {c.size}"</span>}
                                            {c.machine && <span> · M: {c.machine}</span>}
                                            {c.head && <span> · H: {c.head}</span>}
                                          </div>
                                        )}
                                        {c.rejectReason && (
                                          <div className="mt-1 flex items-start gap-1.5 text-xs text-red-700">
                                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                                            <span>{c.rejectReason}</span>
                                          </div>
                                        )}
                                      </div>
                                      {(role === "admin" || role === "qc") && (
                                        <button onClick={() => onDelete(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                      )}
                                    </div>
                                  </div>
                                ))}
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
      </div>

      {showRejectModal && (
        <CouponRejectModal
          coupon={showRejectModal}
          welder={welders.find((w) => w.id === showRejectModal.welderId)}
          onClose={() => setShowRejectModal(null)}
          onConfirm={(reason) => { rejectCoupon(showRejectModal.id, reason); setShowRejectModal(null); }}
        />
      )}
    </div>
  );
}

function CouponRejectModal({ coupon, welder, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <ModalShell title="REJECT COUPON" onClose={onClose}>
      <div className="bg-red-50 border border-red-200 p-3 rounded text-xs">
        <div className="flex items-center gap-2 mb-1">
          <HardHat size={14} className="text-blue-700" />
          <strong className="text-slate-900">{welder?.name}</strong>
          <span className="text-slate-500 font-mono">#{welder?.welderId}</span>
        </div>
        <div className="text-slate-700">Coupon reason: {coupon.reason}</div>
        <div className="text-slate-500">Time: {coupon.time}</div>
      </div>
      <Field label="REJECTION REASON">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="Ex: lack of penetration, bluish color, oxidation..."
          autoFocus
        />
      </Field>
      <button
        onClick={() => { if (reason.trim()) onConfirm(reason.trim()); else alert("Write a reason."); }}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-xs tracking-widest mt-2 rounded transition-colors shadow-sm"
      >
        CONFIRM REJECTION
      </button>
    </ModalShell>
  );
}


// ===================== MY ISOS (welder view) =====================
function MyIsosView({ currentUser, isos, systems, onAddPhoto, onDeletePhoto }) {
  const [expandedIsoId, setExpandedIsoId] = useState(null);
  const [uploadingIsoId, setUploadingIsoId] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const myIsos = isos.filter((iso) => iso.welderId === currentUser.id);
  const fileInputRef = React.useRef(null);

  const openUpload = (isoId) => { setUploadingIsoId(isoId); setTimeout(() => fileInputRef.current?.click(), 50); };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingIsoId) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image too large (max 5MB). Please take a smaller photo."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const caption = prompt("Add a caption (optional):") || "";
      onAddPhoto(uploadingIsoId, {
        url: ev.target.result,
        caption,
        uploadedBy: currentUser.id,
        uploadedByName: currentUser.name,
      });
      setUploadingIsoId(null);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const totalPhotos = myIsos.reduce((s, iso) => s + (iso.photos || []).length, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">MY ISOs</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">
          {myIsos.length} ASSIGNED · {totalPhotos} PHOTOS UPLOADED
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800 flex items-start gap-2 rounded">
        <FileImage size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <strong>Upload progress photos</strong> of your assigned ISOs. Your supervisor sees them automatically in the Project Map.
        </div>
      </div>

      {myIsos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <FileImage size={40} className="mx-auto text-slate-300 mb-3" />
          <div className="text-sm text-slate-600 font-semibold">No ISOs assigned to you yet</div>
          <div className="text-xs text-slate-400 mt-1">Ask your admin to assign ISOs to you.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {myIsos.map((iso) => {
            const system = systems.find((s) => s.id === iso.systemId);
            const isExpanded = expandedIsoId === iso.id;
            const photos = iso.photos || [];
            return (
              <div key={iso.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedIsoId(isExpanded ? null : iso.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 font-mono truncate">{iso.number}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {system && <span>{system.name} · </span>}
                        {iso.size && <span>{iso.size} · </span>}
                        {iso.description || "No description"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${photos.length > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                      {photos.length} {photos.length === 1 ? "photo" : "photos"}
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold tracking-widest text-slate-700">PROGRESS PHOTOS</h4>
                      <button onClick={() => openUpload(iso.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                        <Upload size={11} /> UPLOAD PHOTO
                      </button>
                    </div>

                    {photos.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-300 rounded p-6 text-center">
                        <FileImage size={28} className="mx-auto text-slate-300 mb-2" />
                        <div className="text-xs text-slate-500 italic">No photos yet. Upload one!</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group bg-white border border-slate-200 rounded overflow-hidden">
                            <img src={photo.url} alt={photo.caption} onClick={() => setPreviewPhoto(photo)} className="w-full h-28 object-cover cursor-pointer" />
                            <button onClick={() => { if (confirm("Delete this photo?")) onDeletePhoto(iso.id, photo.id); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">×</button>
                            <div className="p-1.5">
                              {photo.caption && <div className="text-[10px] text-slate-700 truncate font-medium">{photo.caption}</div>}
                              <div className="text-[9px] text-slate-400">{new Date(photo.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

      {previewPhoto && (
        <div onClick={() => setPreviewPhoto(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer">
          <div className="max-w-4xl w-full">
            <img src={previewPhoto.url} alt={previewPhoto.caption} className="w-full h-auto max-h-[80vh] object-contain" />
            {previewPhoto.caption && <div className="text-white text-center mt-3 text-sm">{previewPhoto.caption}</div>}
            <div className="text-slate-400 text-center mt-1 text-xs">Click anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== PROJECT MAP VIEW =====================
function ProjectMapView({ project, isos, welders, dailyLogs, inspections, onSaveProject, onAddZone, onUpdateZone, onDeleteZone, onAddPhoto, onDeletePhoto, onAutoAssign }) {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drawingRect, setDrawingRect] = useState(null); // {startX, startY, endX, endY}
  const [showZoneModal, setShowZoneModal] = useState(null); // zone being edited OR {isNew: true, rect: {...}}
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(null); // zone id
  const mapContainerRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  // === Compute zone completion % based on assigned ISOs ===
  const getZoneProgress = (zone) => {
    const zoneIsos = (zone.isoIds || []).map((id) => isos.find((i) => i.id === id)).filter(Boolean);
    if (zoneIsos.length === 0) return { pct: 0, completedIsos: 0, totalIsos: 0, totalWelds: 0, completedWelds: 0 };
    let totalWelds = 0, completedWelds = 0, completedIsos = 0;
    zoneIsos.forEach((iso) => {
      const isoLogs = dailyLogs.filter((l) => l.entries.some((e) => e.iso === iso.number));
      const isoEntries = isoLogs.flatMap((l) => l.entries.filter((e) => e.iso === iso.number).map((e) => ({...e, logId: l.id})));
      totalWelds += isoEntries.length;
      const accepted = isoEntries.filter((e) => inspections.find((i) => i.weldRef === `${e.logId}-${e.id}` && i.status === "accepted")).length;
      completedWelds += accepted;
      if (isoEntries.length > 0 && accepted === isoEntries.length) completedIsos++;
    });
    const pct = totalWelds === 0 ? 0 : Math.round((completedWelds / totalWelds) * 100);
    return { pct, completedIsos, totalIsos: zoneIsos.length, totalWelds, completedWelds };
  };

  // === Determine zone color based on progress and deadline ===
  const getZoneColor = (zone) => {
    const { pct } = getZoneProgress(zone);
    const now = new Date();
    const deadline = zone.deadline ? new Date(zone.deadline) : null;
    const isOverdue = deadline && deadline < now && pct < 100;
    if (pct === 100) return { fill: "rgba(16, 185, 129, 0.35)", stroke: "#059669", label: "COMPLETE" };
    if (isOverdue) return { fill: "rgba(220, 38, 38, 0.35)", stroke: "#dc2626", label: "OVERDUE" };
    if (pct >= 50) return { fill: "rgba(234, 179, 8, 0.35)", stroke: "#ca8a04", label: "IN PROGRESS" };
    if (pct > 0) return { fill: "rgba(249, 115, 22, 0.35)", stroke: "#ea580c", label: "STARTED" };
    return { fill: "rgba(139, 92, 246, 0.3)", stroke: "#7c3aed", label: "NOT STARTED" };
  };

  // === Handlers ===
  const handleFloorPlanUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSaveProject({
        id: project?.id || "p1",
        name: project?.name || "New Project",
        client: project?.client || "",
        jobNumber: project?.jobNumber || "",
        floorPlanUrl: ev.target.result,
        zones: project?.zones || [],
      });
      setShowSetupModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    if (!editMode || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingRect({ startX: x, startY: y, endX: x, endY: y });
  };

  const handleMouseMove = (e) => {
    if (!drawingRect || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingRect({ ...drawingRect, endX: x, endY: y });
  };

  const handleMouseUp = () => {
    if (!drawingRect) return;
    const w = Math.abs(drawingRect.endX - drawingRect.startX);
    const h = Math.abs(drawingRect.endY - drawingRect.startY);
    if (w < 3 || h < 3) { setDrawingRect(null); return; }
    const newRect = {
      x: Math.min(drawingRect.startX, drawingRect.endX),
      y: Math.min(drawingRect.startY, drawingRect.endY),
      width: w,
      height: h,
    };
    setShowZoneModal({ isNew: true, rect: newRect });
    setDrawingRect(null);
  };

  const handlePhotoUpload = (zoneId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const caption = prompt("Add a caption for this photo (optional):") || "";
      onAddPhoto(zoneId, { url: ev.target.result, caption });
    };
    reader.readAsDataURL(file);
  };

  // === NO PROJECT YET === Welcome screen
  if (!project || !project.floorPlanUrl) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">PROJECT MAP</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">VISUAL PROGRESS TRACKING BY ZONE</p>
        </div>
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl p-8 text-center">
          <Layers size={48} className="mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-black mb-2">Set Up Your Project Map</h3>
          <p className="text-blue-100 text-sm max-w-xl mx-auto mb-6">
            Upload your floor plan, draw work zones directly on it, assign ISOs to each zone, and track completion in real-time. Perfect for daily supervisor reports.
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFloorPlanUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-white text-blue-700 hover:bg-blue-50 font-black px-6 py-3 rounded-lg shadow-md transition-all hover:scale-[1.02] tracking-widest text-sm inline-flex items-center gap-2">
            <Upload size={16} /> UPLOAD FLOOR PLAN
          </button>
          <p className="text-xs text-blue-200 mt-4">Accepted: JPG, PNG (max ~5MB)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-2"><Upload size={18} /></div>
            <div className="font-bold text-sm text-slate-900 mb-1">1. Upload Plan</div>
            <div className="text-xs text-slate-600">Upload your project's floor plan as JPG or PNG.</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-2"><Square size={18} /></div>
            <div className="font-bold text-sm text-slate-900 mb-1">2. Draw Zones</div>
            <div className="text-xs text-slate-600">Click and drag to draw rectangular zones over your plan.</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mb-2"><Activity size={18} /></div>
            <div className="font-bold text-sm text-slate-900 mb-1">3. Track Progress</div>
            <div className="text-xs text-slate-600">Zones auto-color based on % complete. Great for daily reports.</div>
          </div>
        </div>
      </div>
    );
  }

  // === HAS PROJECT === Main map view
  const zones = project.zones || [];
  const totalZones = zones.length;
  const completedZones = zones.filter((z) => getZoneProgress(z).pct === 100).length;
  const overdueZones = zones.filter((z) => { const d = z.deadline ? new Date(z.deadline) : null; return d && d < new Date() && getZoneProgress(z).pct < 100; }).length;
  const overallPct = totalZones === 0 ? 0 : Math.round(zones.reduce((s, z) => s + getZoneProgress(z).pct, 0) / totalZones);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="space-y-4">
      {/* === TOP BAR === */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">{project.name || "Project Map"}</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">
            {project.client && `${project.client} · `}
            {project.jobNumber && `JOB #${project.jobNumber} · `}
            {totalZones} ZONES · {overallPct}% COMPLETE
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowSetupModal(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold tracking-widest px-3 py-2 rounded border border-slate-200 transition-colors flex items-center gap-1">
            <Edit2 size={11} /> EDIT PROJECT
          </button>
          {onAutoAssign && (
            <button
              onClick={onAutoAssign}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1"
              title="Auto-assign existing ISOs to zones using each zone's pattern"
            >
              <Activity size={11} /> AUTO-ASSIGN ISOs
            </button>
          )}
          <button onClick={() => setEditMode(!editMode)} className={`text-[10px] font-bold tracking-widest px-3 py-2 rounded transition-colors flex items-center gap-1 ${editMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-700 hover:bg-blue-800 text-white"}`}>
            {editMode ? <><CheckCircle2 size={11} /> DONE EDITING</> : <><Square size={11} /> DRAW ZONES</>}
          </button>
        </div>
      </div>

      {/* === KPI STRIP === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] font-bold tracking-widest text-slate-500">OVERALL PROGRESS</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{overallPct}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-blue-700" style={{ width: `${overallPct}%` }} /></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] font-bold tracking-widest text-slate-500">ZONES COMPLETE</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{completedZones}<span className="text-slate-400 text-sm font-normal"> / {totalZones}</span></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] font-bold tracking-widest text-slate-500">IN PROGRESS</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalZones - completedZones - overdueZones}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] font-bold tracking-widest text-slate-500">OVERDUE</div>
          <div className="text-2xl font-black text-red-600 mt-1">{overdueZones}</div>
        </div>
      </div>

      {/* === MAIN LAYOUT === */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* === MAP CONTAINER === */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {editMode && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
                <Square size={12} />
                <span><strong>EDIT MODE:</strong> Click and drag on the plan to draw a new zone.</span>
              </div>
            )}
            <div
              ref={mapContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => drawingRect && setDrawingRect(null)}
              className="relative"
              style={{ cursor: editMode ? "crosshair" : "default", userSelect: "none" }}
            >
              <img src={project.floorPlanUrl} alt="Floor Plan" className="w-full block" draggable={false} style={{ pointerEvents: "none" }} />
              {/* Zone overlays */}
              {zones.map((zone) => {
                const color = getZoneColor(zone);
                const { pct } = getZoneProgress(zone);
                const isSelected = selectedZoneId === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={(e) => { if (!editMode) { e.stopPropagation(); setSelectedZoneId(isSelected ? null : zone.id); } }}
                    className={`absolute transition-all ${!editMode ? "cursor-pointer hover:brightness-110" : "pointer-events-none"} ${isSelected ? "ring-4 ring-blue-500 ring-opacity-70" : ""}`}
                    style={{
                      left: `${zone.rect.x}%`, top: `${zone.rect.y}%`,
                      width: `${zone.rect.width}%`, height: `${zone.rect.height}%`,
                      background: color.fill, border: `2px solid ${color.stroke}`,
                    }}
                  >
                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-900 shadow-sm whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                      {zone.name} · {pct}%
                    </div>
                  </div>
                );
              })}
              {/* Live drawing rect */}
              {drawingRect && (
                <div className="absolute border-2 border-dashed border-blue-600 bg-blue-500/20 pointer-events-none"
                  style={{
                    left: `${Math.min(drawingRect.startX, drawingRect.endX)}%`,
                    top: `${Math.min(drawingRect.startY, drawingRect.endY)}%`,
                    width: `${Math.abs(drawingRect.endX - drawingRect.startX)}%`,
                    height: `${Math.abs(drawingRect.endY - drawingRect.startY)}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded" style={{background: "rgba(139,92,246,0.3)", border: "2px solid #7c3aed"}}/><span className="text-slate-600">Not Started</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded" style={{background: "rgba(249,115,22,0.35)", border: "2px solid #ea580c"}}/><span className="text-slate-600">Started (1-49%)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded" style={{background: "rgba(234,179,8,0.35)", border: "2px solid #ca8a04"}}/><span className="text-slate-600">In Progress (50-99%)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded" style={{background: "rgba(16,185,129,0.35)", border: "2px solid #059669"}}/><span className="text-slate-600">Complete</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded" style={{background: "rgba(220,38,38,0.35)", border: "2px solid #dc2626"}}/><span className="text-slate-600">Overdue</span></div>
          </div>
        </div>

        {/* === SIDE PANEL === */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold tracking-widest text-slate-800">WORK ZONES ({totalZones})</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {zones.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 italic">
                  No zones yet.<br/>Click "DRAW ZONES" to start.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {zones.map((zone) => {
                    const { pct, completedIsos, totalIsos } = getZoneProgress(zone);
                    const color = getZoneColor(zone);
                    const isSelected = selectedZoneId === zone.id;
                    const deadlineDate = zone.deadline ? new Date(zone.deadline) : null;
                    const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date()) / (1000*60*60*24)) : null;
                    return (
                      <div key={zone.id} onClick={() => setSelectedZoneId(isSelected ? null : zone.id)} className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-700" : ""}`}>
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded flex-shrink-0 mt-1" style={{background: color.fill, border: `2px solid ${color.stroke}`}}/>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-900 truncate">{zone.name}</div>
                            {zone.welderId && (() => {
                              const lw = welders?.find((w) => w.id === zone.welderId);
                              return lw ? (
                                <div className="text-[10px] text-blue-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                                  <HardHat size={9} /> {lw.name.split(" ")[0]} {lw.name.split(" ").slice(1).join(" ").charAt(0)}.
                                </div>
                              ) : null;
                            })()}
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              <span className="font-mono font-bold" style={{color: color.stroke}}>{pct}%</span>
                              <span className="text-slate-500">{completedIsos}/{totalIsos} ISOs</span>
                            </div>
                            {deadlineDate && (
                              <div className={`text-[10px] mt-0.5 font-semibold ${daysLeft < 0 ? "text-red-600" : daysLeft < 7 ? "text-amber-600" : "text-slate-500"}`}>
                                {daysLeft < 0 ? `⚠ ${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left (${deadlineDate.toLocaleDateString("en-US", {month:"short", day:"numeric"})})`}
                              </div>
                            )}
                            <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden"><div className="h-full transition-all" style={{width: `${pct}%`, background: color.stroke}}/></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === SELECTED ZONE DETAILS === */}
      {selectedZone && (
        <div className="bg-white border-2 border-blue-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="w-5 h-5 rounded" style={{background: getZoneColor(selectedZone).fill, border: `2px solid ${getZoneColor(selectedZone).stroke}`}}/>
                <h3 className="text-lg font-black text-slate-900">{selectedZone.name}</h3>
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded" style={{background: getZoneColor(selectedZone).fill, color: getZoneColor(selectedZone).stroke}}>
                  {getZoneColor(selectedZone).label}
                </span>
                {selectedZone.welderId && (() => {
                  const leadWelder = welders?.find((w) => w.id === selectedZone.welderId);
                  return leadWelder ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <HardHat size={10} /> {leadWelder.name} (#{leadWelder.welderId})
                    </span>
                  ) : null;
                })()}
              </div>
              {selectedZone.description && <p className="text-xs text-slate-600">{selectedZone.description}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setShowZoneModal(selectedZone)} className="text-slate-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button onClick={() => { onDeleteZone(selectedZone.id); setSelectedZoneId(null); }} className="text-slate-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
              <button onClick={() => setSelectedZoneId(null)} className="text-slate-500 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded"><X size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <div className="text-xl font-black text-blue-700">{getZoneProgress(selectedZone).pct}%</div>
              <div className="text-[9px] text-slate-500 tracking-widest font-bold">COMPLETE</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <div className="text-xl font-black text-slate-900">{getZoneProgress(selectedZone).completedWelds}<span className="text-sm text-slate-400">/{getZoneProgress(selectedZone).totalWelds}</span></div>
              <div className="text-[9px] text-slate-500 tracking-widest font-bold">WELDS</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <div className="text-xl font-black text-slate-900">{(selectedZone.isoIds || []).length}</div>
              <div className="text-[9px] text-slate-500 tracking-widest font-bold">ISOs</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <div className="text-xl font-black text-slate-900">{selectedZone.deadline ? new Date(selectedZone.deadline).toLocaleDateString("en-US", {month:"short", day:"numeric"}) : "—"}</div>
              <div className="text-[9px] text-slate-500 tracking-widest font-bold">DEADLINE</div>
            </div>
          </div>

          {/* ISOs list */}
          {(selectedZone.isoIds || []).length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold tracking-widest text-slate-700 mb-2">ASSIGNED ISOs</div>
              <div className="space-y-1">
                {(selectedZone.isoIds || []).map((isoId) => {
                  const iso = isos.find((i) => i.id === isoId);
                  if (!iso) return null;
                  const isoLogs = dailyLogs.filter((l) => l.entries.some((e) => e.iso === iso.number));
                  const isoEntries = isoLogs.flatMap((l) => l.entries.filter((e) => e.iso === iso.number).map((e) => ({...e, logId: l.id})));
                  const accepted = isoEntries.filter((e) => inspections.find((i) => i.weldRef === `${e.logId}-${e.id}` && i.status === "accepted")).length;
                  const isoP = isoEntries.length === 0 ? 0 : Math.round((accepted / isoEntries.length) * 100);
                  return (
                    <div key={isoId} className="flex items-center gap-2 text-xs bg-slate-50 px-2 py-1.5 rounded">
                      <span className="font-mono text-blue-700 font-bold flex-1 truncate">{iso.number}</span>
                      <span className="text-slate-500">{accepted}/{isoEntries.length}</span>
                      <span className="font-bold text-slate-700 w-10 text-right">{isoP}%</span>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${isoP}%`}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === WELDER PHOTOS (from assigned ISOs) === */}
          {(() => {
            // Gather all photos from the ISOs assigned to this zone
            const welderPhotos = (selectedZone.isoIds || []).flatMap((isoId) => {
              const iso = isos.find((i) => i.id === isoId);
              if (!iso || !iso.photos) return [];
              return iso.photos.map((p) => ({ ...p, isoNumber: iso.number }));
            });
            return (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold tracking-widest text-slate-700 flex items-center gap-1.5">
                    <HardHat size={11} className="text-blue-700" />
                    WELDER FIELD PHOTOS ({welderPhotos.length})
                  </div>
                  <span className="text-[9px] text-slate-400 italic">Auto-uploaded by welders from the field</span>
                </div>
                {welderPhotos.length === 0 ? (
                  <div className="bg-blue-50 border border-dashed border-blue-200 rounded p-3 text-center text-xs text-blue-600 italic">
                    No welder photos yet. Welders upload from "MY ISOS" view and they appear here automatically.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {welderPhotos.map((photo) => (
                      <div key={photo.id} className="relative group bg-white border border-blue-200 rounded overflow-hidden">
                        <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover"/>
                        <div className="p-1.5 bg-blue-50/70">
                          <div className="text-[9px] text-blue-700 font-bold font-mono truncate">{photo.isoNumber}</div>
                          {photo.caption && <div className="text-[9px] text-slate-700 truncate font-medium">{photo.caption}</div>}
                          <div className="text-[8px] text-slate-500 truncate">
                            {photo.uploadedByName || "Welder"} · {new Date(photo.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* === ADMIN/SUPERVISOR EVIDENCE PHOTOS === */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-700 flex items-center gap-1.5">
                <Shield size={11} className="text-slate-700" />
                SUPERVISOR EVIDENCE PHOTOS ({(selectedZone.photos || []).length})
              </div>
              <label className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded cursor-pointer transition-colors inline-flex items-center gap-1">
                <Upload size={10} /> ADD PHOTO
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(selectedZone.id, e)} className="hidden" />
              </label>
            </div>
            {(selectedZone.photos || []).length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded p-3 text-center text-xs text-slate-400 italic">No supervisor photos yet. Add evidence photos of the completed work.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(selectedZone.photos || []).map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover rounded border border-slate-200"/>
                    <button onClick={() => { if (confirm("Delete this photo?")) onDeletePhoto(selectedZone.id, photo.id); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                    {photo.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate">{photo.caption}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === MODALS === */}
      {showSetupModal && (
        <ProjectSetupModal project={project} onSave={(data) => { onSaveProject({ ...project, ...data }); setShowSetupModal(false); }} onClose={() => setShowSetupModal(false)} onReplacePlan={() => fileInputRef.current?.click()} />
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFloorPlanUpload} className="hidden" />
      {showZoneModal && (
        <ZoneModal zone={showZoneModal.isNew ? null : showZoneModal} rect={showZoneModal.isNew ? showZoneModal.rect : showZoneModal.rect} isos={isos} welders={welders} onSave={(data) => {
          if (showZoneModal.isNew) { onAddZone({ ...data, rect: showZoneModal.rect }); }
          else { onUpdateZone(showZoneModal.id, data); }
          setShowZoneModal(null);
        }} onClose={() => setShowZoneModal(null)} />
      )}
    </div>
  );
}

function ProjectSetupModal({ project, onSave, onClose, onReplacePlan }) {
  const [name, setName] = useState(project?.name || "");
  const [client, setClient] = useState(project?.client || "");
  const [jobNumber, setJobNumber] = useState(project?.jobNumber || "");
  const submit = () => { if (!name.trim()) { alert("Project name is required"); return; } onSave({ name: name.trim(), client: client.trim(), jobNumber: jobNumber.trim() }); };
  return (
    <ModalShell title="EDIT PROJECT" onClose={onClose}>
      <Field label="PROJECT NAME"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Biotech Facility - Phase 1" autoFocus /></Field>
      <Field label="CLIENT NAME (OPTIONAL)"><input value={client} onChange={(e) => setClient(e.target.value)} className={inputCls} placeholder="e.g. Pharma Corp" /></Field>
      <Field label="JOB NUMBER (OPTIONAL)"><input value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} className={inputCls} placeholder="e.g. 24.715.0002" /></Field>
      <div className="flex gap-2">
        <button onClick={onReplacePlan} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 text-xs tracking-widest rounded transition-colors flex items-center justify-center gap-2">
          <Upload size={12} /> REPLACE FLOOR PLAN
        </button>
        <button onClick={submit} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 text-xs tracking-widest rounded transition-colors">SAVE</button>
      </div>
    </ModalShell>
  );
}

function ZoneModal({ zone, rect, isos, welders, onSave, onClose }) {
  const [name, setName] = useState(zone?.name || "");
  const [description, setDescription] = useState(zone?.description || "");
  const [deadline, setDeadline] = useState(zone?.deadline || "");
  const [welderId, setWelderId] = useState(zone?.welderId || "");
  const [isoPattern, setIsoPattern] = useState(zone?.isoPattern || "");
  const [isoIds, setIsoIds] = useState(zone?.isoIds || []);
  const [search, setSearch] = useState("");
  const toggleIso = (id) => setIsoIds(isoIds.includes(id) ? isoIds.filter((x) => x !== id) : [...isoIds, id]);
  const submit = () => { if (!name.trim()) { alert("Zone name is required"); return; } onSave({ name: name.trim(), description: description.trim(), deadline, welderId: welderId || null, isoPattern: isoPattern.trim(), isoIds }); };
  const filteredIsos = isos.filter((i) => !search || i.number.toLowerCase().includes(search.toLowerCase()));
  // Preview which ISOs will match the pattern (live)
  const patternRegex = patternToRegex(isoPattern);
  const patternMatches = patternRegex ? isos.filter((i) => patternRegex.test(i.number)) : [];
  return (
    <ModalShell title={zone ? "EDIT ZONE" : "NEW ZONE"} onClose={onClose}>
      <Field label="ZONE NAME *"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Mezzanine, Clean Room A" autoFocus /></Field>
      <Field label="DESCRIPTION (OPTIONAL)"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="e.g. HVAC mechanical equipment installation" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="DEADLINE"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} /></Field>
        <Field label="LEAD WELDER">
          <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls}>
            <option value="">— Unassigned —</option>
            {(welders || []).map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
          </select>
        </Field>
      </div>
      {/* === AUTO-ASSIGN BY PATTERN === */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-[10px] font-black">AI</div>
          <div className="text-xs font-black tracking-widest text-purple-900">AUTO-ASSIGN ISOs BY PATTERN</div>
        </div>
        <input
          value={isoPattern}
          onChange={(e) => setIsoPattern(e.target.value)}
          className={inputCls + " font-mono text-xs"}
          placeholder="e.g. 737-102*  or  *HPUR*  or  737-*-RV-*"
        />
        <div className="text-[10px] text-slate-600 leading-relaxed">
          <strong>Use <code className="bg-white px-1 rounded">*</code> as a wildcard.</strong> Any new ISO whose number matches this pattern will auto-populate into this zone.
          {isoPattern.trim() && (
            <div className="mt-1 pt-1 border-t border-purple-200">
              <span className="font-bold text-purple-800">
                {patternMatches.length === 0 ? "⚠️ No existing ISOs match this pattern yet." : `✅ ${patternMatches.length} existing ISO${patternMatches.length === 1 ? "" : "s"} match this pattern.`}
              </span>
              {patternMatches.length > 0 && patternMatches.length <= 6 && (
                <div className="mt-1 font-mono text-[9px] text-slate-700">
                  {patternMatches.map((i) => i.number).join(" · ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Field label={`MANUAL ASSIGN ISOs (${isoIds.length} selected)`}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls + " mb-2"} placeholder="Search ISOs..." />
        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded">
          {filteredIsos.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-3 text-center">No ISOs available. Create ISOs first.</div>
          ) : (
            filteredIsos.map((iso) => {
              const isoWelder = welders?.find((w) => w.id === iso.welderId);
              return (
                <label key={iso.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                  <input type="checkbox" checked={isoIds.includes(iso.id)} onChange={() => toggleIso(iso.id)} />
                  <span className="font-mono text-xs text-blue-700 font-bold flex-1 truncate">{iso.number}</span>
                  {isoWelder && <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">{isoWelder.name.split(" ")[0]}</span>}
                  <span className="text-[10px] text-slate-500">{iso.size || ""}</span>
                </label>
              );
            })
          )}
        </div>
      </Field>
      <button onClick={submit} className={btnPrimaryFull}>{zone ? "UPDATE ZONE" : "CREATE ZONE"}</button>
    </ModalShell>
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
      alert("Upload an image (JPG, PNG) or PDF.");
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
    if (idx === 0) { alert("Cannot delete Rev 0 (Original)"); return; }
    if (!confirm("Delete this revision?")) return;
    const newRevs = revisions.filter((_, i) => i !== idx);
    setRevisions(newRevs);
    setActiveRev(Math.max(0, activeRev - (idx <= activeRev ? 1 : 0)));
  };

  const undoLast = () => {
    if (revisions[activeRev]?.locked) { alert("Rev 0 is locked."); return; }
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
        alert("Rev 0 (Original) is locked. Create a new revision to add annotations.");
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
      alert("Write a label (ex: FW01, FW02)");
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
    { id: "pan", icon: Move, label: "MOVE" },
    { id: "mark", icon: MousePointer2, label: "WELD" },
    { id: "arrow", icon: ArrowUpRight, label: "ARROW" },
    { id: "line", icon: Minus, label: "LINE" },
    { id: "circle", icon: Circle, label: "CIRCLE" },
    { id: "rectangle", icon: Square, label: "RECTANGLE" },
    { id: "pencil", icon: Pencil, label: "DRAW" },
    { id: "highlighter", icon: Highlighter, label: "HIGHLIGHT" },
    { id: "text", icon: Type, label: "TEXT" },
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
              <Save size={14} /> SAVE
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

              <button onClick={undoLast} title="Undo last" className="px-2 py-1.5 text-[10px] font-bold tracking-widest rounded flex items-center gap-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors">
                <Undo2 size={12} /> UNDO
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
                {tool === "mark" ? "Click to mark weld point" : tool === "pan" ? "Drag to move" : tool === "text" ? "Click to add text" : tool === "pencil" || tool === "highlighter" ? "Hold and drag" : "Click and drag to draw"}
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">Upload ISO</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload an image (JPG, PNG) or PDF of the isometric to view and annotate it.
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
                  <Upload size={14} /> SELECT FILE
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
              <div className="text-xs font-bold tracking-widest text-slate-700 mb-2">NEW WELD MARK</div>
              <input
                value={markLabel}
                onChange={(e) => setMarkLabel(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") confirmMark(); if (e.key === "Escape") setPendingMark(null); }}
                placeholder="Ex: FW01, FW02, BW03..."
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPendingMark(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">CANCEL</button>
                <button onClick={confirmMark} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">ADD</button>
              </div>
            </div>
          )}

          {pendingText && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 w-96">
              <div className="text-xs font-bold tracking-widest text-slate-700 mb-2">ADD TEXT</div>
              <input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmText(); if (e.key === "Escape") setPendingText(null); }}
                placeholder="Write your note..."
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPendingText(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">CANCEL</button>
                <button onClick={confirmText} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold tracking-widest rounded transition-colors">ADD</button>
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
              <h3 className="text-sm font-bold tracking-widest text-slate-800">REVISIONS</h3>
            </div>
            <button onClick={createRevision} className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 text-[10px] font-bold tracking-widest rounded flex items-center gap-1 transition-colors">
              <Plus size={12} /> NEW
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
                        {rev.annotations?.length || 0} notes
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
              💡 The <strong>Rev 0</strong> is the original and always stays locked. Create new revisions to add or change annotations.
            </div>
          </div>

          {currentRev && (
            <div className="border-t border-slate-200 p-3 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2">CONTENT OF {currentRev.name}</div>
              {(currentRev.marks?.length || 0) === 0 && (currentRev.annotations?.length || 0) === 0 ? (
                <div className="text-xs text-slate-400 italic">No content in this revision.</div>
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
                    const typeLabel = ann.type === "arrow" ? "Arrow" : ann.type === "line" ? "Line" : ann.type === "circle" ? "Circle" : ann.type === "rectangle" ? "Rectangle" : ann.type === "pencil" ? "Drawing" : ann.type === "highlighter" ? "Highlighter" : ann.type === "text" ? "Text" : ann.type;
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
              onClick={() => { if (confirm("Replace ISO image?")) fileInputRef.current?.click(); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold tracking-widest py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={12} /> REPLACE IMAGE
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
        <div className="text-blue-700 font-semibold text-sm tracking-widest animate-pulse">LOADING SYSTEM...</div>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen users={data.users} welders={data.welders} onLogin={login} />;
  return <AppShell data={data} setData={setData} currentUser={currentUser} logout={logout} view={view} setView={setView} />;
}
