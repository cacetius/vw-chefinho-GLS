import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck,
  ShoppingCart,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import AtalhosRapidos from "../components/shared/AtalhosRapidos";
import HistoricoAtividades from "../components/shared/HistoricoAtividades";
import TutorialApp from "../components/shared/TutorialApp";
import { AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      if (!user.cargo) {
        navigate(createPageUrl("Registro"));
        setLoading(false);
        return;
      }
      setCurrentUser(user);
      // Mostra tutorial se for primeira visita
      const tutorialVisto = localStorage.getItem("vw_tutorial_visto");
      if (!tutorialVisto) {
        setShowTutorial(true);
        localStorage.setItem("vw_tutorial_visto", "1");
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate(createPageUrl("Registro"));
    }
    setLoading(false);
  };

  const { data: stats = {
    atividadesLogistica: 0,
    pedidosEPI: 0,
    versatilidade: 0,
    mensagens: 0,
    objetivosConcluidos: 0,
    avisosImportantes: 0
  }} = useQuery({
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
        atividadesLogistica: atividades.length,
        pedidosEPI: pedidos.filter(p => p.status === "pendente").length,
        versatilidade: versatilidade.length,
        mensagens: mensagens.length,
        objetivosConcluidos: objetivos.filter(o => o.concluido).length,
        avisosImportantes: avisos.filter(a => a.prioridade === "urgente" || a.prioridade === "importante").length
      };
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600" style={{ borderTopColor: 'transparent' }}></div>
            <div className="absolute top-2 left-2 rounded-full h-16 w-16 bg-white"></div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <p className="text-gray-700 font-semibold text-lg">Carregando dashboard...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const STATS = [
    { label: "Logística", value: stats.atividadesLogistica, icon: Truck, bg: "bg-blue-50", color: "text-[#0066b1]" },
    { label: "EPI", value: stats.pedidosEPI, icon: ShoppingCart, bg: "bg-green-50", color: "text-green-600" },
    { label: "Colaboradores", value: stats.versatilidade, icon: Users, bg: "bg-purple-50", color: "text-purple-600" },
    { label: "Mensagens", value: stats.mensagens, icon: MessageSquare, bg: "bg-orange-50", color: "text-orange-600" },
    { label: "Objetivos", value: stats.objetivosConcluidos, icon: CheckCircle2, bg: "bg-cyan-50", color: "text-cyan-600" },
    { label: "Urgentes", value: stats.avisosImportantes, icon: AlertCircle, bg: "bg-red-50", color: "text-red-600" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatePresence>
        {showTutorial && <TutorialApp onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-2xl p-4 text-white overflow-hidden relative"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-10 select-none">👷</div>
        <div className="flex items-center justify-between gap-3 relative">
          <div>
            <p className="text-blue-200 text-[11px] font-medium">Bem-vindo ao VW Chefinho</p>
            <h1 className="text-xl font-bold leading-tight mt-0.5">
              Olá, {currentUser?.nome_exibicao || currentUser?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-200 text-xs mt-1 opacity-80">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-2 py-0.5">
              {currentUser?.cargo === 'lider' ? '👔 Líder' : '👷 Monitor'}
            </Badge>
            {currentUser?.equipe && (
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-2 py-0.5">
                {currentUser.equipe}
              </Badge>
            )}
            {currentUser?.turno && (
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-2 py-0.5">
                Turno {currentUser.turno}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid — 3 cols on mobile, 6 on desktop */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {STATS.map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="border border-slate-200">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <div className={`w-8 h-8 ${bg} rounded-lg mb-1.5 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-slate-900 leading-none">{value}</div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#0066b1]" /> Ações Rápidas
        </h2>
        <AtalhosRapidos />
      </div>

      {/* Activity + Tips — stack on mobile */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <HistoricoAtividades currentUser={currentUser} />

        <Card className="border border-slate-200">
          <CardHeader className="border-b bg-slate-50 py-3 px-4">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {[
              { icon: CheckCircle2, title: "Segurança em Primeiro Lugar", desc: "Verifique se todos usam EPIs adequados", gradient: "from-blue-50 to-cyan-50", border: "border-blue-200", iconColor: "text-blue-600" },
              { icon: TrendingUp, title: "Acompanhe seus Objetivos", desc: "Mantenha objetivos diários atualizados", gradient: "from-green-50 to-emerald-50", border: "border-green-200", iconColor: "text-green-600" },
              { icon: Users, title: "Versatilidade da Equipe", desc: "Atualize a matriz de habilidades", gradient: "from-purple-50 to-pink-50", border: "border-purple-200", iconColor: "text-purple-600" },
            ].map((tip) => (
              <div key={tip.title} className={`p-3 bg-gradient-to-r ${tip.gradient} rounded-lg border ${tip.border}`}>
                <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 mb-0.5">
                  <tip.icon className={`w-3.5 h-3.5 ${tip.iconColor}`} />{tip.title}
                </h4>
                <p className="text-[11px] text-slate-600">{tip.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}