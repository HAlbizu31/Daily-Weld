import React, { useState, useEffect } from "react";
import { Plus, Users, FileText, BarChart3, Trash2, CheckCircle2, XCircle, X, Search, Wrench, ClipboardList, Calendar, AlertCircle, Edit2, LogOut, Shield, HardHat, Eye, LogIn, Menu } from "lucide-react";

const STORAGE_KEY = "weld_app_v4";

const initialData = {
  users: [
    { id: "u1", username: "admin", password: "admin", role: "admin", name: "Administrador" },
    { id: "u2", username: "qc", password: "qc", role: "qc", name: "Inspector QC" },
  ],
  welders: [], isos: [], dailyLogs: [], inspections: [], tools: [],
};

const inputCls = "w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";
const selectCls = "w-full bg-white border border-slate-300 text-sm px-2 py-1.5 rounded focus:border-blue-600 focus:outline-none";
const btnPrimary = "bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-colors rounded shadow-sm";
const btnPrimaryFull = "w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 text-xs tracking-widest mt-2 rounded transition-colors shadow-sm";

function Logo({ size = "md" }) {
  const sizes = {
    sm: { box: "w-8 h-8", text: "text-base", tag: "text-[8px]" },
    md: { box: "w-10 h-10", text: "text-lg", tag: "text-[9px]" },
    lg: { box: "w-16 h-16", text: "text-2xl", tag: "text-xs" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md rounded flex-shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5" fill="none">
          <path d="M4 18 L4 6 M4 6 L20 6 L20 12 L4 12 M4 12 L20 18" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`${s.text} font-black text-blue-900 tracking-tight`}>
          In<span className="text-blue-600">Serv</span>
        </div>
        {size !== "sm" && (
          <div className={`${s.tag} text-slate-500 tracking-[0.15em] font-semibold uppercase`}>Welding Control</div>
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
    setError("Usuario o contraseña incorrectos");
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
          <h2 className="text-slate-800 font-bold text-sm tracking-widest border-b border-slate-100 pb-3">INICIAR SESIÓN</h2>
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
            <LogIn size={14} /> INGRESAR
          </button>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded text-xs text-slate-600">
          <div className="text-blue-700 tracking-widest mb-2 font-bold">CREDENCIALES DEMO:</div>
          <div className="space-y-0.5">
            <div>Admin → <span className="text-slate-900 font-semibold">admin</span> / <span className="text-slate-900 font-semibold">admin</span></div>
            <div>QC → <span className="text-slate-900 font-semibold">qc</span> / <span className="text-slate-900 font-semibold">qc</span></div>
            <div className="text-slate-500 italic mt-1">Soldadores: el admin los crea con su login</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function AppShell({ data, setData, currentUser, logout, view, setView }) {
  const role = currentUser.role;
  const [menuOpen, setMenuOpen] = useState(false);

  const addWelder = (w) => setData((d) => ({ ...d, welders: [...d.welders, { ...w, id: Date.now().toString() }] }));
  const deleteWelder = (id) => { if (!confirm("¿Eliminar soldador?")) return; setData((d) => ({ ...d, welders: d.welders.filter((w) => w.id !== id) })); };
  const addIso = (iso) => setData((d) => ({ ...d, isos: [...d.isos, { ...iso, id: Date.now().toString() }] }));
  const deleteIso = (id) => { if (!confirm("¿Eliminar ISO?")) return; setData((d) => ({ ...d, isos: d.isos.filter((i) => i.id !== id) })); };
  const assignIso = (isoId, welderId) => setData((d) => ({ ...d, isos: d.isos.map((i) => i.id === isoId ? { ...i, welderId } : i) }));
  const saveLog = (log) => setData((d) => log.id ? { ...d, dailyLogs: d.dailyLogs.map((l) => l.id === log.id ? log : l) } : { ...d, dailyLogs: [...d.dailyLogs, { ...log, id: Date.now().toString(), entries: [] }] });
  const deleteLog = (id) => { if (!confirm("¿Eliminar daily log y sus soldaduras?")) return; setData((d) => ({ ...d, dailyLogs: d.dailyLogs.filter((l) => l.id !== id) })); };
  const addEntry = (logId, entry) => setData((d) => ({ ...d, dailyLogs: d.dailyLogs.map((l) => l.id === logId ? { ...l, entries: [...l.entries, { ...entry, id: Date.now().toString() }] } : l) }));
  const deleteEntry = (logId, entryId) => setData((d) => ({ ...d, dailyLogs: d.dailyLogs.map((l) => l.id === logId ? { ...l, entries: l.entries.filter((e) => e.id !== entryId) } : l) }));
  const addTool = (t) => setData((d) => ({ ...d, tools: [...d.tools, { ...t, id: Date.now().toString() }] }));
  const deleteTool = (id) => { if (!confirm("¿Eliminar herramienta?")) return; setData((d) => ({ ...d, tools: d.tools.filter((t) => t.id !== id) })); };
  const reassignTool = (id, welderId) => setData((d) => ({ ...d, tools: d.tools.map((t) => t.id === id ? { ...t, welderId } : t) }));
  const addInspection = (i) => setData((d) => ({ ...d, inspections: [...d.inspections, { ...i, id: Date.now().toString() }] }));
  const deleteInspection = (id) => { if (!confirm("¿Eliminar inspección?")) return; setData((d) => ({ ...d, inspections: d.inspections.filter((i) => i.id !== id) })); };

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

  const tabs = role === "admin" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "welders", icon: Users, label: "SOLDADORES" },
    { id: "isos", icon: FileText, label: "ISOS" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: Eye, label: "QC" },
    { id: "tools", icon: Wrench, label: "HERRAMIENTAS" },
  ] : role === "qc" ? [
    { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
    { id: "logs", icon: ClipboardList, label: "DAILY LOG" },
    { id: "inspections", icon: CheckCircle2, label: "INSPECCIONAR" },
  ] : [
    { id: "dashboard", icon: BarChart3, label: "MI RESUMEN" },
    { id: "logs", icon: ClipboardList, label: "MIS DAILYS" },
    { id: "tools", icon: Wrench, label: "MIS HERRAMIENTAS" },
  ];

  const stats = totalStats();
  const RoleIcon = role === "admin" ? Shield : role === "qc" ? Eye : HardHat;
  const roleColors = role === "admin" ? "border-blue-200 bg-blue-50 text-blue-700" : role === "qc" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const roleLabel = role === "admin" ? "ADMIN" : role === "qc" ? "QC" : "SOLDADOR";
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
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`px-4 py-3 text-xs font-bold tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  active ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {view === "dashboard" && <DashboardView role={role} stats={stats} data={data} visibleLogs={visibleLogs} getWelderStats={getWelderStats} currentUser={currentUser} />}
        {view === "welders" && role === "admin" && <WeldersView welders={data.welders} isos={data.isos} tools={data.tools} getStats={getWelderStats} onAdd={addWelder} onDelete={deleteWelder} />}
        {view === "isos" && role === "admin" && <IsosView isos={data.isos} welders={data.welders} onAdd={addIso} onDelete={deleteIso} onAssign={assignIso} />}
        {view === "logs" && <LogsView role={role} currentUser={currentUser} logs={visibleLogs} welders={data.welders} isos={data.isos} inspections={data.inspections} onSaveLog={saveLog} onDeleteLog={deleteLog} onAddEntry={addEntry} onDeleteEntry={deleteEntry} />}
        {view === "inspections" && (role === "admin" || role === "qc") && <InspectionsView role={role} logs={data.dailyLogs} welders={data.welders} inspections={data.inspections} onAdd={addInspection} onDelete={deleteInspection} />}
        {view === "tools" && <ToolsView role={role} currentUser={currentUser} tools={data.tools} welders={data.welders} onAdd={addTool} onDelete={deleteTool} onReassign={reassignTool} />}
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
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">MI RESUMEN</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{currentUser.name.toUpperCase()} · #{currentUser.welderId}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="MIS SOLDADURAS" value={myStats.total} />
          <KPI label="ACEPTADAS" value={myStats.accepted} sub={`${myStats.acceptRate}%`} color="emerald" />
          <KPI label="RECHAZADAS" value={myStats.rejected} sub={`${myStats.rejectRate}%`} color="red" />
          <KPI label="PENDIENTES" value={myStats.pending} sub="por inspeccionar" color="amber" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card title="ISOs EN MIS MANOS">
            {myIsos.length === 0 ? <div className="text-slate-400 text-sm">Sin ISOs asignados</div> : (
              <div className="flex flex-wrap gap-1.5">
                {myIsos.map((iso) => <span key={iso.id} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 font-mono rounded">{iso.number}</span>)}
              </div>
            )}
          </Card>
          <Card title="MIS HERRAMIENTAS">
            {myTools.length === 0 ? <div className="text-slate-400 text-sm">Sin herramientas asignadas</div> : (
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
        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">RESUMEN GENERAL</h2>
        <p className="text-slate-500 text-xs tracking-wider font-semibold">ESTADO ACTUAL DE OPERACIONES</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="SOLDADORES" value={data.welders.length} sub="activos en planta" />
        <KPI label="ISOs ACTIVOS" value={`${data.isos.filter((i) => i.welderId).length}/${data.isos.length}`} sub="asignados / total" color="blue" />
        <KPI label="ACEPTADAS" value={stats.accepted} sub={`${stats.acceptRate}% del total`} color="emerald" />
        <KPI label="RECHAZADAS" value={stats.rejected} sub={`${stats.rejectRate}% del total`} color="red" />
      </div>
      <Card>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs text-slate-500 tracking-widest font-semibold">TOTAL DE SOLDADURAS</div>
            <div className="text-4xl font-black mt-1 text-slate-900">{stats.total}</div>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <div className="text-emerald-600 font-medium">● Aceptadas: {stats.accepted}</div>
            <div className="text-red-600 font-medium">● Rechazadas: {stats.rejected}</div>
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
      <Card title="DESEMPEÑO POR SOLDADOR" subtitle="% ACEPTACIÓN" noPadding>
        {data.welders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No hay soldadores registrados.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.welders.map((w) => ({ ...w, stats: getWelderStats(w.id) })).sort((a, b) => b.stats.total - a.stats.total).map((w) => (
              <div key={w.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{w.name}</div>
                    <div className="text-xs text-slate-500">#{w.welderId} · {w.stats.total} soldaduras</div>
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
    if (existing.find((w) => w.welderId.toLowerCase() === welderId.trim().toLowerCase())) { setError("Ya existe un soldador con ese ID"); return; }
    onSave({ name: name.trim(), welderId: welderId.trim().toUpperCase(), password: password.trim() });
    onClose();
  };

  return (
    <ModalShell title="NUEVO SOLDADOR" onClose={onClose}>
      <Field label="NOMBRE COMPLETO"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Hector Albizu" autoFocus /></Field>
      <Field label="WELDER ID"><input value={welderId} onChange={(e) => setWelderId(e.target.value)} className={inputCls} placeholder="5892" /></Field>
      <Field label="CONTRASEÑA (PARA LOGIN)">
        <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="contraseña" />
        <div className="text-[10px] text-slate-500 mt-1">Esta es la contraseña que usará el soldador para entrar a la app.</div>
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
          <h2 className="text-2xl font-black tracking-tight text-slate-900">SOLDADORES</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{welders.length} REGISTRADOS</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVO</button>
      </div>
      {welders.length === 0 ? <EmptyState icon={Users} text="Aún no hay soldadores. Agrega el primero." /> : (
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

function IsoModal({ onClose, onSave, welders }) {
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [welderId, setWelderId] = useState("");
  const submit = () => { if (!number.trim()) return; onSave({ number: number.trim().toUpperCase(), description: description.trim(), welderId: welderId || null }); onClose(); };
  return (
    <ModalShell title="NUEVO ISO" onClose={onClose}>
      <Field label="NÚMERO DE ISO"><input value={number} onChange={(e) => setNumber(e.target.value)} className={inputCls} placeholder="4.00-HPUR-SS02-3006001-F4-49" autoFocus /></Field>
      <Field label="DESCRIPCIÓN (OPCIONAL)"><input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Línea HPUR" /></Field>
      <Field label="ASIGNAR A SOLDADOR">
        <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls}>
          <option value="">— Sin asignar —</option>
          {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
        </select>
      </Field>
      <button onClick={submit} className={btnPrimaryFull}>REGISTRAR</button>
    </ModalShell>
  );
}

function IsosView({ isos, welders, onAdd, onDelete, onAssign }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">ISOMÉTRICOS</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">SEGUIMIENTO DE PLANOS</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVO ISO</button>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ISO..." className={inputCls + " pl-9"} />
      </div>
      {isos.length === 0 ? <EmptyState icon={FileText} text="No hay ISOs registrados." /> : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">ISO</th>
                  <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">DESCRIPCIÓN</th>
                  <th className="text-left px-4 py-3 font-bold">SOLDADOR</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isos.filter((i) => i.number.toLowerCase().includes(search.toLowerCase())).map((iso) => (
                  <tr key={iso.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-blue-700 font-bold text-xs">{iso.number}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{iso.description || "—"}</td>
                    <td className="px-4 py-3">
                      <select value={iso.welderId || ""} onChange={(e) => onAssign(iso.id, e.target.value || null)} className={selectCls + " max-w-[180px]"}>
                        <option value="">— Sin asignar —</option>
                        {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(iso.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {showModal && <IsoModal onClose={() => setShowModal(false)} onSave={onAdd} welders={welders} />}
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

  const submit = () => {
    if (!welderId || !date) return;
    onSave({ ...(editing || {}), welderId, date, jobNumber: jobNumber.trim(), gasCylinder: gasCylinder.trim(), lot1: lot1.trim(), lot2: lot2.trim(), cylinder: cylinder.trim() });
  };

  return (
    <ModalShell title={editing ? "EDITAR DAILY LOG" : "NUEVO DAILY LOG"} onClose={onClose}>
      {role !== "welder" && (
        <Field label="SOLDADOR">
          <select value={welderId} onChange={(e) => setWelderId(e.target.value)} className={selectCls} autoFocus>
            <option value="">— Selecciona —</option>
            {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
          </select>
        </Field>
      )}
      <Field label="FECHA"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
      <Field label="JOB #"><input value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} className={inputCls} placeholder="24.715.002" /></Field>
      <Field label="GAS CYLINDER"><input value={gasCylinder} onChange={(e) => setGasCylinder(e.target.value)} className={inputCls} placeholder="S078601P" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="LOT 1 #"><input value={lot1} onChange={(e) => setLot1(e.target.value)} className={inputCls} /></Field>
        <Field label="LOT 2 #"><input value={lot2} onChange={(e) => setLot2(e.target.value)} className={inputCls} /></Field>
      </div>
      <Field label="CYLINDER"><input value={cylinder} onChange={(e) => setCylinder(e.target.value)} className={inputCls} placeholder="411-005-S9" /></Field>
      <button onClick={submit} className={btnPrimaryFull}>{editing ? "GUARDAR CAMBIOS" : "CREAR LOG"}</button>
    </ModalShell>
  );
}

function EntryModal({ onClose, onSave, isos }) {
  const [size, setSize] = useState("");
  const [machine, setMachine] = useState("");
  const [iso, setIso] = useState("");
  const [weldNumber, setWeldNumber] = useState("");
  const [bottle, setBottle] = useState("1");
  const [program, setProgram] = useState("");
  const [head, setHead] = useState("");
  const [system, setSystem] = useState("");
  const [comments, setComments] = useState("");

  const submit = () => {
    if (!iso.trim() || !weldNumber.trim()) return;
    onSave({ size: size.trim(), machine: machine.trim(), iso: iso.trim().toUpperCase(), weldNumber: weldNumber.trim().toUpperCase(), bottle: bottle.trim(), program: program.trim(), head: head.trim(), system: system.trim(), comments: comments.trim() });
  };

  return (
    <ModalShell title="NUEVA SOLDADURA" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SIZE"><input value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} placeholder="4.00" autoFocus /></Field>
        <Field label="MACHINE NUMBER"><input value={machine} onChange={(e) => setMachine(e.target.value)} className={inputCls} placeholder="8507420200" /></Field>
      </div>
      <Field label="ISO NUMBER">
        {isos.length > 0 ? (
          <select value={iso} onChange={(e) => setIso(e.target.value)} className={selectCls}>
            <option value="">— Selecciona ISO —</option>
            {isos.map((i) => <option key={i.id} value={i.number}>{i.number}</option>)}
            <option value="OTHER">Otro (escribir)</option>
          </select>
        ) : <input value={iso} onChange={(e) => setIso(e.target.value)} className={inputCls} />}
        {iso === "OTHER" && <input onChange={(e) => setIso(e.target.value)} className={inputCls + " mt-2"} placeholder="Escribir ISO" autoFocus />}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="WELD NUMBER"><input value={weldNumber} onChange={(e) => setWeldNumber(e.target.value)} className={inputCls} placeholder="FW8" /></Field>
        <Field label="BOTTLE/DEWAR"><input value={bottle} onChange={(e) => setBottle(e.target.value)} className={inputCls} placeholder="1" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="PROGRAM"><input value={program} onChange={(e) => setProgram(e.target.value)} className={inputCls} placeholder="5" /></Field>
        <Field label="HEAD"><input value={head} onChange={(e) => setHead(e.target.value)} className={inputCls} placeholder="8287..." /></Field>
        <Field label="SYSTEM"><input value={system} onChange={(e) => setSystem(e.target.value)} className={inputCls} placeholder="HPUR" /></Field>
      </div>
      <Field label="COMMENTS"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls + " resize-none"} rows={2} /></Field>
      <button onClick={submit} className={btnPrimaryFull}>REGISTRAR SOLDADURA</button>
    </ModalShell>
  );
}

function LogsView({ role, currentUser, logs, welders, isos, inspections, onSaveLog, onDeleteLog, onAddEntry, onDeleteEntry }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeLogId, setActiveLogId] = useState(null);
  const canEdit = role === "admin" || role === "welder";
  const canCreate = role === "welder" || role === "admin";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">DAILY WELD LOG</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{logs.length} REPORTES · {logs.reduce((s, l) => s + l.entries.length, 0)} SOLDADURAS</p>
        </div>
        {canCreate && (
          <button onClick={() => { setEditingLog(null); setShowLogModal(true); }} disabled={role === "admin" && welders.length === 0} className={btnPrimary + " disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"}>
            <Plus size={14} /> NUEVO LOG
          </button>
        )}
      </div>

      {logs.length === 0 ? <EmptyState icon={ClipboardList} text={role === "qc" ? "No hay daily logs todavía." : "Crea tu primer daily log."} /> : (
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
                          {new Date(log.date + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
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
                    <Info label="GAS CYLINDER" value={log.gasCylinder} />
                    <Info label="LOT 1 #" value={log.lot1} />
                    <Info label="LOT 2 #" value={log.lot2} />
                    <Info label="CYLINDER" value={log.cylinder} />
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
                        <tr><td colSpan={11} className="px-4 py-6 text-center text-slate-400">Sin soldaduras en este log.</td></tr>
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
                              <td className="px-2 py-2"><button onClick={() => onDeleteEntry(log.id, e.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button></td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {canEdit && (role === "admin" || log.welderId === currentUser.id) && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex justify-between items-center">
                    <span className="text-xs text-slate-500">{log.entries.length} soldaduras</span>
                    <button onClick={() => setActiveLogId(log.id)} className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 font-bold tracking-widest rounded flex items-center gap-1 transition-colors">
                      <Plus size={12} /> AGREGAR SOLDADURA
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
    if (status === "rejected" && !reason) { alert("Selecciona el motivo del rechazo"); return; }
    onSave({ weldRef: entry.weldRef, status, reason: status === "rejected" ? reason : "", comments: comments.trim(), qcInitial: qcInitial.trim().toUpperCase(), date: new Date().toISOString() });
  };

  return (
    <ModalShell title="INSPECCIONAR SOLDADURA" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-100 p-3 rounded space-y-1 text-xs">
        <div><span className="text-slate-500">Soldador:</span> <span className="font-bold text-slate-900">{welder?.name}</span></div>
        <div><span className="text-slate-500">ISO:</span> <span className="font-mono text-blue-700">{entry.iso}</span></div>
        <div><span className="text-slate-500">Weld #:</span> <span className="font-mono font-bold">{entry.weldNumber}</span></div>
        <div><span className="text-slate-500">System:</span> <span className="font-mono">{entry.system}</span></div>
      </div>
      <Field label="RESULTADO">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "accepted", label: "ACEPTADA", icon: CheckCircle2, activeBg: "bg-emerald-50 border-emerald-500 text-emerald-700" },
            { v: "rejected", label: "RECHAZADA", icon: XCircle, activeBg: "bg-red-50 border-red-500 text-red-700" },
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
            <option value="">— Selecciona motivo —</option>
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
      <Field label="COMENTARIOS (OPCIONAL)"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder="Notas adicionales..." /></Field>
      <Field label="INICIALES QC"><input value={qcInitial} onChange={(e) => setQcInitial(e.target.value)} className={inputCls} placeholder="JR" maxLength={5} /></Field>
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
        <p className="text-slate-500 text-xs tracking-wider font-semibold">{pending.length} PENDIENTES · {inspections.filter((i) => i.status === "rejected").length} RECHAZOS</p>
      </div>
      {role === "qc" && (
        <div className="bg-cyan-50 border border-cyan-200 px-4 py-3 text-xs text-cyan-800 flex items-start gap-2 rounded">
          <Eye size={14} className="mt-0.5 flex-shrink-0" />
          <div>Como inspector QC, eres el único que puede aprobar o rechazar soldaduras.</div>
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-widest text-blue-700">PENDIENTES DE INSPECCIÓN ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">No hay soldaduras pendientes.</div>
        ) : (
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 tracking-widest">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold">FECHA</th>
                    <th className="text-left px-3 py-2 font-bold">SOLDADOR</th>
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
                        <td className="px-3 py-2 text-slate-600">{new Date(e.logDate + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}</td>
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
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">Sin inspecciones registradas.</div>
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
                          {insp.status === "accepted" ? "✓ ACEPTADA" : "✗ RECHAZADA"}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(insp.date).toLocaleDateString("es-MX")}</span>
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
    <ModalShell title="NUEVA HERRAMIENTA" onClose={onClose}>
      <Field label="NOMBRE / DESCRIPCIÓN"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Máquina orbital Polysoude" autoFocus /></Field>
      <Field label="SERIAL NUMBER"><input value={serial} onChange={(e) => setSerial(e.target.value)} className={inputCls} placeholder="8507420200" /></Field>
      <Field label="ASIGNAR A SOLDADOR">
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
  const visibleTools = role === "welder" ? tools.filter((t) => t.welderId === currentUser.id) : tools;
  const canManage = role === "admin";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">{role === "welder" ? "MIS HERRAMIENTAS" : "HERRAMIENTAS"}</h2>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">{visibleTools.length} REGISTRADAS</p>
        </div>
        {canManage && <button onClick={() => setShowModal(true)} className={btnPrimary}><Plus size={14} /> NUEVA</button>}
      </div>
      {visibleTools.length === 0 ? <EmptyState icon={Wrench} text={role === "welder" ? "No tienes herramientas asignadas." : "No hay herramientas registradas."} /> : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs tracking-widest text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">HERRAMIENTA</th>
                  <th className="text-left px-4 py-3 font-bold">SERIAL</th>
                  <th className="text-left px-4 py-3 font-bold">ASIGNADA A</th>
                  {canManage && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleTools.map((t) => {
                  const w = welders.find((w) => w.id === t.welderId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-blue-700 text-xs">{t.serial}</td>
                      <td className="px-4 py-3">
                        {canManage ? (
                          <select value={t.welderId || ""} onChange={(e) => onReassign(t.id, e.target.value || null)} className={selectCls + " max-w-[180px]"}>
                            <option value="">— Sin asignar —</option>
                            {welders.map((w) => <option key={w.id} value={w.id}>{w.name} (#{w.welderId})</option>)}
                          </select>
                        ) : <span className="text-xs">{w ? `${w.name} (#${w.welderId})` : "—"}</span>}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
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
      {showModal && <ToolModal onClose={() => setShowModal(false)} onSave={onAdd} welders={welders} />}
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
          if (!parsed.users.find((u) => u.username === "admin")) parsed.users.push({ id: "u1", username: "admin", password: "admin", role: "admin", name: "Administrador" });
          if (!parsed.users.find((u) => u.username === "qc")) parsed.users.push({ id: "u2", username: "qc", password: "qc", role: "qc", name: "Inspector QC" });
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
