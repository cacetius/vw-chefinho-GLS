import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Car, AlertTriangle, ChevronRight, Zap, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Setores reais da linha de produção VW Taubaté — Polo Track & Tera
const SECOES = [
  {
    id: "estamparia",
    nome: "Estamparia",
    cor: "bg-stone-600",
    corBorda: "border-stone-400",
    corTexto: "text-stone-700",
    corBg: "bg-stone-50",
    estacoes: [
      { id: "entrada", nome: "Recebimento Chapa", icon: "🚪" },
      { id: "estamparia_prensa", nome: "Prensas (354 ferramentas)", icon: "🔨" },
      { id: "estamparia_inspeção", nome: "Inspeção Dimensional", icon: "📏" },
    ]
  },
  {
    id: "armacao",
    nome: "Armação (Karosseriebau)",
    cor: "bg-zinc-700",
    corBorda: "border-zinc-400",
    corTexto: "text-zinc-700",
    corBg: "bg-zinc-50",
    estacoes: [
      { id: "chaparia_solda", nome: "Solda Ponto (875 robôs)", icon: "⚡" },
      { id: "armacao_lateral", nome: "Lateral Int./Ext.", icon: "🤖" },
      { id: "armacao_teto", nome: "Solda Laser Teto", icon: "🔆" },
      { id: "chaparia_geometria", nome: "Geometria / Medição", icon: "📐" },
      { id: "armacao_cera", nome: "Cera Anti-Corrosão", icon: "🛡️" },
    ]
  },
  {
    id: "pintura",
    nome: "Pintura",
    cor: "bg-teal-600",
    corBorda: "border-teal-400",
    corTexto: "text-teal-700",
    corBg: "bg-teal-50",
    estacoes: [
      { id: "pintura_fosfatizacao", nome: "Fosfatização", icon: "🧪" },
      { id: "pintura_ecoat", nome: "E-Coat (100% robótico)", icon: "🔋" },
      { id: "pintura_vedacao", nome: "Vedação / Calafetar", icon: "🔒" },
      { id: "pintura_primer", nome: "Primer", icon: "🖌️" },
      { id: "pintura_base", nome: "Base Coat (tinta d'água)", icon: "🎨" },
      { id: "pintura_bitone", nome: "Bi-tone / Teto Preto", icon: "🖤" },
      { id: "pintura_verniz", nome: "Verniz (100% robótico)", icon: "✨" },
      { id: "pintura_secagem", nome: "Forno / Secagem", icon: "🔥" },
      { id: "pintura_inspecao", nome: "Inspeção Visual", icon: "👁️" },
    ]
  },
  {
    id: "montagem",
    nome: "Montagem Final (1,8km / 242 carrocerias)",
    cor: "bg-blue-600",
    corBorda: "border-blue-400",
    corTexto: "text-blue-700",
    corBg: "bg-blue-50",
    estacoes: [
      { id: "zp1", nome: "ZP1 — Preparação Carroceria", icon: "①" },
      { id: "zp2", nome: "ZP2 — Chicotes Elétricos", icon: "②" },
      { id: "zp3", nome: "ZP3 — Painel / Dashboard", icon: "③" },
      { id: "zp4", nome: "ZP4 — Motor / Conjunto Motriz", icon: "④" },
      { id: "zp5", nome: "ZP5 — Suspensão Dianteira", icon: "⑤" },
      { id: "zp6", nome: "ZP6 — Suspensão Traseira", icon: "⑥" },
      { id: "zp7", nome: "ZP7 — Vidros", icon: "⑦" },
      { id: "zp8", nome: "ZP8 — Bancos / Interior", icon: "⑧" },
      { id: "doorless", nome: "Doorless (portas separadas)", icon: "🚪" },
      { id: "celula_parachoque", nome: "Parachoque Front/Rear", icon: "🛡️" },
      { id: "dress_up", nome: "Dress Up / Acabamento Ext.", icon: "✨" },
      { id: "acabamento_interno", nome: "Acabamento Interno", icon: "🪑" },
      { id: "capo_tampa", nome: "Capô, Portas e Tampa", icon: "📦" },
      { id: "fluidos", nome: "Abastecimento de Fluidos", icon: "💧" },
    ]
  },
  {
    id: "pcp",
    nome: "Retrabalho / PCP",
    cor: "bg-amber-600",
    corBorda: "border-amber-400",
    corTexto: "text-amber-700",
    corBg: "bg-amber-50",
    estacoes: [
      { id: "pcp_polimento", nome: "Polimento", icon: "💎" },
      { id: "pcp_retoque", nome: "Retoque Pintura", icon: "🖊️" },
      { id: "pcp_retrabalho", nome: "Retrabalho Montagem", icon: "🔧" },
    ]
  },
  {
    id: "qualidade",
    nome: "Qualidade (VDA 6.3)",
    cor: "bg-lime-600",
    corBorda: "border-lime-400",
    corTexto: "text-lime-700",
    corBg: "bg-lime-50",
    estacoes: [
      { id: "qualidade_auditoria", nome: "Auditoria VDA", icon: "🔍" },
      { id: "qualidade_eletrica", nome: "Teste Elétrico (22-30 módulos)", icon: "⚡" },
      { id: "qualidade_agua", nome: "Teste de Água / Estanqueidade", icon: "💧" },
      { id: "qualidade_visual", nome: "Inspeção Visual Final", icon: "👁️" },
    ]
  },
  {
    id: "testes",
    nome: "Testes Finais",
    cor: "bg-green-600",
    corBorda: "border-green-400",
    corTexto: "text-green-700",
    corBg: "bg-green-50",
    estacoes: [
      { id: "teste_dinamometro", nome: "Dinamômetro / Potência", icon: "📈" },
      { id: "teste_alinhamento", nome: "Alinhamento / Convergência", icon: "🎯" },
      { id: "teste_luz", nome: "Regulagem Faróis", icon: "💡" },
      { id: "teste_freios", nome: "Teste de Freios", icon: "🛑" },
      { id: "teste_road", nome: "Road Test (pista interna)", icon: "🛣️" },
    ]
  },
  {
    id: "expedicao",
    nome: "Expedição",
    cor: "bg-sky-600",
    corBorda: "border-sky-400",
    corTexto: "text-sky-700",
    corBg: "bg-sky-50",
    estacoes: [
      { id: "expedicao_limpeza", nome: "Limpeza e Preparação", icon: "🧽" },
      { id: "expedicao_documentacao", nome: "Documentação / Nota Fiscal", icon: "📋" },
      { id: "expedicao_final", nome: "Pátio de Expedição", icon: "🏭" },
      { id: "saida", nome: "Saída — Transportadora", icon: "🚛" },
    ]
  },
];

const STATUS_CONFIG = {
  erro:       { cor: "bg-red-500",     texto: "text-red-600",    borda: "border-red-300",    label: "Erro" },
  alerta:     { cor: "bg-yellow-500",  texto: "text-yellow-600", borda: "border-yellow-300", label: "Alerta" },
  concluido:  { cor: "bg-emerald-500", texto: "text-emerald-600",borda: "border-emerald-300",label: "Concluído" },
  em_processo:{ cor: "bg-blue-500",    texto: "text-blue-600",   borda: "border-blue-300",   label: "Em Processo" },
  ok:         { cor: "bg-green-400",   texto: "text-green-600",  borda: "border-green-300",  label: "OK" },
  aguardando: { cor: "bg-slate-400",   texto: "text-slate-500",  borda: "border-slate-200",  label: "Aguardando" },
};

function CarroCard({ carro, onEdit }) {
  const s = STATUS_CONFIG[carro.status] || STATUS_CONFIG.aguardando;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onEdit(carro)}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-all text-left ${s.borda}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.cor} ${carro.status === "erro" ? "animate-pulse" : ""}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
          {carro.modelo?.replace("Volkswagen ", "").replace("VW ", "") || "—"}
        </p>
        <p className="text-[9px] text-slate-400 font-mono">{carro.chassi?.slice(-6) || "—"}</p>
      </div>
      {carro.cor && (
        <div className="w-3.5 h-3.5 rounded-full border border-slate-200 flex-shrink-0" style={{ backgroundColor: carro.cor }} />
      )}
      {carro.problemas?.length > 0 && (
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[9px] text-red-500 font-bold">{carro.problemas.length}</span>
        </div>
      )}
    </motion.button>
  );
}

function EstacaoCell({ estacao, carros, corSecao, onEdit }) {
  const [open, setOpen] = useState(false);
  const temErro = carros.some(c => c.status === "erro");
  const count = carros.length;

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${
      temErro ? "border-red-400 shadow-red-100 shadow-md" : "border-slate-200"
    } bg-white`}>
      <button
        onClick={() => count > 0 && setOpen(o => !o)}
        className={`w-full flex items-center gap-2 p-2.5 transition-colors ${count > 0 ? "hover:bg-slate-50 active:bg-slate-100 cursor-pointer" : "cursor-default opacity-60"}`}
      >
        {/* Ícone */}
        <div className={`w-9 h-9 ${corSecao} rounded-lg flex items-center justify-center flex-shrink-0 text-lg shadow-sm relative`}>
          <span>{estacao.icon}</span>
          {temErro && (
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            />
          )}
        </div>
        {/* Nome */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-slate-800 truncate leading-tight">{estacao.nome}</p>
          {count > 0 ? (
            <p className="text-[9px] text-slate-400">{count} veículo{count > 1 ? "s" : ""}</p>
          ) : (
            <p className="text-[9px] text-slate-300">Vazio</p>
          )}
        </div>
        {/* Badge */}
        {count > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`w-5 h-5 rounded-full ${corSecao} text-white text-[10px] font-bold flex items-center justify-center`}>
              {count}
            </span>
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </motion.div>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 pt-0 space-y-1.5 border-t border-slate-100">
              {carros.map(c => (
                <CarroCard key={c.id} carro={c} onEdit={onEdit} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LinhaVisual({ carros, onEdit }) {
  const [secaoFiltro, setSecaoFiltro] = useState("todas");

  const totalErros = carros.filter(c => c.status === "erro").length;
  const totalProcesso = carros.filter(c => c.status === "em_processo").length;
  const totalProntos = carros.filter(c => c.status === "concluido").length;

  // Monta as seções com carros
  const secoesComDados = SECOES.map(s => ({
    ...s,
    estacoesComCarros: s.estacoes.map(e => ({
      ...e,
      carros: carros.filter(c => c.estacao_atual === e.id)
    })),
    totalCarros: s.estacoes.reduce((acc, e) => acc + carros.filter(c => c.estacao_atual === e.id).length, 0),
  }));

  const secoesFiltradas = secaoFiltro === "todas"
    ? secoesComDados
    : secoesComDados.filter(s => s.id === secaoFiltro);

  if (carros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Car className="w-14 h-14 mb-3 opacity-20" />
        <p className="text-sm font-medium">Nenhum veículo na linha</p>
        <p className="text-xs mt-1">Adicione um carro para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resumo de status */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
          <Car className="w-4 h-4 text-[#0066b1]" />
          <div>
            <p className="text-base font-bold text-slate-900 leading-none">{carros.length}</p>
            <p className="text-[9px] text-slate-400">Total</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${totalErros > 0 ? "bg-red-50" : "bg-slate-50"}`}>
          <AlertTriangle className={`w-4 h-4 ${totalErros > 0 ? "text-red-500" : "text-slate-300"}`} />
          <div>
            <p className={`text-base font-bold leading-none ${totalErros > 0 ? "text-red-600" : "text-slate-400"}`}>{totalErros}</p>
            <p className="text-[9px] text-slate-400">Erros</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <div>
            <p className="text-base font-bold text-emerald-700 leading-none">{totalProntos}</p>
            <p className="text-[9px] text-slate-400">Prontos</p>
          </div>
        </div>
      </div>

      {/* Filtro por seção */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSecaoFiltro("todas")}
          className={`whitespace-nowrap text-[10px] px-3 py-1.5 rounded-full border font-semibold transition-all flex-shrink-0 ${
            secaoFiltro === "todas"
              ? "bg-[#0066b1] text-white border-[#0066b1]"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
        >
          Todas ({secoesComDados.filter(s => s.totalCarros > 0).length})
        </button>
        {secoesComDados.map(s => (
          <button
            key={s.id}
            onClick={() => setSecaoFiltro(s.id)}
            className={`whitespace-nowrap text-[10px] px-3 py-1.5 rounded-full border font-semibold transition-all flex-shrink-0 ${
              secaoFiltro === s.id
                ? `${s.cor} text-white border-transparent`
                : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
            }`}
          >
            {s.nome} {s.totalCarros > 0 && `(${s.totalCarros})`}
          </button>
        ))}
      </div>

      {/* Seções da linha */}
      <div className="space-y-3">
        {secoesFiltradas.map(secao => {
          const estacoesAtivas = secao.estacoesComCarros;
          const mostrar = secaoFiltro !== "todas" || estacoesAtivas.some(e => e.carros.length > 0);
          if (!mostrar) return null;

          return (
            <div key={secao.id} className={`rounded-2xl border-2 ${secao.corBorda} overflow-hidden`}>
              {/* Header da seção */}
              <div className={`${secao.corBg} px-3 py-2 flex items-center gap-2 border-b ${secao.corBorda}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${secao.cor}`} />
                <span className={`text-xs font-bold ${secao.corTexto} uppercase tracking-wide`}>{secao.nome}</span>
                {secao.totalCarros > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${secao.cor}`}>
                    {secao.totalCarros}
                  </span>
                )}
              </div>

              {/* Estações em grid */}
              <div className="p-2 grid grid-cols-1 gap-2 bg-white">
                {estacoesAtivas.map(e => (
                  <EstacaoCell
                    key={e.id}
                    estacao={e}
                    carros={e.carros}
                    corSecao={secao.cor}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.cor}`} />
            <span className="text-[10px] text-slate-500">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}