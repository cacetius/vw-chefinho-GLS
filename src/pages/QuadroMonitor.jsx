import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, Circle, Check, Plus, X, Camera,
  Calendar, Clock, Paperclip, Lightbulb, TrendingUp, Search, Zap, ChevronRight
} from "lucide-react";
import { format, differenceInDays, addDays, addWeeks, addMonths } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STATUS_ICONS = {
  nao_iniciado: { icone: "⚪", cor: "border-slate-300", bg: "bg-slate-50", label: "Não iniciado" },
  em_andamento: { icone: "🟡", cor: "border-amber-400", bg: "bg-amber-50", label: "Em andamento" },
  concluido: { icone: "🟢", cor: "border-emerald-400", bg: "bg-emerald-50", label: "Concluído" },
  atrasado: { icone: "🔴", cor: "border-red-400", bg: "bg-red-50", label: "Atrasado" },
};

const CATEGORIAS = [
  { value: "diaria", label: "Todo dia", icone: "📅" },
  { value: "semanal", label: "Toda semana", icone: "📆" },
  { value: "mensal", label: "Todo mês", icone: "🗓️" },
  { value: "personalizada", label: "Personalizado", icone: "⚡" },
];

const RECORRENCIAS = [
  { value: "nenhuma", label: "Não repete" },
  { value: "todo_dia", label: "Todo dia" },
  { value: "toda_semana", label: "Toda semana" },
  { value: "todo_mes", label: "Todo mês" },
];

export default function QuadroMonitor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [sugestoesIA, setSugestoesIA] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [filtro, setFiltro] = useState("hoje");

  const [form, setForm] = useState({
    titulo: "", descricao: "", categoria: "diaria", recorrencia: "nenhuma",
    data: format(new Date(), "yyyy-MM-dd"), prazo: "", responsavel: "", area: "", equipe: "",
    foto: "", observacao: "", arquivo_url: "", arquivo_nome: ""
  });

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const hoje = format(new Date(), "yyyy-MM-dd");

  const { data: atividades = [] } = useQuery({
    queryKey: ["atividades-monitor-todas"],
    queryFn: () => base44.entities.AtividadeMonitor.list("-data", 300),
  });

  const { data: criticos = { calVencidas: 0, calProximas: 0, audPendentes: 0, audTotal: 0, naoConformes: 0 } } = useQuery({
    queryKey: ["monitor-criticos-full"],
    queryFn: async () => {
      const hojeDt = new Date(); hojeDt.setHours(0,0,0,0);
      const [cal, auds] = await Promise.all([
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaProcesso.list("-data", 100),
      ]);
      const calVencidas = cal.filter(c => c.data_vencimento && differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hojeDt) < 0).length;
      const calProximas = cal.filter(c => {
        if (!c.data_vencimento) return false;
        const d = differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hojeDt);
        return d >= 0 && d <= 30;
      }).length;
      const audPendentes = auds.filter(a => a.conformidade === "nao_conforme" || a.conformidade === "atencao").length;
      const naoConformes = auds.filter(a => a.conformidade === "nao_conforme").length;
      return { calVencidas, calProximas, audPendentes, audTotal: auds.length, naoConformes };
    },
    enabled: !!currentUser,
    refetchInterval: 300000
  });

  const atividadesHoje = atividades.filter(a => a.data === hoje);
  const atividadesAtrasadas = atividades.filter(a => a.status === "atrasado" || (a.data < hoje && a.status !== "concluido"));
  const concluidasHoje = atividadesHoje.filter(a => a.status === "concluido").length;
  const totalHoje = atividadesHoje.length;
  const pctMes = atividades.length > 0 ? Math.round((atividades.filter(a => a.status === "concluido").length / atividades.length) * 100) : 0;

  const alternarStatus = async (ativ) => {
    const ordem = ["nao_iniciado", "em_andamento", "concluido"];
    const idx = ordem.indexOf(ativ.status);
    const novo = idx < ordem.length - 1 ? ordem[idx + 1] : ordem[0];
    await base44.entities.AtividadeMonitor.update(ativ.id, { status: novo });
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor-todas"] });
  };

  const toggleStatus = async (ativ) => {
    const novo = ativ.status === "concluido" ? "nao_iniciado" : "concluido";
    await base44.entities.AtividadeMonitor.update(ativ.id, { status: novo });
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor-todas"] });

    // Se recorrente, criar próxima
    if (novo === "concluido" && ativ.recorrencia && ativ.recorrencia !== "nenhuma") {
      const dataBase = new Date(ativ.data + "T00:00:00");
      let proximaData;
      if (ativ.recorrencia === "todo_dia") proximaData = addDays(dataBase, 1);
      else if (ativ.recorrencia === "toda_semana") proximaData = addWeeks(dataBase, 1);
      else if (ativ.recorrencia === "todo_mes") proximaData = addMonths(dataBase, 1);
      if (proximaData) {
        await base44.entities.AtividadeMonitor.create({
          titulo: ativ.titulo, descricao: ativ.descricao, categoria: ativ.categoria,
          recorrencia: ativ.recorrencia, data: format(proximaData, "yyyy-MM-dd"),
          prazo: ativ.prazo, area: ativ.area, equipe: ativ.equipe, celula: ativ.celula,
          responsavel: ativ.responsavel, responsavel_id: ativ.responsavel_id,
          status: "nao_iniciado", criado_por: currentUser?.nome_exibicao || currentUser?.full_name || "Sistema"
        });
      }
    }
  };

  const excluir = async (id) => {
    await base44.entities.AtividadeMonitor.delete(id);
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor-todas"] });
  };

  const salvar = async () => {
    const dados = {
      ...form,
      celula: currentUser?.celula || "",
      equipe: form.equipe || currentUser?.equipe || "",
      responsavel: form.responsavel || currentUser?.nome_exibicao || currentUser?.full_name || "",
      responsavel_id: currentUser?.id || "",
      criado_por: currentUser?.nome_exibicao || currentUser?.full_name || "",
      status: "nao_iniciado"
    };
    await base44.entities.AtividadeMonitor.create(dados);
    queryClient.invalidateQueries({ queryKey: ["atividades-monitor-todas"] });
    setMostrarForm(false);
    setForm({ titulo: "", descricao: "", categoria: "diaria", recorrencia: "nenhuma",
      data: format(new Date(), "yyyy-MM-dd"), prazo: "", responsavel: "", area: "", equipe: "",
      foto: "", observacao: "", arquivo_url: "", arquivo_nome: "" });
  };

  const tirarFoto = async () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.capture = "environment";
    input.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setForm(p => ({ ...p, foto: file_url }));
    };
    input.click();
  };

  const anexarArquivo = async () => {
    const input = document.createElement("input"); input.type = "file";
    input.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setForm(p => ({ ...p, arquivo_url: file_url, arquivo_nome: f.name }));
    };
    input.click();
  };

  const gerarSugestoesIA = async () => {
    setLoadingIA(true);
    try {
      const contexto = {
        totalAtividades: atividades.length,
        concluidas: atividades.filter(a => a.status === "concluido").length,
        atrasadas: atividadesAtrasadas.length,
        naoConformidades: criticos.naoConformes,
        calVencidas: criticos.calVencidas,
        pctConclusao: pctMes,
        atividadesRecentes: atividades.slice(0, 10).map(a => ({ titulo: a.titulo, status: a.status, data: a.data })),
      };
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise os dados operacionais do VW Chefinho GLS e sugira 3 melhorias:

${JSON.stringify(contexto, null, 2)}

Retorne APENAS um JSON array com 3 objetos: { "titulo": "...", "descricao": "..." }. Seja específico e baseado nos dados. Máximo 20 palavras por item.`,
        response_json_schema: { type: "object", properties: { sugestoes: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, descricao: { type: "string" } } } } } }
      });
      setSugestoesIA(result.sugestoes || []);
    } catch (e) { /* ignora */ }
    setLoadingIA(false);
  };

  const nome = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];

  if (!currentUser) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;
  }

  const listaFiltrada = filtro === "hoje" ? atividadesHoje :
    filtro === "atrasadas" ? atividadesAtrasadas :
    filtro === "semana" ? atividades.filter(a => a.categoria === "semanal") :
    atividades.filter(a => a.categoria === "mensal");

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-3 pb-4">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-2xl p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-wide">VW Chefinho GLS</p>
            <h1 className="text-lg font-extrabold mt-0.5">Olá, {nome}!</h1>
            <p className="text-blue-200 text-[11px] mt-0.5">{format(new Date(), "EEEE, d 'de' MMMM")}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {currentUser?.equipe && <p className="text-[10px] text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">{currentUser.equipe}</p>}
          </div>
        </div>
      </div>

      {/* INDICADORES CRÍTICOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className={`rounded-xl p-3 ${atividadesAtrasadas.length > 0 ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
          <p className="text-2xl font-extrabold text-slate-800">{atividadesAtrasadas.length}</p>
          <p className="text-[10px] font-medium text-slate-500">Atrasadas</p>
        </div>
        <div className={`rounded-xl p-3 ${criticos.audPendentes > 0 ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
          <p className="text-2xl font-extrabold text-slate-800">{criticos.audPendentes}</p>
          <p className="text-[10px] font-medium text-slate-500">Aud. pendentes</p>
        </div>
        <div className={`rounded-xl p-3 ${criticos.calProximas > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
          <p className="text-2xl font-extrabold text-slate-800">{criticos.calProximas}</p>
          <p className="text-[10px] font-medium text-slate-500">Cal. próximas</p>
        </div>
        <div className="rounded-xl p-3 bg-blue-50 border border-blue-200">
          <p className="text-2xl font-extrabold text-blue-700">{pctMes}%</p>
          <p className="text-[10px] font-medium text-blue-500">Concluído</p>
        </div>
      </div>

      {/* O QUE PRECISO FAZER HOJE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0066b1] rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-extrabold text-[#001e50]">O QUE PRECISO FAZER HOJE</h2>
          </div>
          <button onClick={() => setMostrarForm(true)} className="w-9 h-9 bg-[#0066b1] rounded-xl flex items-center justify-center active:opacity-80">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 mb-2 overflow-x-auto">
          {[
            { key: "hoje", label: `Hoje (${atividadesHoje.length})` },
            { key: "atrasadas", label: `Atrasadas (${atividadesAtrasadas.length})` },
            { key: "semana", label: "Semana" },
            { key: "mes", label: "Mês" },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                filtro === f.key ? "bg-[#0066b1] text-white" : "bg-slate-100 text-slate-500"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Tarefas */}
        <div className="space-y-1">
          {listaFiltrada.map(ativ => {
            const feito = ativ.status === "concluido";
            const atrasado = ativ.status === "atrasado";
            return (
              <motion.div key={ativ.id} whileTap={{ scale: 0.99 }} layout
                className={`flex items-start gap-3 px-3 py-3 rounded-xl border-2 transition-all ${
                  feito ? "border-emerald-300 bg-emerald-50/50" :
                  atrasado ? "border-red-300 bg-red-50/50" :
                  "border-slate-100 bg-white hover:border-[#0066b1]/20"
                }`}>
                {/* Checkbox */}
                <button onClick={() => toggleStatus(ativ)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    feito ? "border-emerald-500 bg-emerald-500" :
                    atrasado ? "border-red-400" : "border-slate-300"
                  }`}>
                  {feito && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${feito ? "text-slate-400 line-through" : atrasado ? "text-red-700" : "text-slate-800"}`}>
                    {ativ.titulo}
                  </p>
                  {ativ.descricao && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{ativ.descricao}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {ativ.responsavel && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{ativ.responsavel}</span>}
                    {ativ.recorrencia && ativ.recorrencia !== "nenhuma" && <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">🔄 Repete</span>}
                    {ativ.foto && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">📷 Foto</span>}
                    {ativ.observacao && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">📝 Obs</span>}
                    {ativ.arquivo_url && <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">📎 Anexo</span>}
                  </div>
                </div>

                {/* Status badge */}
                <span className="text-lg flex-shrink-0">{STATUS_ICONS[ativ.status]?.icone}</span>
              </motion.div>
            );
          })}
          {listaFiltrada.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">Nenhuma tarefa aqui</p>
              <button onClick={() => setMostrarForm(true)} className="mt-2 text-xs text-[#0066b1] font-bold">+ Criar tarefa</button>
            </div>
          )}
        </div>
      </div>

      {/* CALIBRAÇÕES PRÓXIMAS */}
      {criticos.calProximas > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-extrabold text-amber-700">CALIBRAÇÕES PRÓXIMAS</h3>
          </div>
          <button onClick={() => navigate(createPageUrl("Calibracao"))}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between active:opacity-80">
            <span className="text-sm font-bold text-amber-700">🟡 {criticos.calProximas} calibrações vencendo nos próximos 30 dias</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* AUDITORIAS PENDENTES */}
      {criticos.audPendentes > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-extrabold text-red-700">AUDITORIAS PENDENTES</h3>
          </div>
          <button onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between active:opacity-80">
            <span className="text-sm font-bold text-red-700">🔴 {criticos.audPendentes} auditorias com não conformidade</span>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* IDEIAS DE MELHORIA — CHEFINHO IA */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-extrabold text-violet-700">IDEIAS DE MELHORIA</h3>
          </div>
          <button onClick={gerarSugestoesIA} disabled={loadingIA}
            className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg active:opacity-70 flex items-center gap-1">
            <Zap className="w-3 h-3" /> {loadingIA ? "Analisando..." : sugestoesIA.length > 0 ? "Atualizar" : "Gerar"}
          </button>
        </div>

        {loadingIA && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
            <p className="text-[11px] text-violet-600">Chefinho IA está analisando os dados...</p>
          </div>
        )}

        {sugestoesIA.length > 0 && (
          <div className="space-y-1.5">
            {sugestoesIA.map((s, i) => (
              <div key={i} className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                <p className="text-xs font-bold text-violet-800">💡 {s.titulo}</p>
                <p className="text-[10px] text-violet-500 mt-0.5">{s.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {!loadingIA && sugestoesIA.length === 0 && (
          <p className="text-[10px] text-slate-400 italic">Toque em "Gerar" para receber sugestões inteligentes baseadas nos dados.</p>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO DE TAREFA */}
      <AnimatePresence>
        {mostrarForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setMostrarForm(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#001e50]">Nova Tarefa</h2>
                  <button onClick={() => setMostrarForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Título */}
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Título da tarefa *" autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#0066b1]" />

                {/* Descrição */}
                <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descrição (opcional)" rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1] resize-none" />

                {/* Categoria e Recorrência */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência</label>
                    <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                      {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.icone} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Repetir</label>
                    <select value={form.recorrencia} onChange={e => setForm(p => ({ ...p, recorrencia: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                      {RECORRENCIAS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Data e Prazo */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Data</label>
                    <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Prazo</label>
                    <input type="date" value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                  </div>
                </div>

                {/* Responsável e Área */}
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                    placeholder="Responsável (opcional)"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                  <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                    placeholder="Área (opcional)"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                </div>

                {/* Observação */}
                <input value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                  placeholder="Observação (opcional)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />

                {/* Evidências */}
                <div className="flex gap-2">
                  <button onClick={tirarFoto} type="button"
                    className={`flex-1 py-2.5 rounded-xl border-2 border-dashed text-xs font-medium flex items-center justify-center gap-1.5 ${
                      form.foto ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-slate-300 text-slate-500"
                    }`}>
                    <Camera className="w-4 h-4" /> {form.foto ? "Foto ✓" : "Foto"}
                  </button>
                  <button onClick={anexarArquivo} type="button"
                    className={`flex-1 py-2.5 rounded-xl border-2 border-dashed text-xs font-medium flex items-center justify-center gap-1.5 ${
                      form.arquivo_url ? "border-purple-300 bg-purple-50 text-purple-600" : "border-slate-300 text-slate-500"
                    }`}>
                    <Paperclip className="w-4 h-4" /> {form.arquivo_url ? "Anexo ✓" : "Anexo"}
                  </button>
                </div>

                {/* Botões */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setMostrarForm(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl">Cancelar</button>
                  <button onClick={salvar} disabled={!form.titulo}
                    className="flex-1 py-3 bg-[#0066b1] text-white text-sm font-bold rounded-xl disabled:opacity-50 active:opacity-80">
                    Criar Tarefa
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}