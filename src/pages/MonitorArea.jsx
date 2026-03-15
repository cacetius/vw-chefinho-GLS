import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, Clock, Plus, TrendingUp, AlertTriangle, ShoppingCart, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import TarefaForm from "../components/tarefas/TarefaForm";
import TarefasList from "../components/tarefas/TarefasList";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MonitorArea() {
  const [tarefas, setTarefas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const [tarefasData, objetivosData, pedidosData] = await Promise.all([
      base44.entities.TarefaMonitor.filter({ tipo_area: "monitor" }, "-created_date"),
      base44.entities.Objetivo.list("-created_date", 10),
      base44.entities.PedidoEPI.filter({ solicitante_id: user.id }, "-created_date", 10)
    ]);
    setTarefas(tarefasData.filter(t => !t.monitor_atribuido || t.monitor_atribuido === user.id));
    setObjetivos(objetivosData);
    setPedidos(pedidosData);
    setLoading(false);
  };

  const handleSubmit = async (tarefaData) => {
    if (editingTarefa) await base44.entities.TarefaMonitor.update(editingTarefa.id, tarefaData);
    else await base44.entities.TarefaMonitor.create({ ...tarefaData, tipo_area: "monitor" });
    setShowForm(false); setEditingTarefa(null);
    const data = await base44.entities.TarefaMonitor.filter({ tipo_area: "monitor" }, "-created_date");
    setTarefas(data.filter(t => !t.monitor_atribuido || t.monitor_atribuido === currentUser.id));
  };

  const handleDelete = async (id) => {
    await base44.entities.TarefaMonitor.delete(id);
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateStatus = async (id, status) => {
    const tarefa = tarefas.find(t => t.id === id);
    await base44.entities.TarefaMonitor.update(id, { ...tarefa, status });
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const produtividade = tarefas.length > 0
    ? Math.round((tarefas.filter(t => t.status === "concluida").length / tarefas.length) * 100)
    : 0;

  const objetivosConcluidos = objetivos.filter(o => o.concluido).length;
  const objetivosPercent = objetivos.length > 0 ? Math.round((objetivosConcluidos / objetivos.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Área do Monitor</h1>
            <p className="text-xs text-slate-500">Acompanhe suas atividades do dia</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#0066b1] hover:bg-[#004d82] h-9 text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Nova Tarefa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tarefas", value: tarefas.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pendentes", value: tarefas.filter(t => t.status === "pendente").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Concluídas", value: tarefas.filter(t => t.status === "concluida").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Meus Pedidos", value: pedidos.length, icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{value}</div>
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <TarefaForm
            tarefa={editingTarefa}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingTarefa(null); }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#0066b1]" /> Minhas Tarefas
                <Badge variant="secondary" className="ml-auto text-[10px]">{tarefas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TarefasList
                tarefas={tarefas}
                onEdit={(t) => { setEditingTarefa(t); setShowForm(true); }}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Produtividade */}
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" /> Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Tarefas concluídas</span>
                  <span className="font-bold text-purple-600">{produtividade}%</span>
                </div>
                <Progress value={produtividade} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Objetivos do dia</span>
                  <span className="font-bold text-green-600">{objetivosPercent}%</span>
                </div>
                <Progress value={objetivosPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { label: "Finalizadas", val: tarefas.filter(t => t.status === "concluida").length, color: "text-green-600" },
                  { label: "Em Progresso", val: tarefas.filter(t => t.status === "em_andamento").length, color: "text-blue-600" },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checklist + Lembretes */}
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Lembretes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[
                { emoji: "🛡️", title: "Segurança em Primeiro", desc: "Verifique EPIs antes de iniciar o turno", color: "border-yellow-200 bg-yellow-50" },
                { emoji: "📢", title: "Comunicação Clara", desc: "Informe o líder sobre qualquer ocorrência", color: "border-blue-200 bg-blue-50" },
                { emoji: "✅", title: "Qualidade Sempre", desc: "Priorize qualidade sobre velocidade", color: "border-green-200 bg-green-50" },
              ].map(r => (
                <div key={r.title} className={`p-3 rounded-lg border ${r.color}`}>
                  <p className="text-xs font-semibold text-slate-800">{r.emoji} {r.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{r.desc}</p>
                </div>
              ))}

              <Link to={createPageUrl("Objetivos")}>
                <div className="mt-1 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer">
                  <Target className="w-4 h-4 text-[#0066b1]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Ver Objetivos do Dia</p>
                    <p className="text-[11px] text-slate-500">{objetivosConcluidos}/{objetivos.length} concluídos</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}