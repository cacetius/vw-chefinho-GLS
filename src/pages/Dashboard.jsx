import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck, ShoppingCart, Users, MessageSquare,
  TrendingUp, CheckCircle2, AlertCircle, Activity,
  Lightbulb, ArrowRight, Bell, Target, Car
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import AtalhosRapidos from "../components/shared/AtalhosRapidos";
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

  const { data: stats = {} } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [atividades, pedidos, versatilidade, mensagens, objetivos, avisos] = await Promise.all([
        base44.entities.AtividadeLogistica.list(),
        base44.entities.PedidoEPI.list(),
        base44.entities.Versatilidade.list(),
        base44.entities.MensagemChat.list("-created_date", 5),
        base44.entities.Objetivo.list(),
        base44.entities.Aviso.list()
      ]);
      return {
        logistica: atividades.filter(a => a.status !== "concluida").length,
        epiPendentes: pedidos.filter(p => p.status === "pendente").length,
        colaboradores: versatilidade.length,
        mensagens: mensagens.length,
        objetivosConcluidos: objetivos.filter(o => o.concluido).length,
        objetivosTotal: objetivos.length,
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
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0066b1] rounded-full animate-spin border-[3px]"></div>
          <p className="text-slate-500 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];

  const STATS = [
    { label: "Logística ativa", value: stats.logistica ?? 0, icon: Truck, color: "text-blue-600", bg: "bg-blue-50", url: "Logistica" },
    { label: "EPI pendentes", value: stats.epiPendentes ?? 0, icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50", url: "PedidosEPI" },
    { label: "Colaboradores", value: stats.colaboradores ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50", url: "Versatilidade" },
    { label: "Mensagens", value: stats.mensagens ?? 0, icon: MessageSquare, color: "text-cyan-600", bg: "bg-cyan-50", url: "Chat" },
    { label: "Objetivos ok", value: stats.objetivosConcluidos ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", url: "Objetivos" },
    { label: "Urgentes", value: stats.urgentes ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", url: "Avisos" },
  ];

  const objetivosPercent = stats.objetivosTotal > 0
    ? Math.round((stats.objetivosConcluidos / stats.objetivosTotal) * 100)
    : 0;

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
              {currentUser?.cargo === "lider" ? "👔 Líder" : "👷 Monitor"}
            </Badge>
            {currentUser?.equipe && (
              <Badge className="bg-white/10 text-white/80 border-transparent text-[10px]">
                {currentUser.equipe}
              </Badge>
            )}
            {currentUser?.turno && (
              <Badge className="bg-white/10 text-white/80 border-transparent text-[10px]">
                Turno {currentUser.turno}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {STATS.map(({ label, value, icon: Icon, bg, color, url }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={createPageUrl(url)}>
              <Card className="border border-slate-200 hover:shadow-md transition-all cursor-pointer active:scale-95">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-slate-900 leading-none">{value}</div>
                    <p className="text-[9px] text-slate-500 leading-tight truncate">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Alertas de urgência */}
      {stats.urgentes > 0 && (
        <Link to={createPageUrl("Avisos")}>
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
              <p className="text-xs text-red-600">Clique para ver os comunicados urgentes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
          </motion.div>
        </Link>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Ações Rápidas
        </h2>
        <AtalhosRapidos />
      </div>

      {/* Bottom section */}
      <div className="grid lg:grid-cols-2 gap-3">
        <HistoricoAtividades currentUser={currentUser} />

        <Card className="border border-slate-200">
          <CardHeader className="border-b bg-slate-50 py-3 px-4">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Dicas do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {[
              { icon: CheckCircle2, title: "Segurança em Primeiro Lugar", desc: "Verifique se todos estão usando EPIs adequados antes do início do turno.", iconColor: "text-blue-600", bg: "bg-blue-50", url: "PedidosEPI" },
              { icon: TrendingUp, title: "Objetivos do Dia", desc: "Atualize o progresso dos seus objetivos diários para manter o time alinhado.", iconColor: "text-green-600", bg: "bg-green-50", url: "Objetivos" },
              { icon: Users, title: "Versatilidade da Equipe", desc: "Mantenha a matriz de habilidades atualizada para planejar coberturas.", iconColor: "text-purple-600", bg: "bg-purple-50", url: "Versatilidade" },
            ].map((tip) => (
              <Link key={tip.title} to={createPageUrl(tip.url)}>
                <div className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-2.5 cursor-pointer">
                  <div className={`w-7 h-7 ${tip.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <tip.icon className={`w-3.5 h-3.5 ${tip.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs">{tip.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tip.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}