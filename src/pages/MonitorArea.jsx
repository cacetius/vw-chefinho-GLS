import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle, Clock, Plus, TrendingUp, AlertTriangle, Target, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import TarefaForm from "../components/tarefas/TarefaForm";
import TarefasList from "../components/tarefas/TarefasList";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MonitorArea() {
  const [tarefas, setTarefas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadData();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadData = async () => {
    const user = await base44.auth.me();
    
    const [tarefasData, objetivosData, atividadesData, pedidosData] = await Promise.all([
      base44.entities.TarefaMonitor.filter({ tipo_area: "monitor" }, "-created_date"),
      base44.entities.Objetivo.list("-created_date", 10),
      base44.entities.AtividadeLogistica.list("-created_date", 10),
      base44.entities.PedidoEPI.filter({ solicitante_id: user.id }, "-created_date", 10)
    ]);
    
    setTarefas(tarefasData.filter(t => !t.monitor_atribuido || t.monitor_atribuido === user.id));
    setObjetivos(objetivosData);
    setAtividades(atividadesData);
    setPedidos(pedidosData);
    setLoading(false);
  };

  const handleSubmit = async (tarefaData) => {
    if (editingTarefa) {
      await base44.entities.TarefaMonitor.update(editingTarefa.id, tarefaData);
    } else {
      await base44.entities.TarefaMonitor.create({ ...tarefaData, tipo_area: "monitor" });
    }
    setShowForm(false);
    setEditingTarefa(null);
    loadData();
  };

  const handleEdit = (tarefa) => {
    setEditingTarefa(tarefa);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.TarefaMonitor.delete(id);
    loadData();
  };

  const handleUpdateStatus = async (id, status) => {
    const tarefa = tarefas.find(t => t.id === id);
    await base44.entities.TarefaMonitor.update(id, { ...tarefa, status });
    loadData();
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
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              Área do Monitor
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Central de controle e acompanhamento das suas atividades</p>
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
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total de Tarefas</p>
                    <p className="text-4xl font-bold">{tarefas.length}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <ClipboardList className="w-8 h-8" />
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
            <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-500 to-amber-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-1">Pendentes</p>
                    <p className="text-4xl font-bold">{tarefas.filter(t => t.status === "pendente").length}</p>
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
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Concluídas</p>
                    <p className="text-4xl font-bold">{tarefas.filter(t => t.status === "concluida").length}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-8 h-8" />
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
                    <p className="text-purple-100 text-sm font-medium mb-1">Produtividade</p>
                    <p className="text-4xl font-bold">{calcularProdutividade()}%</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8" />
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
                  <ClipboardList className="w-6 h-6 text-[#0066b1]" />
                  Minhas Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <TarefasList
                  tarefas={tarefas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
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
                  Performance Semanal
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

            {/* Quick Actions */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Checklist Diário
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Verificar EPIs da equipe</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Conferir atividades de logística</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Atualizar versatilidade</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#0066b1] rounded" />
                    <span className="text-sm font-medium text-gray-700">Revisar pedidos pendentes</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Important Reminders */}
            <Card className="shadow-xl border-0 border-l-4 border-l-yellow-500">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
                <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Lembretes Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-yellow-900 text-sm mb-1">🛡️ Segurança em Primeiro Lugar</p>
                    <p className="text-xs text-yellow-800">
                      Sempre verifique se todos estão usando EPIs adequados
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-[#0066b1] text-sm mb-1">📢 Comunicação Clara</p>
                    <p className="text-xs text-blue-700">
                      Mantenha o líder informado sobre qualquer situação
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 text-sm mb-1">✅ Qualidade Sempre</p>
                    <p className="text-xs text-green-800">
                      Priorize qualidade sobre velocidade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}