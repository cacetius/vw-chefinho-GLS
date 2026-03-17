import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Car, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ESTACOES = [
  { id: "entrada", nome: "Entrada", icon: "🚪", categoria: "Recebimento" },
  { id: "chaparia_solda", nome: "Solda", icon: "⚡", categoria: "Chaparia" },
  { id: "chaparia_geometria", nome: "Geometria", icon: "📐", categoria: "Chaparia" },
  { id: "zp1", nome: "ZP1", icon: "①", categoria: "Montagem" },
  { id: "zp2", nome: "ZP2", icon: "②", categoria: "Montagem" },
  { id: "zp3", nome: "ZP3", icon: "③", categoria: "Montagem" },
  { id: "zp4", nome: "ZP4", icon: "④", categoria: "Montagem" },
  { id: "zp5", nome: "ZP5", icon: "⑤", categoria: "Montagem" },
  { id: "zp6", nome: "ZP6", icon: "⑥", categoria: "Montagem" },
  { id: "zp7", nome: "ZP7", icon: "⑦", categoria: "Montagem" },
  { id: "zp8", nome: "ZP8", icon: "⑧", categoria: "Montagem" },
  { id: "celula_parachoque", nome: "Parachoque", icon: "🛡️", categoria: "Montagem" },
  { id: "dress_up", nome: "Dress Up", icon: "👔", categoria: "Montagem" },
  { id: "chicotes", nome: "Chicotes", icon: "🔌", categoria: "Montagem" },
  { id: "vidros", nome: "Vidros", icon: "🪟", categoria: "Montagem" },
  { id: "doorless", nome: "Doorless", icon: "🚗", categoria: "Montagem" },
  { id: "bancos", nome: "Bancos", icon: "💺", categoria: "Montagem" },
  { id: "acabamento_interno", nome: "Acabamento", icon: "✨", categoria: "Montagem" },
  { id: "capo_tampa", nome: "Capô/Tampa", icon: "📦", categoria: "Montagem" },
  { id: "pintura_fosfatizacao", nome: "Fosfatização", icon: "🧪", categoria: "Pintura" },
  { id: "pintura_ecoat", nome: "E-Coat", icon: "🔋", categoria: "Pintura" },
  { id: "pintura_primer", nome: "Primer", icon: "🖌️", categoria: "Pintura" },
  { id: "pintura_base", nome: "Base Coat", icon: "🎨", categoria: "Pintura" },
  { id: "pintura_verniz", nome: "Verniz", icon: "✨", categoria: "Pintura" },
  { id: "pintura_secagem", nome: "Secagem", icon: "💨", categoria: "Pintura" },
  { id: "pcp_polimento", nome: "Polimento", icon: "💎", categoria: "PCP" },
  { id: "pcp_retoque", nome: "Retoque", icon: "🖊️", categoria: "PCP" },
  { id: "qualidade_auditoria", nome: "Auditoria", icon: "🔍", categoria: "Qualidade" },
  { id: "qualidade_agua", nome: "Teste Água", icon: "💧", categoria: "Qualidade" },
  { id: "teste_dinamometro", nome: "Dinamômetro", icon: "📈", categoria: "Testes" },
  { id: "teste_alinhamento", nome: "Alinhamento", icon: "🎯", categoria: "Testes" },
  { id: "teste_luz", nome: "Farol", icon: "💡", categoria: "Testes" },
  { id: "teste_road", nome: "Road Test", icon: "🛣️", categoria: "Testes" },
  { id: "expedicao_limpeza", nome: "Limpeza", icon: "🧽", categoria: "Expedição" },
  { id: "expedicao_final", nome: "Expedição", icon: "📦", categoria: "Expedição" },
  { id: "saida", nome: "Saída", icon: "🏁", categoria: "Expedição" },
];

const CAT_COLORS = {
  Recebimento: "bg-slate-500",
  Chaparia: "bg-slate-600",
  Montagem: "bg-blue-600",
  Pintura: "bg-teal-600",
  PCP: "bg-amber-600",
  Qualidade: "bg-lime-600",
  Testes: "bg-green-600",
  Expedição: "bg-sky-600",
};

const STATUS_DOT = {
  erro: "bg-red-500",
  alerta: "bg-yellow-500",
  concluido: "bg-emerald-500",
  em_processo: "bg-blue-500",
  ok: "bg-green-400",
  aguardando: "bg-slate-400",
};

function CarroMiniCard({ carro, onEdit }) {
  return (
    <motion.button
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onEdit(carro)}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-white shadow-sm w-full text-left active:bg-slate-50"
      style={{ borderLeftColor: carro.cor || "#aaa", borderLeftWidth: 3 }}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[carro.status] || "bg-slate-400"}`} />
      <span className="text-[10px] font-semibold text-slate-800 truncate flex-1">{carro.modelo?.replace("Polo ", "").replace("Tera ", "") || "—"}</span>
      <span className="text-[9px] text-slate-400 font-mono">{carro.chassi?.slice(-4)}</span>
      {carro.problemas?.length > 0 && (
        <AlertTriangle className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
      )}
    </motion.button>
  );
}

function EstacaoCard({ estacao, carros, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const temErro = carros.some(c => c.status === "erro");
  const temAlerta = carros.some(c => c.status === "alerta");
  const catColor = CAT_COLORS[estacao.categoria] || "bg-slate-500";

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${temErro ? "border-red-400" : temAlerta ? "border-yellow-400" : "border-transparent"} bg-white shadow-sm`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        <div className={`w-8 h-8 ${catColor} rounded-lg flex items-center justify-center flex-shrink-0 text-base shadow-sm relative`}>
          <span>{estacao.icon}</span>
          {temErro && (
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 0.7 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{estacao.nome}</p>
          <p className="text-[9px] text-slate-400">{estacao.categoria}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white ${catColor}`}>{carros.length}</span>
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100">
            <div className="p-2 space-y-1">
              {carros.map(c => <CarroMiniCard key={c.id} carro={c} onEdit={onEdit} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LinhaVisual({ carros, onEdit }) {
  const [catFiltro, setCatFiltro] = useState("todas");

  // Agrupa por categoria
  const categorias = [...new Set(ESTACOES.map(e => e.categoria))];

  // Estações com carros
  const estacoesComCarros = ESTACOES.map(e => ({
    ...e,
    carros: carros.filter(c => c.estacao_atual === e.id)
  })).filter(e => e.carros.length > 0);

  const filtradas = catFiltro === "todas" ? estacoesComCarros : estacoesComCarros.filter(e => e.categoria === catFiltro);

  const totalComErro = carros.filter(c => c.status === "erro").length;
  const totalEmProcesso = carros.filter(c => c.status === "em_processo").length;

  if (carros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Car className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhum veículo na linha</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resumo rápido */}
      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
          <Zap className="w-3 h-3 text-green-500" />
          <span className="font-medium">{carros.length} veículos</span>
        </div>
        {totalComErro > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full text-red-700">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-medium">{totalComErro} erros</span>
          </div>
        )}
        {totalEmProcesso > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-blue-700">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{totalEmProcesso} em processo</span>
          </div>
        )}
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {["todas", ...categorias].map(cat => (
          <button key={cat} onClick={() => setCatFiltro(cat)}
            className={`whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all flex-shrink-0 ${
              catFiltro === cat ? "bg-[#0066b1] text-white border-[#0066b1]" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
            }`}>
            {cat === "todas" ? `Todas (${estacoesComCarros.length})` : cat}
          </button>
        ))}
      </div>

      {/* Estações ativas */}
      {filtradas.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">Nenhuma estação com veículos neste filtro</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filtradas.map(e => (
            <EstacaoCard key={e.id} estacao={e} carros={e.carros} onEdit={onEdit} />
          ))}
        </div>
      )}

      {/* Legenda compacta */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
        {[
          { label: "Erro", dot: "bg-red-500" },
          { label: "Alerta", dot: "bg-yellow-500" },
          { label: "Processo", dot: "bg-blue-500" },
          { label: "OK", dot: "bg-green-400" },
          { label: "Aguardando", dot: "bg-slate-400" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-[10px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}