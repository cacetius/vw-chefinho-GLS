import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck,
  ShoppingCart,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Target,
  Bell,
  Activity,
  Calendar,
  Star,
  Lightbulb,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import AtalhosRapidos from "../components/shared/AtalhosRapidos";
import HistoricoAtividades from "../components/shared/HistoricoAtividades";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    atividadesLogistica: 0,
    pedidosEPI: 0,
    versatilidade: 0,
    mensagens: 0,
    objetivosConcluidos: 0,
    avisosImportantes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = await base44.auth.me();

      if (!user.cargo) {
        window.location.href = createPageUrl("Registro");
        return;
      }

      setCurrentUser(user);

      const [atividades, pedidos, versatilidade, mensagens, objetivos, avisos] = await Promise.all([
        base44.entities.AtividadeLogistica.list(),
        base44.entities.PedidoEPI.list(),
        base44.entities.Versatilidade.list(),
        base44.entities.MensagemChat.list("-created_date", 5),
        base44.entities.Objetivo.list(),
        base44.entities.Aviso.list()
      ]);

      setStats({
        atividadesLogistica: atividades.length,
        pedidosEPI: pedidos.filter(p => p.status === "pendente").length,
        versatilidade: versatilidade.length,
        mensagens: mensagens.length,
        objetivosConcluidos: objetivos.filter(o => o.concluido).length,
        avisosImportantes: avisos.filter(a => a.prioridade === "urgente" || a.prioridade === "importante").length
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      window.location.href = createPageUrl("Registro");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0066b1] border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Carregando dashboard...</p>
        </div>
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
                <h1 className="text-3xl md:text-5xl font-bold mb-3">
                  Olá, {currentUser?.nome_exibicao || currentUser?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg md:text-xl">
                  Seu resumo de atividades está pronto
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-5 py-2 text-sm">
                  {currentUser?.cargo === 'lider' ? '🛡️ Líder' : '📋 Monitor'} • Chapa {currentUser?.chapa}
                </Badge>
                {currentUser?.equipe && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                    📍 Equipe: {currentUser.equipe}
                  </Badge>
                )}
              </div>
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
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                  <h4 className="font-bold text-[#001e50] mb-2 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Segurança em Primeiro Lugar
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Sempre verifique se todos estão usando EPIs adequados antes de iniciar qualquer atividade
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <h4 className="font-bold text-green-900 mb-2 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Acompanhe seus Objetivos
                  </h4>
                  <p className="text-xs text-green-800 leading-relaxed">
                    Mantenha seus objetivos diários atualizados para melhor produtividade
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                  <h4 className="font-bold text-purple-900 mb-2 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Versatilidade da Equipe
                  </h4>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    Atualize regularmente a matriz de habilidades dos colaboradores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}