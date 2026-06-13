import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Wrench, ClipboardCheck, Calendar, CheckCircle2, FileText, AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: alertas = {} } = useQuery({
    queryKey: ["home-alertas"],
    queryFn: async () => {
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const [cal, auds, etiq, faixas] = await Promise.all([
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaProcesso.list("-data", 50),
        base44.entities.Etiqueta.list(),
        base44.entities.Faixa.list(),
      ]);

      const calVencidas = cal.filter(c => c.data_vencimento && differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hoje) < 0).length;
      const audPendentes = auds.filter(a => a.conformidade === "nao_conforme").length;
      const etiqCriticas = etiq.filter(e => e.status === "substituir" || e.status === "desgastado").length;
      const faixasCriticas = faixas.filter(f => f.condicao === "critico" || f.condicao === "ruim").length;

      return {
        critico: calVencidas + audPendentes + etiqCriticas + faixasCriticas,
        detalhes: [
          { label: "Calibrações vencidas", count: calVencidas },
          { label: "Não conformidades", count: audPendentes },
          { label: "Etiquetas críticas", count: etiqCriticas },
          { label: "Faixas críticas", count: faixasCriticas },
        ].filter(d => d.count > 0)
      };
    },
    enabled: !!currentUser,
    refetchInterval: 120000
  });

  if (!currentUser) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;
  }

  const nome = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];
  const totalCritico = alertas.critico || 0;

  const BOTOES = [
    { label: "Ferramentas", icon: Wrench, url: "Ferramentas", cor: "from-sky-600 to-blue-700" },
    { label: "Auditorias", icon: ClipboardCheck, url: "AuditoriaIndustrial", cor: "from-emerald-600 to-teal-700" },
    { label: "Calendário", icon: Calendar, url: "Calendario", cor: "from-purple-600 to-violet-700" },
    { label: "Minhas Atividades", icon: CheckCircle2, url: "QuadroMonitor", cor: "from-amber-600 to-orange-700" },
    { label: "Relatórios", icon: FileText, url: "Relatorios", cor: "from-slate-700 to-slate-900" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-180px)] max-w-md mx-auto w-full px-2">
      
      {/* Header */}
      <div className="text-center py-3">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">VW Chefinho GLS</p>
        <h1 className="text-xl font-extrabold text-[#001e50] mt-0.5">Olá, {nome}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{format(new Date(), "EEEE, d 'de' MMMM")}</p>
      </div>

      {/* Alerta crítico */}
      {totalCritico > 0 && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-3 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-800">Atenção!</p>
            <p className="text-[11px] text-red-600">{totalCritico} itens precisam de ação</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {alertas.detalhes?.map(d => (
                <span key={d.label} className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-medium">{d.count} {d.label}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {totalCritico === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-emerald-700">Tudo em dia! Nenhum alerta crítico.</p>
        </div>
      )}

      {/* 5 Botões Grandes */}
      <div className="space-y-2 flex-1">
        {BOTOES.map(({ label, icon: Icon, url, cor }, i) => (
          <motion.button key={url} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => navigate(createPageUrl(url))}
            className={`w-full bg-gradient-to-r ${cor} rounded-2xl p-4 text-white flex items-center gap-4 active:opacity-80 active:scale-[0.98] transition-all`}>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold flex-1 text-left">{label}</span>
            <ChevronRight className="w-5 h-5 opacity-60" />
          </motion.button>
        ))}
      </div>

      {/* Rodapé */}
      <p className="text-center text-[10px] text-slate-300 py-4">VW Chefinho GLS — Guardião da Auditoria da Área</p>

    </div>
  );
}