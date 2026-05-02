import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingUp, Users, DollarSign, Plus, AlertTriangle, ShoppingCart, Truck, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import TarefaForm from "../components/tarefas/TarefaForm";
import TarefasList from "../components/tarefas/TarefasList";
import DashboardEquipe from "../components/lider/DashboardEquipe";
import ResumoSemanalPDF from "../components/lider/ResumoSemanalPDF";
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
  const [activeTab, setActiveTab] = useState("tarefas");
  const [stats, setStats] = useState({ pedidosPendentes: 0, atividadesPendentes: 0, gastosMes: 0 });
  const [allData, setAllData] = useState({ pedidos: [], atividades: [], versatilidades: [] });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [user, pedidos, atividades, tarefasData, usuarios, versatilidades] = await Promise.all([
      base44.auth.me(),
      base44.entities.PedidoEPI.list(),
      base44.entities.AtividadeLogistica.list(),
      base44.entities.TarefaMonitor.list("-created_date"),
      base44.entities.User.list().catch(() => []),
      base44.entities.Versatilidade.list(),
    ]);
    setCurrentUser(user);
    setMonitores(usuarios.filter(u => u.cargo === "monitor"));
    setTarefas(tarefasData.filter(t => t.tipo_area === "lider"));
    setAllData({ pedidos, atividades, versatilidades });
    setStats({
      pedidosPendentes: pedidos.filter(p => p.status === "pendente").length,
      atividadesPendentes: atividades.filter(a => a.status === "pendente").length,
      gastosMes: pedidos.filter(p => p.status === "aprovado" || p.status === "entregue")
        .reduce((s, p) => s + (p.valor_total || 0), 0),
    });
    setLoading(false);
  };

  const handleSubmit = async (tarefaData) => {
    if (editingTarefa) await base44.entities.TarefaMonitor.update(editingTarefa.id, tarefaData);
    else await base44.entities.TarefaMonitor.create({ ...tarefaData, tipo_area: "lider" });
    setShowForm(false); setEditingTarefa(null);
    const data = await base44.entities.TarefaMonitor.list("-created_date");
    setTarefas(data.filter(t => t.tipo_area === "lider"));
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Área do Líder</h1>
            <p className="text-[10px] text-slate-400">Gestão e supervisão da equipe</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ResumoSemanalPDF currentUser={currentUser} />
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-[#0066b1] hover:bg-[#004d82] h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "EPI Pendentes", value: stats.pedidosPendentes, icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50", url: "OperacoesHub" },
          { label: "Logística Aberta", value: stats.atividadesPendentes, icon: Truck, color: "text-blue-600", bg: "bg-blue-50", url: "Logistica" },
          { label: "Gastos do Mês", value: `R$${stats.gastosMes.toFixed(0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", url: "OperacoesHub" },
          { label: "Produtividade", value: `${produtividade}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", url: null },
        ].map(({ label, value, icon: Icon, color, bg, url }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {url ? (
              <Link to={createPageUrl(url)}>
                <Card className="border border-slate-200 active:opacity-80 transition-all cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-slate-900 leading-tight">{value}</div>
                      <p className="text-[9px] text-slate-500 truncate">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="border border-slate-200">
                <CardContent className="p-3 flex items-center gap-2.5">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-slate-900 leading-tight">{value}</div>
                    <p className="text-[9px] text-slate-500 truncate">{label}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress produtividade */}
      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Produtividade tarefas</span>
          <span className="font-bold text-[#0066b1]">{produtividade}%</span>
        </div>
        <Progress value={produtividade} className="h-2" />
        <div className="grid grid-cols-3 gap-2 mt-2.5">
          {[
            { label: "Concluídas", val: tarefas.filter(t => t.status === "concluida").length, color: "text-green-600" },
            { label: "Andamento",  val: tarefas.filter(t => t.status === "em_andamento").length, color: "text-blue-600" },
            { label: "Pendentes",  val: tarefas.filter(t => t.status === "pendente").length, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="text-center p-1.5 bg-slate-50 rounded-lg">
              <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[9px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <TarefaForm
            tarefa={editingTarefa}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingTarefa(null); }}
            isLider={true}
            monitores={monitores}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="tarefas" className="text-xs flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Tarefas
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="acoes" className="text-xs flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Ações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tarefas" className="mt-3">
          <TarefasList
            tarefas={tarefas}
            onEdit={(t) => { setEditingTarefa(t); setShowForm(true); }}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            monitores={monitores}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-3">
          <DashboardEquipe
            tarefas={tarefas}
            pedidos={allData.pedidos}
            atividades={allData.atividades}
            versatilidades={allData.versatilidades}
          />
        </TabsContent>

        <TabsContent value="acoes" className="mt-3">
          <div className="space-y-2">
            {[
              { title: `Aprovar EPIs (${stats.pedidosPendentes})`, desc: "Pedidos aguardando aprovação", url: "OperacoesHub", color: "border-amber-200 bg-amber-50" },
              { title: "Gerenciar Usuários", desc: "Administrar acessos da equipe", url: "GerenciarUsuarios", color: "border-purple-200 bg-purple-50" },
              { title: "Matriz de Habilidades", desc: "Acompanhar evolução da equipe", url: "PessoasHub", color: "border-green-200 bg-green-50" },
              { title: "Auditorias VDA", desc: "Planos de ação e conformidade", url: "AuditoriaVDA", color: "border-blue-200 bg-blue-50" },
            ].map(a => (
              <Link key={a.url} to={createPageUrl(a.url)}>
                <div className={`p-3.5 rounded-xl border ${a.color} active:opacity-70 transition-all touch-manipulation`}>
                  <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}