import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, CheckCircle2, Clock, Plus, Target, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import TarefaForm from "../components/tarefas/TarefaForm";
import TarefasList from "../components/tarefas/TarefasList";
import KanbanLogistica from "../components/monitorarea/KanbanLogistica";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MonitorArea() {
  const [tarefas, setTarefas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tarefas");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const [tarefasData, objetivosData, pedidosData, atividadesData] = await Promise.all([
      base44.entities.TarefaMonitor.filter({ tipo_area: "monitor" }, "-created_date"),
      base44.entities.Objetivo.list("-created_date", 10),
      base44.entities.PedidoEPI.filter({ solicitante_id: user.id }, "-created_date", 10),
      base44.entities.AtividadeLogistica.list("-created_date"),
    ]);
    setTarefas(tarefasData.filter(t => !t.monitor_atribuido || t.monitor_atribuido === user.id));
    setObjetivos(objetivosData);
    setPedidos(pedidosData);
    setAtividades(atividadesData.filter(a => a.status !== "cancelada"));
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

  const handleUpdateAtividadeStatus = async (id, status) => {
    const atividade = atividades.find(a => a.id === id);
    await base44.entities.AtividadeLogistica.update(id, { ...atividade, status });
    setAtividades(prev => prev.map(a => a.id === id ? { ...a, status } : a));
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
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Área do Monitor</h1>
          <p className="text-[10px] text-slate-400">Atividades do dia</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-[#0066b1] hover:bg-[#004d82] h-9 text-xs px-3 flex-shrink-0">
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova Tarefa
        </Button>
      </div>

      {/* Stats — 4 colunas compactas */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Total", value: tarefas.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pendentes", value: tarefas.filter(t => t.status === "pendente").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Concluídas", value: tarefas.filter(t => t.status === "concluida").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Logística", value: atividades.length, icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center gap-1">
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <span className="text-base font-bold text-slate-900 leading-none">{value}</span>
              <span className="text-[8px] text-slate-400 text-center leading-tight">{label}</span>
            </div>
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

      {/* Tabs: Tarefas | Logística Kanban */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="tarefas" className="text-xs flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" /> Minhas Tarefas
          </TabsTrigger>
          <TabsTrigger value="logistica" className="text-xs flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Logística
          </TabsTrigger>
        </TabsList>

        {/* Aba Tarefas */}
        <TabsContent value="tarefas" className="mt-3 space-y-4">
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#0066b1]" /> Minhas Tarefas
                <Badge variant="secondary" className="ml-auto text-[10px]">{tarefas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <TarefasList
                tarefas={tarefas}
                onEdit={(t) => { setEditingTarefa(t); setShowForm(true); }}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
              />
            </CardContent>
          </Card>

          {/* Performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Tarefas concluídas</span>
                  <span className="font-bold text-purple-600">{produtividade}%</span>
                </div>
                <Progress value={produtividade} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Objetivos do dia</span>
                  <span className="font-bold text-green-600">{objetivosPercent}%</span>
                </div>
                <Progress value={objetivosPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { label: "Finalizadas",  val: tarefas.filter(t => t.status === "concluida").length,    color: "text-green-600" },
                  { label: "Em Progresso", val: tarefas.filter(t => t.status === "em_andamento").length, color: "text-blue-600" },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lembretes */}
          <div className="space-y-2">
            {[
              { emoji: "🛡️", title: "Segurança em Primeiro", desc: "Verifique EPIs antes de iniciar o turno", color: "border-yellow-200 bg-yellow-50" },
              { emoji: "📢", title: "Comunicação Clara",     desc: "Informe o líder sobre qualquer ocorrência", color: "border-blue-200 bg-blue-50" },
              { emoji: "✅", title: "Qualidade Sempre",      desc: "Priorize qualidade sobre velocidade",       color: "border-green-200 bg-green-50" },
            ].map(r => (
              <div key={r.title} className={`p-3 rounded-xl border ${r.color}`}>
                <p className="text-xs font-semibold text-slate-800">{r.emoji} {r.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            ))}
            <Link to={createPageUrl("Objetivos")}>
              <div className="p-3 rounded-xl border border-slate-200 active:bg-slate-50 flex items-center gap-2.5 touch-manipulation">
                <Target className="w-4 h-4 text-[#0066b1] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Ver Objetivos do Dia</p>
                  <p className="text-[11px] text-slate-500">{objetivosConcluidos}/{objetivos.length} concluídos</p>
                </div>
              </div>
            </Link>
          </div>
        </TabsContent>

        {/* Aba Kanban Logística */}
        <TabsContent value="logistica" className="mt-3">
          <KanbanLogistica
            atividades={atividades}
            onUpdateStatus={handleUpdateAtividadeStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}