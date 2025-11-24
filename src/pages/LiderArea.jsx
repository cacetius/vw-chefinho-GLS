import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Users, DollarSign, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import TarefaForm from "../components/tarefas/TarefaForm";
import TarefasList from "../components/tarefas/TarefasList";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

export default function LiderArea() {
  const [tarefas, setTarefas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [monitores, setMonitores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pedidosPendentes: 0,
    atividadesPendentes: 0,
    gastosMes: 0,
    totalUsuarios: 0
  });

  useEffect(() => {
    loadUser();
    loadStats();
    loadTarefas();
    loadMonitores();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadStats = async () => {
    const pedidos = await base44.entities.PedidoEPI.list();
    const atividades = await base44.entities.AtividadeLogistica.list();
    
    const gastos = pedidos
      .filter(p => p.status === "aprovado" || p.status === "entregue")
      .reduce((sum, p) => sum + (p.valor_total || 0), 0);

    setStats({
      pedidosPendentes: pedidos.filter(p => p.status === "pendente").length,
      atividadesPendentes: atividades.filter(a => a.status === "pendente").length,
      gastosMes: gastos,
      totalUsuarios: 0
    });
    setLoading(false);
  };

  const loadMonitores = async () => {
    try {
      const usuarios = await base44.entities.User.list();
      setMonitores(usuarios.filter(u => u.cargo === "monitor"));
    } catch (error) {
      console.log("Não foi possível carregar lista de monitores");
      setMonitores([]);
    }
  };

  const loadTarefas = async () => {
    const data = await base44.entities.TarefaMonitor.list("-created_date");
    setTarefas(data.filter(t => t.tipo_area === "lider"));
  };

  const handleSubmit = async (tarefaData) => {
    if (editingTarefa) {
      await base44.entities.TarefaMonitor.update(editingTarefa.id, tarefaData);
    } else {
      await base44.entities.TarefaMonitor.create({ ...tarefaData, tipo_area: "lider" });
    }
    setShowForm(false);
    setEditingTarefa(null);
    loadTarefas();
  };

  const handleEdit = (tarefa) => {
    setEditingTarefa(tarefa);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.TarefaMonitor.delete(id);
    loadTarefas();
  };

  const handleUpdateStatus = async (id, status) => {
    const tarefa = tarefas.find(t => t.id === id);
    await base44.entities.TarefaMonitor.update(id, { ...tarefa, status });
    loadTarefas();
  };

  const calcularProdutividade = () => {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === "concluida").length;
    return total > 0 ? Math.round((concluidas / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066b1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              Área do Líder
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Central de gestão e supervisão da equipe</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-[#001e50] to-[#0066b1] hover:from-[#001e50] hover:to-[#004d82] shadow-lg hover:shadow-xl transition-all text-white px-6 py-6 text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-500 to-amber-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-1">Pedidos Pendentes</p>
                    <p className="text-4xl font-bold">{stats.pedidosPendentes}</p>
                    <p className="text-xs text-yellow-100 mt-1">Aguardando aprovação</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Atividades Pendentes</p>
                    <p className="text-4xl font-bold">{stats.atividadesPendentes}</p>
                    <p className="text-xs text-blue-100 mt-1">Logística</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Gastos do Mês</p>
                    <p className="text-4xl font-bold">R$ {stats.gastosMes.toFixed(0)}</p>
                    <p className="text-xs text-green-100 mt-1">Total aprovado</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Tarefas do Líder</p>
                    <p className="text-4xl font-bold">{tarefas.length}</p>
                    <p className="text-xs text-purple-100 mt-1">
                      {tarefas.filter(t => t.status === "pendente").length} pendentes
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <TarefaForm
              tarefa={editingTarefa}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTarefa(null);
              }}
              isLider={true}
              monitores={monitores}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks List - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#0066b1]" />
                  Minhas Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <TarefasList
                  tarefas={tarefas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  monitores={monitores}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Productivity Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Performance da Liderança
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                      <span className="text-sm font-bold text-purple-600">{calcularProdutividade()}%</span>
                    </div>
                    <Progress value={calcularProdutividade()} className="h-3" />
                  </div>
                  <div className="pt-4 border-t grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-2xl font-bold text-green-600">
                        {tarefas.filter(t => t.status === "concluida").length}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Finalizadas</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-2xl font-bold text-blue-600">
                        {tarefas.filter(t => t.status === "em_andamento").length}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Em Progresso</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Responsabilidades do Líder
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Aprovar pedidos de EPI</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Supervisionar logística</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Gerenciar versatilidade</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Controlar gastos</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Acompanhar monitores</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-xl border-0 border-l-4 border-l-yellow-500">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
                <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Ações Prioritárias
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Link to={createPageUrl("PedidosEPI")}>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-md transition-all cursor-pointer">
                      <h4 className="font-semibold text-[#001e50] mb-2 text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        Aprovar Pedidos ({stats.pedidosPendentes})
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Revisar e aprovar solicitações pendentes
                      </p>
                    </div>
                  </Link>
                  
                  <Link to={createPageUrl("GerenciarUsuarios")}>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-all cursor-pointer">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        Gerenciar Usuários
                      </h4>
                      <p className="text-xs text-purple-800 leading-relaxed">
                        Administrar acessos e permissões
                      </p>
                    </div>
                  </Link>

                  <Link to={createPageUrl("Versatilidade")}>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all cursor-pointer">
                      <h4 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Matriz de Habilidades
                      </h4>
                      <p className="text-xs text-green-800 leading-relaxed">
                        Acompanhar evolução da equipe
                      </p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}