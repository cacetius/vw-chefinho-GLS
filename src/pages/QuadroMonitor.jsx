import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Plus, CheckCircle2, Circle, AlertTriangle,
  Clock, Gauge, Lightbulb, TrendingUp, Target, X, Camera,
  ChevronDown, RefreshCw, Loader2, MessageSquare, Calendar,
  User, MapPin, Zap, Filter
} from "lucide-react";
import { format, differenceInDays, addDays, addWeeks, addMonths, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================
// STATUS CONFIG
// ============================================================
const STATUS = {
  nao_iniciado:  { icon: Circle, cor: "text-slate-300", bg: "bg-slate-50 border-slate-200", emoji: "⚪", label: "Não iniciado" },
  em_andamento: { icon: Loader2, cor: "text-amber-500", bg: "bg-amber-50 border-amber-200", emoji: "🟡", label: "Em andamento" },
  concluido:    { icon: CheckCircle2, cor: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200", emoji: "🟢", label: "Concluído" },
  atrasado:     { icon: AlertTriangle, cor: "text-red-500", bg: "bg-red-50 border-red-200", emoji: "🔴", label: "Atrasado" },
};

const CAT_LABELS = { diaria: "Hoje", semanal: "Esta Semana", mensal: "Este Mês" };
const CAT_ICONS = { diaria: "📅", semanal: "📆", mensal: "🗓️" };
const REC_LABELS = { nenhuma: "Sem recorrência", diaria: "Todo dia", semanal: "Toda semana", mensal: "Todo mês" };

// ============================================================
// COMPONENTE: Indicadores do Mês
// ============================================================
function IndicadoresMes({ atividades }) {
  const total = atividades.length;
  const concluidas = atividades.filter(a => a.status === "concluido").length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-[#0066b1]" />
        <h3 className="text-sm font-bold text-slate-800">Indicador do Mês</h3>
      </div>
      <div className="flex items-end gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={pct >= 85 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 176} 176`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-slate-800">{pct}%</span>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-extrabold text-slate-800">{concluidas}<span className="text-sm text-slate-400 font-normal">/{total}</span></p>
          <p className="text-[10px] text-slate-400">atividades concluídas</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct >= 85 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: Sugestões IA Simuladas
// ============================================================
function SugestoesIA({ auditorias, atividades }) {
  const sugestoes = React.useMemo(() => {
    const sgs = [];
    const naoConformes = auditorias.filter(a => a.conformidade === "nao_conforme" || a.conformidade === "atencao");
    const atrasadas = atividades.filter(a => a.status === "atrasado");

    if (naoConformes.length > 0) {
      const areas = [...new Set(naoConformes.map(a => a.area || a.ferramenta).filter(Boolean))];
      if (areas.length > 0) {
        sgs.push({ emoji: "⚠️", texto: `Foram identificadas ${naoConformes.length} não conformidades em ${areas.slice(0, 2).join(", ")}${areas.length > 2 ? " e outras" : ""}. Recomenda-se auditoria focada nessas áreas.` });
      }
    }
    if (atrasadas.length > 0) {
      sgs.push({ emoji: "⏰", texto: `${atrasadas.length} atividades atrasadas. Sugiro priorizar essas tarefas antes de iniciar novas.` });
    }
    if (atividades.filter(a => a.categoria === "semanal" && a.status !== "concluido").length > 3) {
      sgs.push({ emoji: "📋", texto: "Várias tarefas semanais pendentes. Considere dividir com outros monitores da equipe." });
    }
    if (sgs.length === 0) {
      sgs.push({ emoji: "✅", texto: "Tudo em ordem! Continue mantendo o bom trabalho. Nenhuma pendência crítica detectada." });
    }
    return sgs;
  }, [auditorias, atividades]);

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-violet-200 rounded-xl flex items-center justify-center">
          <Zap className="w-4 h-4 text-violet-700" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-violet-800">Chefinho IA</h3>
          <p className="text-[9px] text-violet-500">Sugestões de melhoria</p>
        </div>
      </div>
      <div className="space-y-2">
        {sugestoes.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex gap-2 bg-white rounded-xl p-3 border border-violet-100">
            <span className="text-lg flex-shrink-0">{s.emoji}</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">{s.texto}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: Card de Atividade
// ============================================================
function AtividadeCard({ a, onToggle, onDelete }) {
  const cfg = STATUS[a.status] || STATUS.nao_iniciado;
  const Icon = cfg.icon;
  const atrasado = a.prazo && isBefore(new Date(a.prazo + "T23:59:59"), new Date()) && a.status !== "concluido";
  const statusEfetivo = atrasado ? STATUS.atrasado : cfg;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
      className={`flex items-start gap-3 p-3 rounded-xl border-2 bg-white transition-all ${statusEfetivo.bg}`}>
      <button onClick={() => onToggle(a)} className="flex-shrink-0 mt-0.5 active:scale-90 transition-transform">
        {a.status === "concluido" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : atrasado ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : a.status === "em_andamento" ? (
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-bold ${a.status === "concluido" ? "text-slate-400 line-through" : "text-slate-800"}`}>
            {a.titulo}
          </p>
          <button onClick={() => onDelete(a.id)} className="text-[10px] text-slate-300 hover:text-red-400 flex-shrink-0">×</button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {a.categoria && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
              {CAT_ICONS[a.categoria]} {CAT_LABELS[a.categoria] || a.categoria}
            </span>
          )}
          {a.responsavel && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" /> {a.responsavel}
            </span>
          )}
          {a.area && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 font-medium">
              <MapPin className="w-2.5 h-2.5 inline mr-0.5" />{a.area}
            </span>
          )}
          {a.prazo && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${atrasado ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
              <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
              {format(new Date(a.prazo + "T00:00:00"), "dd/MM")}
            </span>
          )}
          {a.recorrencia && a.recorrencia !== "nenhuma" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 font-medium flex items-center gap-0.5">
              <RefreshCw className="w-2.5 h-2.5" /> {REC_LABELS[a.recorrencia]}
            </span>
          )}
        </div>

        {/* Evidências */}
        {(a.observacoes || a.foto) && (
          <div className="mt-2 space-y-1">
            {a.foto && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Camera className="w-3 h-3" /> 📷 Foto anexada
              </div>
            )}
            {a.observacoes && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <MessageSquare className="w-3 h-3" /> 📝 {a.observacoes}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// COMPONENTE: Formulário de Nova Tarefa
// ============================================================
function NovaTarefaForm({ onSalvar, onCancel, currentUser }) {
  const [form, setForm] = useState({
    titulo: "", categoria: "diaria", responsavel: currentUser?.nome_exibicao || currentUser?.full_name || "",
    area: currentUser?.area || "", equipe: currentUser?.equipe || "", prazo: "",
    recorrencia: "nenhuma", foto: "", observacoes: ""
  });
  const [fazendoFoto, setFazendoFoto] = useState(false);

  const tirarFoto = async () => {
    setFazendoFoto(true);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) { setFazendoFoto(false); return; }
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        setForm(p => ({ ...p, foto: file_url }));
      } catch (e) {}
      setFazendoFoto(false);
    };
    input.click();
  };

  const handleSalvar = () => {
    if (!form.titulo.trim()) return;
    onSalvar({
      ...form,
      data: format(new Date(), "yyyy-MM-dd"),
      criado_por: currentUser?.nome_exibicao || currentUser?.full_name || "",
      celula: currentUser?.celula || "",
      status: "nao_iniciado",
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border-2 border-[#0066b1] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#001e50]">📝 Nova Tarefa</h3>
        <button onClick={onCancel} className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-3.5 h-3.5 text-slate-500" /></button>
      </div>

      <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} autoFocus
        placeholder="O que precisa ser feito?" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#0066b1]" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Frequência</label>
          <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
            className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white">
            <option value="diaria">📅 Hoje</option>
            <option value="semanal">📆 Esta Semana</option>
            <option value="mensal">🗓️ Este Mês</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Repetir</label>
          <select value={form.recorrencia} onChange={e => setForm(p => ({ ...p, recorrencia: e.target.value }))}
            className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white">
            <option value="nenhuma">Sem repetir</option>
            <option value="diaria">Todo dia</option>
            <option value="semanal">Toda semana</option>
            <option value="mensal">Todo mês</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
          placeholder="Responsável" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
        <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
          placeholder="Área" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
        <button onClick={tirarFoto} disabled={fazendoFoto}
          className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 ${form.foto ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          <Camera className="w-3.5 h-3.5" /> {fazendoFoto ? "..." : form.foto ? "Foto ✓" : "Evidência"}
        </button>
      </div>

      <textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
        placeholder="Observações..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none h-16 resize-none" />

      <button onClick={handleSalvar} disabled={!form.titulo.trim()}
        className="w-full py-2.5 bg-[#0066b1] text-white text-sm font-bold rounded-xl disabled:opacity-40 active:opacity-80">
        Criar Tarefa
      </button>
    </motion.div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL: Quadro do Monitor
// ============================================================
export default function QuadroMonitor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtro, setFiltro] = useState("todas"); // todas | diaria | semanal | mensal
  const [mostrarConcluidas, setMostrarConcluidas] = useState(true);

  const queryClient = useQueryClient();

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

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
      </div>
    );
  }

  const hoje = format(new Date(), "yyyy-MM-dd");
  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];

  // Filtrar atividades
  const atividadesHoje = atividades.filter(a =>
    a.categoria === "diaria" || (a.data === hoje)
  );
  const atividadesSemana = atividades.filter(a => a.categoria === "semanal");
  const atividadesMes = atividades.filter(a => a.categoria === "mensal");

  // Pendentes por categoria
  const pendentesHoje = atividadesHoje.filter(a => a.status !== "concluido");
  const pendentesSemana = atividadesSemana.filter(a => a.status !== "concluido");
  const pendentesMes = atividadesMes.filter(a => a.status !== "concluido");

  // Calibrações próximas (15 dias)
  const calProximas = calibracoes.filter(c => {
    if (!c.data_vencimento) return false;
    const dias = differenceInDays(new Date(c.data_vencimento + "T00:00:00"), new Date());
    return dias >= 0 && dias <= 15;
  });

  // Auditorias pendentes (não conformes dos últimos 30 dias)
  const audPendentes = auditorias.filter(a =>
    (a.conformidade === "nao_conforme" || a.conformidade === "atencao")
  );

  const toggleStatus = async (atividade) => {
    const novoStatus = atividade.status === "concluido" ? "nao_iniciado"
      : atividade.status === "nao_iniciado" ? "em_andamento"
      : "concluido";

    await base44.entities.AtividadeMonitor.update(atividade.id, { status: novoStatus });

    // Se for recorrente e concluída, cria a próxima
    if (novoStatus === "concluido" && atividade.recorrencia && atividade.recorrencia !== "nenhuma") {
      let proximaData = new Date(atividade.data + "T00:00:00");
      if (atividade.recorrencia === "diaria") proximaData = addDays(proximaData, 1);
      else if (atividade.recorrencia === "semanal") proximaData = addWeeks(proximaData, 1);
      else if (atividade.recorrencia === "mensal") proximaData = addMonths(proximaData, 1);

      // Verifica se já existe tarefa para a próxima data
      const proximaDataStr = format(proximaData, "yyyy-MM-dd");
      const jaExiste = atividades.some(a => a.origem_recorrencia === atividade.id && a.data === proximaDataStr);

      if (!jaExiste) {
        await base44.entities.AtividadeMonitor.create({
          titulo: atividade.titulo,
          categoria: atividade.categoria,
          data: proximaDataStr,
          prazo: atividade.prazo,
          area: atividade.area,
          celula: atividade.celula,
          equipe: atividade.equipe,
          responsavel: atividade.responsavel,
          criado_por: "Sistema (recorrência)",
          status: "nao_iniciado",
          recorrencia: atividade.recorrencia,
          origem_recorrencia: atividade.id,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["atividades-monitor"] });
  };

  const excluir = async (id) => {
    await base44.entities.AtividadeMonitor.delete(id);
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor"] });
  };

  const salvarTarefa = async (dados) => {
    await base44.entities.AtividadeMonitor.create(dados);
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor"] });
    setMostrarForm(false);
  };

  const concluidasHoje = atividadesHoje.filter(a => a.status === "concluido").length;
  const totalHoje = atividadesHoje.length;
  const pctHoje = totalHoje > 0 ? Math.round((concluidasHoje / totalHoje) * 100) : 0;

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-4 pb-6">

      {/* CABEÇALHO */}
      <div className="bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-2xl p-4 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-20 opacity-5 select-none text-[70px] leading-none">🏭</div>
        <div className="relative">
          <p className="text-blue-200 text-[9px] font-bold uppercase tracking-widest">Quadro do Monitor</p>
          <h1 className="text-lg font-extrabold mt-0.5">Olá, {firstName}! 👋</h1>
          <p className="text-blue-200 text-[11px]">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold text-red-600">Auditorias</span>
          </div>
          <p className="text-2xl font-extrabold text-red-700">{audPendentes.length}</p>
          <p className="text-[9px] text-red-500">pendentes</p>
        </div>
        <div className={`border-2 rounded-2xl p-3 ${calProximas.length > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className={`w-4 h-4 ${calProximas.length > 0 ? "text-amber-500" : "text-emerald-500"}`} />
            <span className={`text-[10px] font-bold ${calProximas.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>Calibrações</span>
          </div>
          <p className={`text-2xl font-extrabold ${calProximas.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>{calProximas.length}</p>
          <p className={`text-[9px] ${calProximas.length > 0 ? "text-amber-500" : "text-emerald-500"}`}>{calProximas.length > 0 ? "vencendo em 15 dias" : "tudo em dia"}</p>
        </div>
      </div>

      {/* INDICADOR DO MÊS */}
      <IndicadoresMes atividades={atividades} />

      {/* O QUE PRECISO FAZER HOJE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0066b1]" />
            <h2 className="text-sm font-extrabold text-[#001e50]">O que preciso fazer hoje</h2>
            {totalHoje > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pctHoje === 100 ? "bg-emerald-100 text-emerald-700" : pctHoje > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                {concluidasHoje}/{totalHoje}
              </span>
            )}
          </div>
          <button onClick={() => setMostrarForm(v => !v)}
            className="w-8 h-8 bg-[#0066b1] rounded-xl flex items-center justify-center active:opacity-80">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <AnimatePresence>
          {mostrarForm && (
            <div className="mb-3">
              <NovaTarefaForm onSalvar={salvarTarefa} onCancel={() => setMostrarForm(false)} currentUser={currentUser} />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pendentesHoje.length === 0 && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-700">Tudo em dia!</p>
              <p className="text-[10px] text-emerald-500">Nenhuma tarefa pendente para hoje</p>
            </div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <AnimatePresence>
            {pendentesHoje.slice(0, 10).map(a => (
              <AtividadeCard key={a.id} a={a} onToggle={toggleStatus} onDelete={excluir} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* SEÇÕES SEMANAL E MENSAL */}
      {["semanal", "mensal"].map(cat => {
        const pendentes = cat === "semanal" ? pendentesSemana : pendentesMes;
        const label = cat === "semanal" ? "Esta Semana" : "Este Mês";
        const icon = cat === "semanal" ? "📆" : "🗓️";

        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{icon}</span>
              <h2 className="text-sm font-extrabold text-[#001e50]">{label}</h2>
              {pendentes.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  {pendentes.length} pendentes
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {pendentes.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2">Nenhuma pendência</p>
              ) : (
                pendentes.slice(0, 5).map(a => (
                  <AtividadeCard key={a.id} a={a} onToggle={toggleStatus} onDelete={excluir} />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* CHEFINHO IA */}
      <SugestoesIA auditorias={auditorias} atividades={atividades} />

    </div>
  );
}