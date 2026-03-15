import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Users, DollarSign, Plus, CheckCircle2, Clock, AlertTriangle, ShoppingCart, Truck } from "lucide-react";
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
  const [stats, setStats] = useState({ pedidosPendentes: 0, atividadesPendentes: 0, gastosMes: 0 });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [user, pedidos, atividades, tarefasData, usuarios] = await Promise.all([
      base44.auth.me(),
      base44.entities.PedidoEPI.list(),
      base44.entities.AtividadeLogistica.list(),
      base44.entities.TarefaMonitor.list("-created_date"),
      base44.entities.User.list().catch(() => [])
    ]);
    setCurrentUser(user);
    setMonitores(usuarios.filter(u => u.cargo === "monitor"));
    setTarefas(tarefasData.filter(t => t.tipo_area === "lider"));
    setStats({
      pedidosPendentes: pedidos.filter(p => p.status === "pendente").length,
      atividadesPendentes: atividades.filter(a => a.status === "pendente").length,
      gastosMes: pedidos.filter(p => p.status === "aprovado" || p.status === "entregue").reduce((s, p) => s + (p.valor_total || 0), 0),
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
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Área do Líder</h1>
            <p className="text-xs text-slate-500">Gestão e supervisão da equipe</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#0066b1] hover:bg-[#004d82] h-9 text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Nova Tarefa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "EPI Pendentes", value: stats.pedidosPendentes, icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50", url: "PedidosEPI" },
          { label: "Logística Aberta", value: stats.atividadesPendentes, icon: Truck, color: "text-blue-600", bg: "bg-blue-50", url: "Logistica" },
          { label: "Gastos do Mês", value: `R$${stats.gastosMes.toFixed(0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", url: "PedidosEPI" },
          { label: "Produtividade", value: `${produtividade}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", url: null },
        ].map(({ label, value, icon: Icon, color, bg, url }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {url ? (
              <Link to={createPageUrl(url)}>
                <Card className="border border-slate-200 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${color}`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-slate-900">{value}</div>
                      <p className="text-[10px] text-slate-500">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="border border-slate-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{value}</div>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                </CardContent>
              </Card>
            )}
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
            isLider={true}
            monitores={monitores}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0066b1]" /> Minhas Tarefas
                <Badge variant="secondary" className="ml-auto text-[10px]">{tarefas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TarefasList
                tarefas={tarefas}
                onEdit={(t) => { setEditingTarefa(t); setShowForm(true); }}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
                monitores={monitores}
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
                  <span className="text-slate-600">Taxa de conclusão</span>
                  <span className="font-bold text-purple-600">{produtividade}%</span>
                </div>
                <Progress value={produtividade} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "Concluídas", val: tarefas.filter(t => t.status === "concluida").length, color: "text-green-600" },
                  { label: "Andamento", val: tarefas.filter(t => t.status === "em_andamento").length, color: "text-blue-600" },
                  { label: "Pendentes", val: tarefas.filter(t => t.status === "pendente").length, color: "text-amber-600" },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <Card className="border border-slate-200">
            <CardHeader className="border-b bg-slate-50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Ações Prioritárias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[
                { title: `Aprovar EPIs (${stats.pedidosPendentes})`, desc: "Pedidos aguardando aprovação", url: "PedidosEPI", color: "border-amber-200 hover:bg-amber-50" },
                { title: "Gerenciar Usuários", desc: "Administrar acessos da equipe", url: "GerenciarUsuarios", color: "border-purple-200 hover:bg-purple-50" },
                { title: "Matriz de Habilidades", desc: "Acompanhar evolução da equipe", url: "Versatilidade", color: "border-green-200 hover:bg-green-50" },
              ].map(a => (
                <Link key={a.url} to={createPageUrl(a.url)}>
                  <div className={`p-3 rounded-lg border ${a.color} transition-colors cursor-pointer`}>
                    <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}