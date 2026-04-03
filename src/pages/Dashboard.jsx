import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck, Users, Shield,
  CheckCircle2, AlertCircle, Activity,
  ArrowRight, Bell, Target, Car, ClipboardList, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import HistoricoAtividades from "../components/shared/HistoricoAtividades";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      if (!user.cargo) { navigate(createPageUrl("Registro")); setLoading(false); return; }
      setCurrentUser(user);
    } catch {
      navigate(createPageUrl("Registro"));
    }
    setLoading(false);
  };

  const isSupervisor = currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const { data: stats = {} } = useQuery({
    queryKey: ["dashboard-stats", currentUser?.equipe, isSupervisor],
    queryFn: async () => {
      const [pedidos, versatilidade, objetivos, avisos] = await Promise.all([
        base44.entities.PedidoEPI.list(),
        base44.entities.Versatilidade.list(),
        base44.entities.Objetivo.list(),
        base44.entities.Aviso.list()
      ]);
      // Filtra por equipe (supervisor vê tudo)
      const filtraEquipe = (arr, campo = "equipe") =>
        isSupervisor || !currentUser?.equipe
          ? arr
          : arr.filter(x => x[campo] === currentUser.equipe);

      const pedidosFilt = filtraEquipe(pedidos);
      const colabFilt = filtraEquipe(versatilidade);
      const objetivosFilt = filtraEquipe(objetivos);

      return {
        epiPendentes: pedidosFilt.filter(p => p.status === "pendente").length,
        colaboradores: colabFilt.length,
        objetivosConcluidos: objetivosFilt.filter(o => o.concluido).length,
        objetivosTotal: objetivosFilt.length,
        urgentes: avisos.filter(a => a.prioridade === "urgente" || a.prioridade === "importante").length,
      };
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];
  const turnoLabel = currentUser?.turno === "manha" ? "1º Turno · Manhã" : currentUser?.turno === "tarde" ? "2º Turno · Tarde" : currentUser?.turno === "noite" ? "3º Turno · Noite" : "";

  const objetivosPercent = stats.objetivosTotal > 0
    ? Math.round((stats.objetivosConcluidos / stats.objetivosTotal) * 100)
    : 0;

  // Os módulos principais
  const MODULES = [
    {
      title: "Linha de Produção",
      desc: "Veículos em tempo real",
      icon: Car,
      url: "LinhaProducao",
      gradient: "from-[#0066b1] to-[#004d82]",
      badge: null,
    },
    {
      title: "EPI & Orçamentos",
      desc: `${stats.epiPendentes ?? 0} pedidos pendentes`,
      icon: Shield,
      url: "OperacoesHub",
      gradient: "from-cyan-600 to-blue-700",
      badge: (stats.epiPendentes ?? 0) > 0 ? stats.epiPendentes : null,
    },
    {
      title: "Pessoas & Times",
      desc: `${stats.colaboradores ?? 0} colaboradores`,
      icon: Users,
      url: "PessoasHub",
      gradient: "from-purple-600 to-pink-600",
      badge: null,
    },
    {
      title: "Segurança & Qualidade",
      desc: `${objetivosPercent}% objetivos · ${stats.urgentes ?? 0} avisos`,
      icon: Shield,
      url: "SegurancaHub",
      gradient: "from-emerald-600 to-green-700",
      badge: (stats.urgentes ?? 0) > 0 ? stats.urgentes : null,
    },
    {
      title: "Auditoria VDA",
      desc: "Auditorias e planos de ação",
      icon: ClipboardList,
      url: "AuditoriaVDA",
      gradient: "from-amber-600 to-orange-600",
      badge: null,
    },
    {
      title: "Dashboard Produção",
      desc: "Métricas e indicadores",
      icon: TrendingUp,
      url: "DashboardProducao",
      gradient: "from-slate-700 to-slate-900",
      badge: null,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-2xl p-4 md:p-5 text-white overflow-hidden relative"
      >
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5 select-none text-[100px] leading-none overflow-hidden">🏭</div>
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">VW Chefinho</p>
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-0.5">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-blue-200 text-xs mt-1 capitalize">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge className="bg-white/20 text-white border-transparent text-[11px] px-2.5 py-1">
              {currentUser?.cargo === "supervisor" ? "🎖️ Supervisor" : currentUser?.cargo === "lider" ? "👔 Líder" : "👷 Monitor"}
            </Badge>
            {currentUser?.equipe && (
              <Badge className="bg-white/10 text-white/80 border-transparent text-[10px]">
                {currentUser.equipe}
              </Badge>
            )}
            {turnoLabel && (
              <Badge className="bg-white/10 text-white/80 border-transparent text-[10px]">
                {turnoLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de objetivos */}
        {stats.objetivosTotal > 0 && (
          <div className="relative mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/80 text-[11px] flex items-center gap-1"><Target className="w-3 h-3" /> Objetivos de hoje</span>
              <span className="text-white font-bold text-[11px]">{objetivosPercent}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${objetivosPercent}%` }} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Alerta urgente */}
      {(stats.urgentes ?? 0) > 0 && (
        <Link to={createPageUrl("SegurancaHub")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                {stats.urgentes} aviso{stats.urgentes > 1 ? "s" : ""} importante{stats.urgentes > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-600">Clique para ver em Segurança & Qualidade</p>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
          </motion.div>
        </Link>
      )}

      {/* 6 Módulos */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Módulos do Sistema
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {MODULES.map(({ title, desc, icon: Icon, url, gradient, badge }, i) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={createPageUrl(url)}>
                <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white relative overflow-hidden active:scale-95 transition-all hover:shadow-lg cursor-pointer min-h-[100px] flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {badge !== null && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white/30">
                        <span className="text-[10px] font-bold text-white">{badge}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-sm leading-tight">{title}</p>
                    <p className="text-white/70 text-[10px] mt-0.5 leading-tight">{desc}</p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-8 -mb-8" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <HistoricoAtividades currentUser={currentUser} />
    </div>
  );
}