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

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      if (!user.cargo) {
        navigate(createPageUrl("Registro"));
        return;
      }
      setCurrentUser(user);
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#001e50] via-[#0066b1] to-[#00b0f0] rounded-3xl shadow-2xl p-8 md:p-10 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-5xl font-bold mb-3">
                    Olá, {currentUser?.nome_exibicao || currentUser?.full_name?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg md:text-xl">
                    Seu resumo de atividades está pronto
                  </p>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-start md:items-end gap-3"
              >
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-5 py-2 text-sm shadow-lg">
                  {currentUser?.cargo === 'lider' ? '🛡️ Líder' : '📋 Monitor'} • Chapa {currentUser?.chapa}
                </Badge>
                {currentUser?.equipe && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 shadow-lg">
                    📍 Equipe: {currentUser.equipe}
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.atividadesLogistica}</div>
                  <p className="text-xs text-blue-100">Logística</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.pedidosEPI}</div>
                  <p className="text-xs text-green-100">Pedidos EPI</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.versatilidade}</div>
                  <p className="text-xs text-purple-100">Colaboradores</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.mensagens}</div>
                  <p className="text-xs text-orange-100">Mensagens</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.objetivosConcluidos}</div>
                  <p className="text-xs text-cyan-100">Objetivos OK</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.avisosImportantes}</div>
                  <p className="text-xs text-red-100">Avisos Urgentes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#0066b1]" />
            Ações Rápidas
          </h2>
          <AtalhosRapidos />
        </div>

        {/* Recent Activity and Tips */}
        <div className="grid lg:grid-cols-2 gap-8">
          <HistoricoAtividades currentUser={currentUser} />
          
          <Card className="shadow-2xl border-0">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                Dicas do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "Segurança em Primeiro Lugar",
                  desc: "Sempre verifique se todos estão usando EPIs adequados antes de iniciar qualquer atividade",
                  gradient: "from-blue-50 to-cyan-50",
                  border: "border-blue-200",
                  iconColor: "text-blue-600"
                },
                {
                  icon: TrendingUp,
                  title: "Acompanhe seus Objetivos",
                  desc: "Mantenha seus objetivos diários atualizados para melhor produtividade",
                  gradient: "from-green-50 to-emerald-50",
                  border: "border-green-200",
                  iconColor: "text-green-600"
                },
                {
                  icon: Users,
                  title: "Versatilidade da Equipe",
                  desc: "Atualize regularmente a matriz de habilidades dos colaboradores",
                  gradient: "from-purple-50 to-pink-50",
                  border: "border-purple-200",
                  iconColor: "text-purple-600"
                }
              ].map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-4 bg-gradient-to-r ${tip.gradient} rounded-xl border ${tip.border} hover:shadow-lg transition-all cursor-pointer`}
                >
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                    <tip.icon className={`w-4 h-4 ${tip.iconColor}`} />
                    {tip.title}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {tip.desc}
                  </p>
                </motion.div>
              ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}