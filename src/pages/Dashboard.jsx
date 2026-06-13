import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Wrench, Gauge, ClipboardCheck, Sparkles, Monitor,
  Calendar, Tag, Ruler, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, BarChart3, ArrowRight, Bell,
  FileText, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import ChefinhoIA from "../components/dashboard/ChefinhoIA";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarIA, setMostrarIA] = useState(false);

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u) || u).catch(() => {}); }, []);

  const { data: kpis = {}, isLoading } = useQuery({
    queryKey: ["dashboard-executivo", currentUser?.equipe],
    queryFn: async () => {
      const [ferramentas, calibracoes, auditorias, cincoS, atividades, bancadas, etiquetas, faixas] = await Promise.all([
        base44.entities.Ferramenta.list(),
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaIndustrialProcesso.list("-data", 100),
        base44.entities.CincoS.list("-data", 50),
        base44.entities.AtividadeMonitor.list("-data", 200),
        base44.entities.Bancada.list(),
        base44.entities.Etiqueta.list(),
        base44.entities.Faixa.list(),
      ]);

      const hoje = new Date(); hoje.setHours(0,0,0,0);

      // Calibração status
      const calStatus = calibracoes.reduce((acc, c) => {
        if (!c.data_vencimento) { acc.semData++; return acc; }
        const dias = differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hoje);
        if (dias < 0) acc.vencido++;
        else if (dias <= 15) acc.vence15++;
        else if (dias <= 30) acc.vence30++;
        else acc.ok++;
        return acc;
      }, { ok: 0, vence30: 0, vence15: 0, vencido: 0, semData: 0 });

      // AuditoriaIndustrial
      const audStatus = auditorias.reduce((acc, a) => {
        if (a.conformidade === "conforme") acc.conforme++;
        else if (a.conformidade === "nao_conforme") acc.naoConforme++;
        else acc.outros++;
        return acc;
      }, { conforme: 0, naoConforme: 0, outros: 0 });

      // 5S - última pontuação
      const ultimo5S = cincoS.length > 0 ? cincoS[0] : null;

      // Atividades
      const ativStatus = atividades.reduce((acc, a) => {
        if (a.status === "concluido") acc.concluidas++;
        else if (a.status === "atrasado") acc.atrasadas++;
        else if (a.status === "em_andamento") acc.emAndamento++;
        else acc.naoIniciadas++;
        return acc;
      }, { concluidas: 0, atrasadas: 0, emAndamento: 0, naoIniciadas: 0 });

      // Etiquetas/Faixas status
      const etiqCriticas = etiquetas.filter(e => e.status === "substituir" || e.status === "desgastado").length;
      const faixasCriticas = faixas.filter(f => f.condicao === "critico" || f.condicao === "ruim").length;

      return {
        ferramentas: ferramentas.length,
        ferramentasAtivas: ferramentas.filter(f => f.status === "ativo").length,
        calStatus,
        calTotal: calibracoes.length,
        audStatus,
        audTotal: auditorias.length,
        ultimo5S,
        cincoSTotal: cincoS.length,
        ativStatus,
        ativTotal: atividades.length,
        bancadas: bancadas.length,
        etiquetas: etiquetas.length,
        etiqCriticas,
        faixas: faixas.length,
        faixasCriticas,
      };
    },
    enabled: !!currentUser,
    refetchInterval: 60000
  });

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];

  const KPI_CARDS = [
    { label: "Ferramentas", valor: kpis.ferramentas, sub: `${kpis.ferramentasAtivas} ativas`, icon: Wrench, color: "from-blue-600 to-blue-800", url: "Ferramentas" },
    { label: "Calibrações", valor: kpis.calTotal, sub: `${kpis.calStatus.vencido} vencidas · ${kpis.calStatus.vence15 + kpis.calStatus.vence30} próximas`, icon: Gauge, color: "from-amber-600 to-orange-700", url: "Calibracao", alert: kpis.calStatus.vencido > 0 },
    { label: "AuditoriaIndustrials", valor: kpis.audTotal, sub: `${kpis.audStatus.naoConforme} não conformes`, icon: ClipboardCheck, color: "from-emerald-600 to-teal-700", url: "AuditoriaIndustrial", alert: kpis.audStatus.naoConforme > 0 },
    { label: "5S", valor: kpis.ultimo5S ? `${kpis.ultimo5S.pontuacao_total}/50` : "-", sub: `${kpis.cincoSTotal} avaliações`, icon: Sparkles, color: "from-purple-600 to-violet-700", url: "CincoS" },
    { label: "Monitor", valor: `${kpis.ativStatus.concluidas}/${kpis.ativTotal}`, sub: `${kpis.ativStatus.atrasadas} atrasadas`, icon: Monitor, color: "from-cyan-600 to-sky-700", url: "QuadroMonitor", alert: kpis.ativStatus.atrasadas > 0 },
    { label: "Bancadas", valor: kpis.bancadas, sub: "em monitoramento", icon: BarChart3, color: "from-slate-600 to-slate-800", url: "Bancadas" },
  ];

  const hasAlertas = kpis.calStatus.vencido > 0 || kpis.audStatus.naoConforme > 0 || kpis.ativStatus.atrasadas > 0 || kpis.etiqCriticas > 0 || kpis.faixasCriticas > 0;

  return (
    <div className="space-y-3 w-full min-w-0 overflow-x-hidden">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-2xl p-4 text-white overflow-hidden relative"
      >
        <div className="absolute right-0 top-0 bottom-0 w-24 opacity-5 select-none text-[90px] leading-none overflow-hidden">🏭</div>
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-wide">VW Chefinho GLS</p>
            <h1 className="text-lg font-bold leading-tight mt-0.5">Olá, {firstName}! 👋</h1>
            <p className="text-blue-200 text-[11px] mt-0.5">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: undefined }).replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge className="bg-white/20 text-white border-transparent text-[10px] px-2 py-0.5">
              {currentUser?.cargo === "supervisor" ? "🎖️ Supervisor" : currentUser?.cargo === "lider" ? "👔 Líder" : "👷 Monitor"}
            </Badge>
            {currentUser?.equipe && <Badge className="bg-white/10 text-white/80 border-transparent text-[9px] px-2 py-0.5 max-w-full truncate">{currentUser.equipe}</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Alertas Consolidados */}
      {hasAlertas && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Alertas do Sistema</p>
          <div className="flex flex-wrap gap-1.5">
            {kpis.calStatus.vencido > 0 && (
              <Badge className="bg-red-100 text-red-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("Calibracao"))}>
                ⚠️ {kpis.calStatus.vencido} calibrações vencidas
              </Badge>
            )}
            {kpis.calStatus.vence15 > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("Calibracao"))}>
                ⏰ {kpis.calStatus.vence15} vencem em 15 dias
              </Badge>
            )}
            {kpis.audStatus.naoConforme > 0 && (
              <Badge className="bg-red-100 text-red-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))}>
                ❌ {kpis.audStatus.naoConforme} não conformidades
              </Badge>
            )}
            {kpis.ativStatus.atrasadas > 0 && (
              <Badge className="bg-red-100 text-red-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("QuadroMonitor"))}>
                📋 {kpis.ativStatus.atrasadas} atividades atrasadas
              </Badge>
            )}
            {kpis.etiqCriticas > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("ChecklistAuditoriaIndustrial"))}>
                🏷️ {kpis.etiqCriticas} etiquetas críticas
              </Badge>
            )}
            {kpis.faixasCriticas > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] cursor-pointer" onClick={() => navigate(createPageUrl("ChecklistAuditoriaIndustrial"))}>
                📏 {kpis.faixasCriticas} faixas críticas
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Botão Chefinho IA */}
      <Button
        onClick={() => setMostrarIA(v => !v)}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white gap-2 h-11 rounded-xl"
      >
        <Zap className="w-4 h-4" />
        {mostrarIA ? "Fechar Chefinho IA" : "Gerar Relatório Inteligente — Chefinho IA"}
      </Button>

      {mostrarIA && <ChefinhoIA kpis={kpis} currentUser={currentUser} />}

      {/* KPIs Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Indicadores em Tempo Real
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {KPI_CARDS.map(({ label, valor, sub, icon: Icon, color, url, alert }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(createPageUrl(url))}
              className={`bg-gradient-to-br ${color} rounded-xl p-3 text-white cursor-pointer active:opacity-80 transition-all relative overflow-hidden`}>
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                {alert && <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />}
              </div>
              <p className="text-2xl font-bold mt-2">{valor}</p>
              <p className="text-[10px] text-white/70 mt-0.5">{sub}</p>
              <p className="text-[10px] font-medium mt-1.5 flex items-center gap-0.5 text-white/80">
                {label} <ArrowRight className="w-3 h-3" />
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Calibração Status Detalhado */}
      <Card className="border border-slate-200">
        <CardContent className="p-3">
          <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-600" /> Status das Calibrações
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Em Dia", val: kpis.calStatus.ok, color: "bg-emerald-100 text-emerald-700" },
              { label: "30 dias", val: kpis.calStatus.vence30, color: "bg-yellow-100 text-yellow-700" },
              { label: "15 dias", val: kpis.calStatus.vence15, color: "bg-orange-100 text-orange-700" },
              { label: "Vencidas", val: kpis.calStatus.vencido, color: "bg-red-100 text-red-700" },
            ].map(s => (
              <div key={s.label} className={`text-center py-2 rounded-lg ${s.color}`}>
                <p className="text-lg font-bold">{s.val}</p>
                <p className="text-[9px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Módulos Rápidos */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Acessos Rápidos
        </h2>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Ferramentas", url: "Ferramentas", icon: Wrench },
            { label: "Calibração", url: "Calibracao", icon: Gauge },
            { label: "AuditoriaIndustrial", url: "AuditoriaIndustrial", icon: ClipboardCheck },
            { label: "Quadro Monitor", url: "QuadroMonitor", icon: Monitor },
            { label: "5S", url: "CincoS", icon: Sparkles },
            { label: "Bancadas", url: "Bancadas", icon: BarChart3 },
            { label: "Etiquetas", url: "ChecklistAuditoriaIndustrial", icon: Tag },
            { label: "Faixas", url: "ChecklistAuditoriaIndustrial", icon: Ruler },
            { label: "Calendário", url: "Calendario", icon: Calendar },
          ].map(({ label, url, icon: Icon }) => (
            <button key={url} onClick={() => navigate(createPageUrl(url))}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 active:bg-slate-200 transition-colors">
              <Icon className="w-4 h-4 text-slate-600" />
              <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}