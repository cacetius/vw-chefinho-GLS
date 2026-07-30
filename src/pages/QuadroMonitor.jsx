import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, Plus, CheckCircle2, Circle, AlertTriangle,
  Clock, Target, X, Camera, RefreshCw, Loader2,
  Calendar, User, MapPin, Activity, ChevronDown
} from "lucide-react";
import { format, differenceInDays, addDays, addWeeks, addMonths, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";

// ─── Constantes ───────────────────────────────────────────────────────────────

const CAT_LABELS = { diaria: "Diária", semanal: "Semanal", mensal: "Mensal" };
const REC_LABELS = { nenhuma: "Única", diaria: "Diária", semanal: "Semanal", mensal: "Mensal" };

// ─── Componentes ─────────────────────────────────────────────────────────────

function SectionHeader({ children, count, onAdd }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{children}</h2>
        {count != null && (
          <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{count}</span>
        )}
      </div>
      {onAdd && (
        <button onClick={onAdd}
          className="h-6 w-6 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5 text-white" />
        </button>
      )}
    </div>
  );
}

function StatusChip({ status, overdue }) {
  if (overdue) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">Atrasado</span>;
  if (status === "concluido") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">Concluído</span>;
  if (status === "em_andamento") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Em andamento</span>;
  return null;
}

function AtividadeRow({ a, onToggle, onDelete }) {
  const overdue = a.prazo && isBefore(new Date(a.prazo + "T23:59:59"), new Date()) && a.status !== "concluido";
  const done = a.status === "concluido";
  const inProgress = a.status === "em_andamento";

  return (
    <div className={`group flex items-start gap-3 px-3 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors ${done ? "opacity-50" : ""}`}>
      <button onClick={() => onToggle(a)} className="mt-0.5 flex-shrink-0">
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : overdue ? (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        ) : inProgress ? (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        ) : (
          <Circle className="w-4 h-4 text-slate-200 group-hover:text-slate-300 transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${done ? "line-through text-slate-400" : overdue ? "text-slate-800" : "text-slate-800"}`}>{a.titulo}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
          {a.area && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{a.area}</span>}
          {a.responsavel && <span className="text-[10px] text-slate-400">{a.responsavel}</span>}
          {a.prazo && <span className={`text-[10px] flex items-center gap-0.5 ${overdue ? "text-red-500" : "text-slate-400"}`}><Calendar className="w-2.5 h-2.5" />{format(new Date(a.prazo + "T00:00:00"), "dd/MM")}</span>}
          {a.recorrencia && a.recorrencia !== "nenhuma" && <span className="text-[10px] text-slate-300 flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" />{REC_LABELS[a.recorrencia]}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <StatusChip status={a.status} overdue={overdue} />
        <button onClick={() => onDelete(a.id)} className="w-5 h-5 flex items-center justify-center text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Formulário ───────────────────────────────────────────────────────────────

function NovaTarefaForm({ onSalvar, onCancel, currentUser }) {
  const [form, setForm] = useState({
    titulo: "", categoria: "diaria",
    responsavel: currentUser?.nome_exibicao || currentUser?.full_name || "",
    area: currentUser?.area || "", prazo: "", recorrencia: "nenhuma",
  });

  const handleSalvar = () => {
    if (!form.titulo.trim()) return;
    onSalvar({
      ...form,
      data: format(new Date(), "yyyy-MM-dd"),
      criado_por: currentUser?.nome_exibicao || currentUser?.full_name || "",
      celula: currentUser?.celula || "",
      equipe: currentUser?.equipe || "",
      status: "nao_iniciado",
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="border border-blue-200 bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
        <span className="text-xs font-semibold text-slate-700">Nova tarefa</span>
        <button onClick={onCancel} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="p-4 space-y-3">
        <input
          value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} autoFocus
          placeholder="Descreva a tarefa..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Categoria</label>
            <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none focus:border-blue-500">
              <option value="diaria">Diária</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Recorrência</label>
            <select value={form.recorrencia} onChange={e => setForm(p => ({ ...p, recorrencia: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none focus:border-blue-500">
              <option value="nenhuma">Única vez</option>
              <option value="diaria">Todo dia</option>
              <option value="semanal">Toda semana</option>
              <option value="mensal">Todo mês</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
            placeholder="Responsável"
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
          <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
            placeholder="Área"
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
        </div>
        <input type="date" value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))}
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 h-8 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSalvar} disabled={!form.titulo.trim()}
            className="flex-1 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors">
            Criar tarefa
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Insight Banner ──────────────────────────────────────────────────────────

function InsightBanner({ auditorias, atividades }) {
  const msgs = useMemo(() => {
    const out = [];
    const nc = auditorias.filter(a => a.conformidade === "nao_conforme").length;
    const atrasadas = atividades.filter(a => a.status === "atrasado").length;
    if (nc > 0) out.push(`${nc} não conformidade${nc > 1 ? "s" : ""} pendente${nc > 1 ? "s" : ""}`);
    if (atrasadas > 0) out.push(`${atrasadas} tarefa${atrasadas > 1 ? "s" : ""} atrasada${atrasadas > 1 ? "s" : ""}`);
    return out;
  }, [auditorias, atividades]);

  if (msgs.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-800">{msgs.join(" · ")}</p>
    </div>
  );
}

// ─── Progress Ring ───────────────────────────────────────────────────────────

function ProgressRing({ pct }) {
  const r = 22, circ = 2 * Math.PI * r;
  const color = pct >= 85 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">{pct}%</span>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function QuadroMonitor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState("diaria");
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades-monitor"],
    queryFn: () => base44.entities.AtividadeMonitor.list("-data", 200),
    refetchInterval: 30000,
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ["auditorias-dashboard"],
    queryFn: () => base44.entities.AuditoriaProcesso.list("-data", 50),
    refetchInterval: 60000,
  });

  const { data: calibracoes = [] } = useQuery({
    queryKey: ["calibracoes-dashboard"],
    queryFn: () => base44.entities.Calibracao.list(),
    refetchInterval: 60000,
  });

  const hoje = format(new Date(), "yyyy-MM-dd");
  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];

  const grupos = useMemo(() => ({
    diaria: atividades.filter(a => a.categoria === "diaria" || a.data === hoje),
    semanal: atividades.filter(a => a.categoria === "semanal"),
    mensal: atividades.filter(a => a.categoria === "mensal"),
  }), [atividades, hoje]);

  const ativas = grupos[filtroAtivo] || [];
  const pendentes = ativas.filter(a => a.status !== "concluido");
  const concluidas = ativas.filter(a => a.status === "concluido");
  const pct = ativas.length > 0 ? Math.round((concluidas.length / ativas.length) * 100) : 0;

  const calProximas = calibracoes.filter(c => {
    if (!c.data_vencimento) return false;
    const dias = differenceInDays(new Date(c.data_vencimento + "T00:00:00"), new Date());
    return dias >= 0 && dias <= 15;
  }).length;

  const toggleStatus = async (ativ) => {
    const next = ativ.status === "concluido" ? "nao_iniciado"
      : ativ.status === "nao_iniciado" ? "em_andamento"
      : "concluido";
    await base44.entities.AtividadeMonitor.update(ativ.id, { status: next });

    if (next === "concluido" && ativ.recorrencia && ativ.recorrencia !== "nenhuma") {
      let proxData = new Date(ativ.data + "T00:00:00");
      if (ativ.recorrencia === "diaria") proxData = addDays(proxData, 1);
      else if (ativ.recorrencia === "semanal") proxData = addWeeks(proxData, 1);
      else if (ativ.recorrencia === "mensal") proxData = addMonths(proxData, 1);
      const proxStr = format(proxData, "yyyy-MM-dd");
      const jaExiste = atividades.some(a => a.origem_recorrencia === ativ.id && a.data === proxStr);
      if (!jaExiste) {
        await base44.entities.AtividadeMonitor.create({
          titulo: ativ.titulo, categoria: ativ.categoria, data: proxStr,
          prazo: ativ.prazo, area: ativ.area, celula: ativ.celula,
          equipe: ativ.equipe, responsavel: ativ.responsavel,
          criado_por: "Sistema (recorrência)", status: "nao_iniciado",
          recorrencia: ativ.recorrencia, origem_recorrencia: ativ.id,
        });
      }
    }
    qc.invalidateQueries({ queryKey: ["atividades-monitor"] });
  };

  const excluir = async (id) => {
    await base44.entities.AtividadeMonitor.delete(id);
    qc.invalidateQueries({ queryKey: ["atividades-monitor"] });
  };

  const salvar = async (dados) => {
    await base44.entities.AtividadeMonitor.create(dados);
    qc.invalidateQueries({ queryKey: ["atividades-monitor"] });
    setMostrarForm(false);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-8">

      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Quadro do Monitor</h1>
          <p className="text-xs text-slate-400 mt-0.5">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <span className="text-xs font-medium text-slate-500">{firstName}</span>
      </div>

      {/* ── Insight Banner ── */}
      <InsightBanner auditorias={auditorias} atividades={atividades} />

      {/* ── Progress + Resumo ── */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
          <ProgressRing pct={pct} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              {concluidas.length} de {ativas.length} concluídas
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {CAT_LABELS[filtroAtivo]}
              {calProximas > 0 && <span className="ml-2 text-amber-600">· {calProximas} calibração vence em breve</span>}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "diaria", label: "Hoje", count: grupos.diaria.filter(a => a.status !== "concluido").length },
            { id: "semanal", label: "Semana", count: grupos.semanal.filter(a => a.status !== "concluido").length },
            { id: "mensal", label: "Mês", count: grupos.mensal.filter(a => a.status !== "concluido").length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFiltroAtivo(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-colors ${filtroAtivo === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${filtroAtivo === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista de tarefas */}
        <div className="divide-y divide-slate-50">
          <AnimatePresence>
            {mostrarForm && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
                <NovaTarefaForm onSalvar={salvar} onCancel={() => setMostrarForm(false)} currentUser={currentUser} />
              </motion.div>
            )}
          </AnimatePresence>

          {pendentes.length === 0 && !mostrarForm ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Tudo em dia</p>
              <p className="text-xs text-slate-400 mt-0.5">Nenhuma tarefa pendente</p>
            </div>
          ) : (
            pendentes.map(a => (
              <AtividadeRow key={a.id} a={a} onToggle={toggleStatus} onDelete={excluir} />
            ))
          )}

          {concluidas.length > 0 && (
            <details className="group">
              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-xs text-slate-400 hover:text-slate-600 transition-colors list-none select-none">
                <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                {concluidas.length} concluída{concluidas.length > 1 ? "s" : ""}
              </summary>
              {concluidas.map(a => (
                <AtividadeRow key={a.id} a={a} onToggle={toggleStatus} onDelete={excluir} />
              ))}
            </details>
          )}
        </div>

        {/* Footer com botão */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={() => setMostrarForm(v => !v)}
            className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nova tarefa
          </button>
        </div>
      </div>

    </div>
  );
}