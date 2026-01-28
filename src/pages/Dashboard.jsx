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
          className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 md:p-8 text-white"
        >
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Olá, {currentUser?.nome_exibicao || currentUser?.full_name?.split(' ')[0]}
                  </h1>
                  <p className="text-slate-300 text-base md:text-lg">
                    Resumo de atividades e indicadores
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 text-sm">
                  {currentUser?.cargo === 'lider' ? 'Líder' : 'Monitor'} • Chapa {currentUser?.chapa}
                </Badge>
                {currentUser?.equipe && (
                  <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                    Equipe: {currentUser.equipe}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg mb-3 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.atividadesLogistica}</div>
                <p className="text-xs text-slate-600">Logística</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.pedidosEPI}</div>
                <p className="text-xs text-slate-600">Pedidos EPI</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg mb-3 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.versatilidade}</div>
                <p className="text-xs text-slate-600">Colaboradores</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-lg mb-3 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.mensagens}</div>
                <p className="text-xs text-slate-600">Mensagens</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-cyan-50 rounded-lg mb-3 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.objetivosConcluidos}</div>
                <p className="text-xs text-slate-600">Objetivos OK</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 rounded-lg mb-3 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.avisosImportantes}</div>
                <p className="text-xs text-slate-600">Avisos Urgentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-700" />
            Ações Rápidas
          </h2>
          <AtalhosRapidos />
        </div>

        {/* Recent Activity and Tips */}
        <div className="grid lg:grid-cols-2 gap-8">
          <HistoricoAtividades currentUser={currentUser} />
          
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="text-lg flex items-center gap-2 font-semibold text-slate-900">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Dicas e Lembretes
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