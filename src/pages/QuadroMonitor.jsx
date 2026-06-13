import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Circle, Check } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const ATIVIDADES_HOJE = [
  { icone: "🔩", titulo: "Conferir torque Tacto 10" },
  { icone: "🏷️", titulo: "Verificar etiquetas Bancada 4" },
  { icone: "🔍", titulo: "Auditoria rápida da área" },
  { icone: "✨", titulo: "Atualizar 5S" },
  { icone: "🦺", titulo: "Conferir EPIs" },
];

const ATIVIDADES_SEMANA = [
  { icone: "🔧", titulo: "Auditoria de ferramentas" },
  { icone: "📏", titulo: "Revisão de faixas" },
  { icone: "🗄️", titulo: "Auditoria de bancadas" },
];

const ATIVIDADES_MES = [
  { icone: "📐", titulo: "Revisão de calibrações" },
  { icone: "📊", titulo: "Auditoria completa" },
];

export default function QuadroMonitor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checklistHoje, setChecklistHoje] = useState({});
  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  // Buscar dados críticos
  const { data: criticos = { calVencidas: [], audPendentes: [], etiqCriticas: [], faixasCriticas: [] } } = useQuery({
    queryKey: ["monitor-criticos"],
    queryFn: async () => {
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const [cal, auds, etiq, faixas] = await Promise.all([
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaProcesso.list("-data", 50),
        base44.entities.Etiqueta.list(),
        base44.entities.Faixa.list(),
      ]);

      const calVencidas = cal.filter(c => {
        if (!c.data_vencimento) return false;
        return differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hoje) < 0;
      }).slice(0, 3);
      const audPendentes = auds.filter(a => a.conformidade === "nao_conforme").slice(0, 3);
      const etiqCriticas = etiq.filter(e => e.status === "substituir" || e.status === "desgastado").slice(0, 3);
      const faixasCriticas = faixas.filter(f => f.condicao === "critico" || f.condicao === "ruim").slice(0, 3);

      return { calVencidas, audPendentes, etiqCriticas, faixasCriticas };
    },
    enabled: !!currentUser,
    refetchInterval: 300000
  });

  const toggleChecklist = (idx) => {
    setChecklistHoje(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalCritico = criticos.calVencidas.length + criticos.audPendentes.length + criticos.etiqCriticas.length + criticos.faixasCriticas.length;
  const concluidasHoje = Object.values(checklistHoje).filter(Boolean).length;

  if (!currentUser) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-3 pb-4">

      {/* O QUE ESTÁ ATRASADO */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-extrabold text-red-700">O QUE ESTÁ ATRASADO</h2>
        </div>

        {totalCritico === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Nada atrasado! 🎉</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {criticos.calVencidas.map((c, i) => (
              <div key={`cal-${i}`} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-500 text-sm">🔴</span>
                <span className="flex-1 text-xs text-red-800 font-medium">Calibração vencida: {c.equipamento || c.nome || "—"}</span>
                <span className="text-[10px] text-red-500">{c.data_vencimento && format(new Date(c.data_vencimento + "T00:00:00"), "dd/MM")}</span>
              </div>
            ))}
            {criticos.audPendentes.map((a, i) => (
              <div key={`aud-${i}`} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-500 text-sm">🔴</span>
                <span className="flex-1 text-xs text-red-800 font-medium">Auditoria não conforme: {a.titulo || a.area || "—"}</span>
              </div>
            ))}
            {criticos.etiqCriticas.map((e, i) => (
              <div key={`etiq-${i}`} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-500 text-sm">🔴</span>
                <span className="flex-1 text-xs text-red-800 font-medium">Etiqueta: {e.descricao || e.codigo || "—"}</span>
                <span className="text-[10px] text-red-500 font-bold">{e.status}</span>
              </div>
            ))}
            {criticos.faixasCriticas.map((f, i) => (
              <div key={`faixa-${i}`} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-500 text-sm">🔴</span>
                <span className="flex-1 text-xs text-red-800 font-medium">Faixa: {f.descricao || f.localizacao || "—"}</span>
                <span className="text-[10px] text-red-500 font-bold">{f.condicao}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* O QUE DEVO FAZER HOJE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0066b1] rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-extrabold text-[#001e50]">O QUE DEVO FAZER HOJE</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400">{concluidasHoje}/{ATIVIDADES_HOJE.length}</span>
        </div>

        <div className="space-y-1.5">
          {ATIVIDADES_HOJE.map((item, idx) => {
            const feito = checklistHoje[idx];
            return (
              <motion.button key={idx} whileTap={{ scale: 0.98 }}
                onClick={() => toggleChecklist(idx)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                  feito ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-[#0066b1]/30"
                }`}>
                <span className="text-lg">{item.icone}</span>
                <span className={`flex-1 text-xs font-medium ${feito ? "text-emerald-700 line-through" : "text-slate-700"}`}>{item.titulo}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  feito ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                }`}>
                  {feito && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* QUADRO DIGITAL */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Quadro Digital</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-700">{ATIVIDADES_HOJE.length}</p>
            <p className="text-[10px] text-blue-600 font-medium leading-tight mt-0.5">atividades para hoje</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-purple-700">{ATIVIDADES_SEMANA.length}</p>
            <p className="text-[10px] text-purple-600 font-medium leading-tight mt-0.5">auditorias esta semana</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-700">{ATIVIDADES_MES.length}</p>
            <p className="text-[10px] text-amber-600 font-medium leading-tight mt-0.5">calibrações este mês</p>
          </div>
        </div>
      </div>

    </div>
  );
}