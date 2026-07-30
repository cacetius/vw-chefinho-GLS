import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays, format, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wrench, ClipboardCheck, Sparkles, Tag, AlertTriangle,
  CheckCircle2, Clock, MapPin, Plus, Camera, FileCheck,
  ChevronRight, X, Upload, AlertCircle, CheckSquare,
  TrendingUp, TrendingDown, BarChart3, Activity,
  Target, Shield, Settings, ArrowRight, Circle,
  ChevronDown, ChevronUp, Gauge
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────

const NC_SEV_CONFIG = {
  critica: { label: "Crítica", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", ring: "border-l-red-500" },
  maior:   { label: "Maior",   dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", ring: "border-l-amber-500" },
  menor:   { label: "Menor",   dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200", ring: "border-l-blue-400" },
};

const NC_STATUS_CONFIG = {
  aberta:               { label: "Aberta",               color: "text-red-600",    bg: "bg-red-50" },
  em_andamento:         { label: "Em andamento",         color: "text-amber-600",  bg: "bg-amber-50" },
  pendente_verificacao: { label: "Ag. verificação",      color: "text-blue-600",   bg: "bg-blue-50" },
  encerrada:            { label: "Encerrada",             color: "text-emerald-600",bg: "bg-emerald-50" },
};

const NC_CAT_LABELS = {
  ferramenta: "Ferramenta", etiqueta: "Etiqueta", calibracao: "Calibração",
  "5s": "5S", seguranca: "Segurança", equipamento: "Equipamento",
  processo: "Processo", bancada: "Bancada", outro: "Outro",
};

const ETIQ_STATUS = { ok: { label: "OK", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" }, desgastada: { label: "Desgastada", cls: "text-amber-600 bg-amber-50 border-amber-200" }, substituir: { label: "Substituir", cls: "text-red-600 bg-red-50 border-red-200" } };

// ─── Componentes base ────────────────────────────────────────────────────────

function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusDot({ ok }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? "bg-emerald-500" : "bg-red-500"}`} />;
}

function KpiCell({ value, label, variant = "default" }) {
  const clr = variant === "danger" ? "text-red-600" : variant === "warn" ? "text-amber-600" : variant === "ok" ? "text-emerald-600" : "text-slate-800";
  return (
    <div className="min-w-0">
      <p className={`text-2xl font-black tabular-nums leading-none ${clr}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

// ─── Modal NC ────────────────────────────────────────────────────────────────

function NCModal({ open, onClose, onSave, editItem, currentUser, ferramentas }) {
  const [form, setForm] = useState({
    titulo: "", categoria: "ferramenta", severidade: "menor", area: "",
    celula: "", tacto: "", localizacao_detalhe: "", responsavel: "",
    descricao: "", acao_corretiva: "", prazo: "", ferramenta_id: "", ferramenta_nome: "", fotos: [],
  });
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("geral");

  useEffect(() => {
    if (editItem) setForm({ ...editItem });
    else setForm({
      titulo: "", categoria: "ferramenta", severidade: "menor", area: "",
      celula: "", tacto: "", localizacao_detalhe: "", responsavel: "",
      descricao: "", acao_corretiva: "", prazo: "", ferramenta_id: "", ferramenta_nome: "", fotos: [],
    });
    setTab("geral");
  }, [editItem, open]);

  const handleFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, fotos: [...(f.fotos || []), file_url] }));
    setUploading(false);
  };

  const removeFoto = (idx) => setForm(f => ({ ...f, fotos: f.fotos.filter((_, i) => i !== idx) }));

  const handleFerramenta = (id) => {
    const f = ferramentas.find(x => x.id === id);
    setForm(prev => ({ ...prev, ferramenta_id: id, ferramenta_nome: f?.nome || "", area: f?.area || prev.area, celula: f?.celula || prev.celula }));
  };

  const handleSave = () => {
    if (!form.titulo || !form.categoria || !form.area) return;
    onSave({
      ...form,
      registrado_por: currentUser?.full_name || "",
      registrado_por_id: currentUser?.id || "",
    });
  };

  if (!open) return null;

  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "local", label: "Local" },
    { id: "acao", label: "Ação" },
    { id: "fotos", label: `Fotos${form.fotos?.length ? ` (${form.fotos.length})` : ""}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{editItem ? "Editar Não Conformidade" : "Registrar Não Conformidade"}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Preencha os dados do problema encontrado</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs font-medium py-2.5 px-3 border-b-2 -mb-px transition-colors ${tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {tab === "geral" && (
            <>
              <Field label="Título *">
                <input className="input-field" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Descreva o problema brevemente" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoria *">
                  <select className="input-field" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {Object.entries(NC_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Severidade">
                  <select className="input-field" value={form.severidade} onChange={e => setForm(f => ({ ...f, severidade: e.target.value }))}>
                    <option value="menor">Menor</option>
                    <option value="maior">Maior</option>
                    <option value="critica">Crítica</option>
                  </select>
                </Field>
              </div>
              {form.categoria === "ferramenta" && (
                <Field label="Ferramenta relacionada">
                  <select className="input-field" value={form.ferramenta_id} onChange={e => handleFerramenta(e.target.value)}>
                    <option value="">Selecionar...</option>
                    {ferramentas.map(f => <option key={f.id} value={f.id}>{f.nome} {f.codigo ? `(${f.codigo})` : ""}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Descrição">
                <textarea className="input-field resize-none" rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes do problema..." />
              </Field>
            </>
          )}

          {tab === "local" && (
            <>
              <Field label="Área *">
                <input className="input-field" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Ex: Montagem Final" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Célula">
                  <input className="input-field" value={form.celula} onChange={e => setForm(f => ({ ...f, celula: e.target.value }))} />
                </Field>
                <Field label="Tacto">
                  <input className="input-field" value={form.tacto} onChange={e => setForm(f => ({ ...f, tacto: e.target.value }))} />
                </Field>
              </div>
              <Field label="Localização detalhada">
                <input className="input-field" value={form.localizacao_detalhe} onChange={e => setForm(f => ({ ...f, localizacao_detalhe: e.target.value }))} placeholder="Bancada 3, lado esquerdo..." />
              </Field>
            </>
          )}

          {tab === "acao" && (
            <>
              <Field label="Responsável">
                <input className="input-field" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do responsável" />
              </Field>
              <Field label="Prazo">
                <input type="date" className="input-field" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
              </Field>
              <Field label="Ação corretiva">
                <textarea className="input-field resize-none" rows={4} value={form.acao_corretiva} onChange={e => setForm(f => ({ ...f, acao_corretiva: e.target.value }))} placeholder="Descreva a ação para resolução..." />
              </Field>
            </>
          )}

          {tab === "fotos" && (
            <div>
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /><span className="text-sm">Enviando...</span></div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">Adicionar foto</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tire ou selecione da galeria</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} disabled={uploading} />
              </label>
              {form.fotos?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {form.fotos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeFoto(idx)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-2.5">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            {editItem ? "Salvar alterações" : "Registrar NC"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── NC Row ──────────────────────────────────────────────────────────────────

function NCRow({ nc, onEdit, onStatus }) {
  const sev = NC_SEV_CONFIG[nc.severidade] || NC_SEV_CONFIG.menor;
  const sta = NC_STATUS_CONFIG[nc.status] || NC_STATUS_CONFIG.aberta;
  const vencido = nc.prazo && isPast(new Date(nc.prazo + "T00:00:00")) && nc.status !== "encerrada";

  return (
    <div className={`border-l-2 ${sev.ring} bg-white border border-slate-100 rounded-lg p-3 flex gap-3 group`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-900 leading-snug flex-1">{nc.titulo}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${sev.badge}`}>{sev.label}</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{nc.area}{nc.celula ? ` · ${nc.celula}` : ""}</span>
          <span>{NC_CAT_LABELS[nc.categoria]}</span>
          {nc.responsavel && <span>→ {nc.responsavel}</span>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sta.bg} ${sta.color}`}>{sta.label}</span>
          {vencido && <span className="text-[10px] text-red-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />Vencida</span>}
          {nc.fotos?.length > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Camera className="w-2.5 h-2.5" />{nc.fotos.length}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(nc)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
          <Settings className="w-3.5 h-3.5" />
        </button>
        {nc.status !== "encerrada" && (
          <button onClick={() => onStatus(nc)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-slate-300 hover:text-emerald-600">
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ferramenta row ──────────────────────────────────────────────────────────

function FerramentaRow({ f }) {
  const hoje = new Date();
  let calStatus = null;
  if (f.calibracao_obrigatoria && f.data_vencimento_calibracao) {
    const venc = new Date(f.data_vencimento_calibracao + "T00:00:00");
    const dias = differenceInDays(venc, hoje);
    if (dias < 0) calStatus = { label: "Vencida", cls: "text-red-600 bg-red-50 border-red-200" };
    else if (dias <= 30) calStatus = { label: `${dias}d`, cls: "text-amber-600 bg-amber-50 border-amber-200" };
    else calStatus = { label: "OK", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  }
  const etiqOk = f.etiqueta_status === "ok" || !f.etiqueta_status;
  const etiq = ETIQ_STATUS[f.etiqueta_status || "ok"];

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
      <td className="py-2.5 pr-3">
        <p className="text-sm font-medium text-slate-900 leading-tight">{f.nome}</p>
        {f.codigo && <p className="text-[10px] text-slate-400">{f.codigo}</p>}
      </td>
      <td className="py-2.5 pr-3 text-xs text-slate-500">{f.area || "—"}</td>
      <td className="py-2.5 pr-3">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${etiq.cls}`}>{etiq.label}</span>
      </td>
      <td className="py-2.5">
        {f.calibracao_obrigatoria ? (
          calStatus ? (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${calStatus.cls}`}>{calStatus.label}</span>
          ) : <span className="text-[10px] text-slate-300">Sem data</span>
        ) : <span className="text-[10px] text-slate-300">N/A</span>}
      </td>
    </tr>
  );
}

// ─── Accordeon section ───────────────────────────────────────────────────────

function AccordionSection({ title, icon: Icon, badge, badgeVariant = "default", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeCls = badgeVariant === "danger" ? "bg-red-500 text-white" : badgeVariant === "warn" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        {badge != null && <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{badge}</span>}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function MochilaMonitor() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [ncModal, setNcModal] = useState(false);
  const [editingNC, setEditingNC] = useState(null);
  const [ncFilter, setNcFilter] = useState("todas");

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  // ── Dados ──────────────────────────────────────────────────
  const { data: ferramentas = [] } = useQuery({
    queryKey: ["ferramentasMochila"],
    queryFn: () => base44.entities.Ferramenta.list("-created_date", 100),
    enabled: !!currentUser,
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ["auditoriasMochila"],
    queryFn: () => base44.entities.AuditoriaProcesso.list("-created_date", 50),
    enabled: !!currentUser,
  });

  const { data: cincoS = [] } = useQuery({
    queryKey: ["cincosMochila"],
    queryFn: () => base44.entities.CincoS.list("-created_date", 20),
    enabled: !!currentUser,
  });

  const { data: ncs = [], refetch: refetchNcs } = useQuery({
    queryKey: ["ncsMochila"],
    queryFn: () => base44.entities.NaoConformidade.list("-created_date", 100),
    enabled: !!currentUser,
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planosAcaoMochila"],
    queryFn: () => base44.entities.PlanoAcaoVDA.list("-created_date", 30),
    enabled: !!currentUser,
  });

  // ── Mutations ──────────────────────────────────────────────
  const saveNC = useMutation({
    mutationFn: (data) => editingNC
      ? base44.entities.NaoConformidade.update(editingNC.id, data)
      : base44.entities.NaoConformidade.create(data),
    onSuccess: () => { refetchNcs(); setNcModal(false); setEditingNC(null); },
  });

  const closeNC = useMutation({
    mutationFn: (nc) => base44.entities.NaoConformidade.update(nc.id, {
      status: nc.status === "encerrada" ? "aberta" : "em_andamento",
    }),
    onSuccess: () => refetchNcs(),
  });

  // ── Métricas ───────────────────────────────────────────────
  const metrics = useMemo(() => {
    const hoje = new Date();
    const calVencidas = ferramentas.filter(f => {
      if (!f.calibracao_obrigatoria || !f.data_vencimento_calibracao) return false;
      return isPast(new Date(f.data_vencimento_calibracao + "T00:00:00"));
    }).length;
    const etiqProblema = ferramentas.filter(f => f.etiqueta_status && f.etiqueta_status !== "ok").length;
    const ncAbertas = ncs.filter(n => n.status === "aberta").length;
    const ncCriticas = ncs.filter(n => n.severidade === "critica" && n.status !== "encerrada").length;
    const audsNC = auditorias.filter(a => a.conformidade === "nao_conforme").length;
    const planosAbertos = planosAcao.filter(p => p.status === "aberto" || p.status === "em_andamento").length;
    const ultimoCincoS = cincoS[0];
    const scoreS = ultimoCincoS ? Math.round((ultimoCincoS.pontuacao_total || 0) * 2) : null;
    return { calVencidas, etiqProblema, ncAbertas, ncCriticas, audsNC, planosAbertos, scoreS };
  }, [ferramentas, ncs, auditorias, planosAcao, cincoS]);

  // ── NC filtradas ───────────────────────────────────────────
  const ncsFiltradas = useMemo(() => {
    if (ncFilter === "todas") return ncs;
    if (ncFilter === "abertas") return ncs.filter(n => n.status === "aberta");
    if (ncFilter === "criticas") return ncs.filter(n => n.severidade === "critica" && n.status !== "encerrada");
    if (ncFilter === "encerradas") return ncs.filter(n => n.status === "encerrada");
    return ncs;
  }, [ncs, ncFilter]);

  // ── Ferramenta flags ───────────────────────────────────────
  const ferrProblema = useMemo(() =>
    ferramentas.filter(f => {
      const etiqOk = !f.etiqueta_status || f.etiqueta_status === "ok";
      const calOk = !f.calibracao_obrigatoria || !f.data_vencimento_calibracao || !isPast(new Date(f.data_vencimento_calibracao + "T00:00:00"));
      return !etiqOk || !calOk;
    }),
  [ferramentas]);

  const hasAlerts = metrics.ncCriticas > 0 || metrics.calVencidas > 0;

  const openNewNC = () => { setEditingNC(null); setNcModal(true); };
  const openEditNC = (nc) => { setEditingNC(nc); setNcModal(true); };

  return (
    <>
      <style>{`
        .input-field { width:100%; border:1px solid #e2e8f0; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; color:#0f172a; background:#fff; outline:none; }
        .input-field:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
        select.input-field { appearance: auto; }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-5 pb-8">

        {/* ── Cabeçalho ── */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Mochila do Monitor</h1>
            <p className="text-xs text-slate-400 mt-0.5">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
          </div>
          {currentUser && (
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">{currentUser.full_name?.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-400">{currentUser.equipe || "Monitor"}</p>
            </div>
          )}
        </div>

        {/* ── Alerta crítico ── */}
        {hasAlerts && (
          <div className="bg-red-600 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Atenção imediata necessária</p>
              <p className="text-xs text-red-200 mt-0.5">
                {[
                  metrics.ncCriticas > 0 && `${metrics.ncCriticas} NC crítica${metrics.ncCriticas > 1 ? "s" : ""}`,
                  metrics.calVencidas > 0 && `${metrics.calVencidas} calibração vencida${metrics.calVencidas > 1 ? "s" : ""}`,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-4 gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {[
            { ...({ value: metrics.ncAbertas, label: "NCs abertas", variant: metrics.ncAbertas > 0 ? "danger" : "ok" }) },
            { ...({ value: metrics.calVencidas, label: "Cal. vencidas", variant: metrics.calVencidas > 0 ? "danger" : "ok" }) },
            { ...({ value: metrics.planosAbertos, label: "Planos ativos", variant: metrics.planosAbertos > 2 ? "warn" : "default" }) },
            { ...({ value: metrics.scoreS != null ? `${metrics.scoreS}%` : "—", label: "Score 5S", variant: metrics.scoreS != null && metrics.scoreS < 60 ? "danger" : "ok" }) },
          ].map((k, i) => (
            <div key={i} className={`p-3 ${i < 3 ? "border-r border-slate-100" : ""}`}>
              <KpiCell {...k} />
            </div>
          ))}
        </div>

        {/* ── Ferramentas ── */}
        <AccordionSection
          title="Ferramentas"
          icon={Wrench}
          badge={ferrProblema.length > 0 ? ferrProblema.length : null}
          badgeVariant={ferrProblema.length > 0 ? "warn" : "default"}
          defaultOpen
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-400">{ferramentas.length} ferramentas · {ferrProblema.length} com pendências</p>
              <button onClick={() => navigate(createPageUrl("Ferramentas"))} className="text-[11px] text-blue-600 font-medium flex items-center gap-0.5 hover:underline">
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {ferramentas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma ferramenta cadastrada</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left min-w-[380px]">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide border-b border-slate-100">
                      <th className="pb-2 pr-3">Ferramenta</th>
                      <th className="pb-2 pr-3">Área</th>
                      <th className="pb-2 pr-3">Etiqueta</th>
                      <th className="pb-2">Calibração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ferrProblema.length > 0 ? ferrProblema : ferramentas).slice(0, 8).map(f => (
                      <FerramentaRow key={f.id} f={f} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* ── Auditorias ── */}
        <AccordionSection
          title="Auditorias"
          icon={ClipboardCheck}
          badge={metrics.audsNC > 0 ? metrics.audsNC : null}
          badgeVariant={metrics.audsNC > 0 ? "danger" : "default"}
          defaultOpen={metrics.audsNC > 0}
        >
          <div className="divide-y divide-slate-50">
            {auditorias.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">Nenhuma auditoria registrada</p>
            ) : auditorias.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <StatusDot ok={a.conformidade !== "nao_conforme"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{a.area}{a.categoria ? ` · ${a.categoria}` : ""}</p>
                  {a.condicao_encontrada && <p className="text-[11px] text-slate-400 truncate">{a.condicao_encontrada}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${a.conformidade === "nao_conforme" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {a.conformidade === "nao_conforme" ? "NC" : a.conformidade === "conforme" ? "Conforme" : "Em análise"}
                  </span>
                  {a.data && <p className="text-[10px] text-slate-300 mt-0.5">{format(new Date(a.data + "T00:00:00"), "dd/MM")}</p>}
                </div>
              </div>
            ))}
            <div className="px-4 py-2.5">
              <button onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Acessar auditorias <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </AccordionSection>

        {/* ── 5S ── */}
        <AccordionSection
          title="Gestão 5S"
          icon={Sparkles}
          badge={metrics.scoreS != null ? `${metrics.scoreS}%` : null}
          badgeVariant={metrics.scoreS != null && metrics.scoreS < 60 ? "danger" : "default"}
        >
          <div className="px-4 py-3">
            {cincoS.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">Nenhuma avaliação 5S registrada</p>
            ) : (
              <div className="space-y-3">
                {cincoS.slice(0, 3).map(s => {
                  const score = Math.round((s.pontuacao_total || 0) * 2);
                  const items = [
                    { label: "Utilização", val: s.utilizacao },
                    { label: "Organização", val: s.organizacao },
                    { label: "Limpeza", val: s.limpeza },
                    { label: "Padronização", val: s.padronizacao },
                    { label: "Disciplina", val: s.disciplina },
                  ];
                  return (
                    <div key={s.id} className="border border-slate-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{s.area}</p>
                          <p className="text-[10px] text-slate-400">{s.data ? format(new Date(s.data + "T00:00:00"), "dd/MM/yyyy") : ""}</p>
                        </div>
                        <div className={`text-sm font-black ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}>{score}%</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {items.map(it => (
                          <div key={it.label} className="text-center">
                            <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-1">
                              <div className={`h-full rounded-full ${(it.val || 0) >= 7 ? "bg-emerald-500" : (it.val || 0) >= 5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${((it.val || 0) / 10) * 100}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 leading-none">{it.label.slice(0, 4)}</p>
                            <p className="text-[10px] font-semibold text-slate-700">{it.val ?? "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => navigate(createPageUrl("CincoS"))} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                  Ver histórico 5S <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* ── Plano de Ação ── */}
        <AccordionSection
          title="Planos de Ação"
          icon={Target}
          badge={metrics.planosAbertos > 0 ? metrics.planosAbertos : null}
          badgeVariant={metrics.planosAbertos > 0 ? "warn" : "default"}
        >
          <div className="divide-y divide-slate-50">
            {planosAcao.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">Nenhum plano de ação cadastrado</p>
            ) : planosAcao.slice(0, 5).map(p => {
              const venc = p.prazo_conclusao ? isPast(new Date(p.prazo_conclusao + "T00:00:00")) && p.status !== "concluido" : false;
              return (
                <div key={p.id} className="flex items-start gap-3 px-4 py-2.5">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === "concluido" ? "bg-emerald-500" : venc ? "bg-red-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-1">{p.nao_conformidade}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.responsavel_nome || "—"}{p.prazo_conclusao ? ` · ${format(new Date(p.prazo_conclusao + "T00:00:00"), "dd/MM")}` : ""}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${p.status === "concluido" ? "bg-emerald-50 text-emerald-700" : venc ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                    {p.status === "concluido" ? "Concluído" : venc ? "Vencido" : "Aberto"}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionSection>

        {/* ── Central de NCs ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-800">Central de Não Conformidades</h2>
              <p className="text-[11px] text-slate-400">{ncs.length} registros · {metrics.ncAbertas} em aberto</p>
            </div>
            <button
              onClick={openNewNC}
              className="h-7 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3 h-3" /> Registrar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-0 border-b border-slate-100 overflow-x-auto">
            {[
              { id: "todas", label: "Todas" },
              { id: "abertas", label: `Abertas (${metrics.ncAbertas})` },
              { id: "criticas", label: `Críticas (${metrics.ncCriticas})` },
              { id: "encerradas", label: "Encerradas" },
            ].map(f => (
              <button key={f.id} onClick={() => setNcFilter(f.id)}
                className={`text-xs font-medium px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${ncFilter === f.id ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="p-3 space-y-2">
            {ncsFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhuma não conformidade encontrada</p>
                <button onClick={openNewNC} className="mt-3 text-xs text-blue-600 font-medium hover:underline">Registrar a primeira NC</button>
              </div>
            ) : (
              ncsFiltradas.slice(0, 10).map(nc => (
                <NCRow key={nc.id} nc={nc} onEdit={openEditNC} onStatus={closeNC.mutate} />
              ))
            )}
          </div>

          {ncsFiltradas.length > 10 && (
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">{ncsFiltradas.length - 10} registros não exibidos</p>
            </div>
          )}
        </div>

      </div>

      <NCModal
        open={ncModal}
        onClose={() => { setNcModal(false); setEditingNC(null); }}
        onSave={saveNC.mutate}
        editItem={editingNC}
        currentUser={currentUser}
        ferramentas={ferramentas}
      />
    </>
  );
}