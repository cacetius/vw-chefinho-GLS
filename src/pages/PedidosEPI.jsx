import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, Receipt, Sparkles, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PedidoForm from "../components/pedidos/PedidoForm";
import PedidosList from "../components/pedidos/PedidosList";
import GastosChart from "../components/pedidos/GastosChart";
import OrcamentosList from "../components/pedidos/OrcamentosList";
import OrcamentoForm from "../components/pedidos/OrcamentoForm";

export default function PedidosEPI() {
  const [showForm, setShowForm] = useState(false);
  const [showOrcamentoForm, setShowOrcamentoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [editingOrcamento, setEditingOrcamento] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pedidos");
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ["pedidos-epi", currentUser?.id],
    queryFn: async () => {
      let data = await base44.entities.PedidoEPI.list("-created_date");
      
      if (currentUser?.cargo === "monitor" && (currentUser.equipe || currentUser.turno)) {
        data = data.filter(p => {
          const equipMatch = !currentUser.equipe || p.equipe === currentUser.equipe;
          const turnoMatch = !currentUser.turno || p.turno === currentUser.turno;
          return equipMatch && turnoMatch;
        });
      }
      
      return data;
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ["orcamentos", currentUser?.id],
    queryFn: async () => {
      let data = await base44.entities.Orcamento.list("-mes_referencia");
      
      if (currentUser?.cargo === "monitor" && (currentUser.equipe || currentUser.turno)) {
        data = data.filter(o => {
          const equipMatch = !currentUser.equipe || o.equipe === currentUser.equipe;
          const turnoMatch = !currentUser.turno || o.turno === currentUser.turno || o.turno === "todos";
          return equipMatch && turnoMatch;
        });
      }
      
      return data;
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  const createPedidoMutation = useMutation({
    mutationFn: (data) => base44.entities.PedidoEPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] });
      setShowForm(false);
      setEditingPedido(null);
    }
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PedidoEPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] });
      setShowForm(false);
      setEditingPedido(null);
    }
  });

  const deletePedidoMutation = useMutation({
    mutationFn: (id) => base44.entities.PedidoEPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] })
  });

  const createOrcamentoMutation = useMutation({
    mutationFn: (data) => base44.entities.Orcamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      setShowOrcamentoForm(false);
      setEditingOrcamento(null);
    }
  });

  const updateOrcamentoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Orcamento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      setShowOrcamentoForm(false);
      setEditingOrcamento(null);
    }
  });

  const deleteOrcamentoMutation = useMutation({
    mutationFn: (id) => base44.entities.Orcamento.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orcamentos"] })
  });

  const handleSubmit = (pedidoData) => {
    const pedidoComEquipe = {
      ...pedidoData,
      solicitante_id: currentUser.id,
      equipe: currentUser.equipe,
      turno: currentUser.turno
    };

    if (editingPedido) {
      updatePedidoMutation.mutate({ id: editingPedido.id, data: pedidoComEquipe });
    } else {
      createPedidoMutation.mutate(pedidoComEquipe);
    }
  };

  const handleOrcamentoSubmit = (orcamentoData) => {
    if (editingOrcamento) {
      updateOrcamentoMutation.mutate({ id: editingOrcamento.id, data: orcamentoData });
    } else {
      createOrcamentoMutation.mutate(orcamentoData);
    }
  };

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      deletePedidoMutation.mutate(id);
    }
  };

  const handleUpdateStatus = (id, status, orcamentoAprovado = null, observacoes = null) => {
    const pedido = pedidos.find(p => p.id === id);
    const updateData = { ...pedido, status };
    
    if (orcamentoAprovado !== null) {
      updateData.orcamento_aprovado = orcamentoAprovado;
    }
    if (observacoes !== null) {
      updateData.observacoes_orcamento = observacoes;
    }
    
    updatePedidoMutation.mutate({ id, data: updateData });
  };

  const handleOrcamentoEdit = (orcamento) => {
    setEditingOrcamento(orcamento);
    setShowOrcamentoForm(true);
  };

  const handleOrcamentoDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteOrcamentoMutation.mutate(id);
    }
  };

  const totalGastos = pedidos
    .filter(p => p.status === "aprovado" || p.status === "entregue")
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  // Calcula saldo real de cada orçamento baseado nos pedidos aprovados/entregues
  const orcamentosComSaldo = orcamentos.map(o => {
    const utilizado = pedidos
      .filter(p => (p.status === "aprovado" || p.status === "entregue") &&
        (!o.equipe || p.equipe === o.equipe) && (o.turno === "todos" || p.turno === o.turno))
      .reduce((s, p) => s + (p.valor_total || 0), 0);
    return { ...o, _utilizado: utilizado };
  });

  const totalOrcamento = orcamentosComSaldo
    .filter(o => o.status === "ativo")
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const totalUtilizado = orcamentosComSaldo
    .filter(o => o.status === "ativo")
    .reduce((sum, o) => sum + (o._utilizado || 0), 0);

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  if (loadingPedidos || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-green-500 to-emerald-600" style={{ borderTopColor: 'transparent' }}></div>
            <div className="absolute top-2 left-2 rounded-full h-16 w-16 bg-white"></div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
            <p className="text-gray-700 font-semibold text-lg">Carregando pedidos...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Pedidos EPI</h1>
            <p className="text-xs text-slate-400">{[currentUser?.equipe, currentUser?.turno].filter(Boolean).join(' • ')}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {hasLeaderAccess && (
            <Button variant="outline" size="sm" className="h-9 border-[#0066b1] text-[#0066b1] hover:bg-blue-50"
              onClick={() => setShowOrcamentoForm(!showOrcamentoForm)}>
              <Receipt className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-xs">Orçamento</span>
            </Button>
          )}
          <Button size="sm" className="h-9 bg-[#0066b1] hover:bg-[#004d82]" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-xs">Novo Pedido</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-slate-500">Total</p>
            <div className="text-2xl font-bold text-slate-900">{pedidos.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-slate-500">Pendentes</p>
            <div className="text-2xl font-bold text-amber-600">{pedidos.filter(p => p.status === "pendente").length}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-slate-500 flex items-center gap-1"><DollarSign className="w-3 h-3" />Gastos</p>
            <div className="text-xl font-bold text-slate-900">R${totalGastos.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Disponível</p>
            <div className="text-xl font-bold text-purple-600">R${(totalOrcamento - totalUtilizado).toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

        <AnimatePresence>
          {showForm && (
            <PedidoForm
              pedido={editingPedido}
              onSubmit={handleSubmit}
              currentUser={currentUser}
              orcamentosAtivos={orcamentosComSaldo}
              onCancel={() => {
                setShowForm(false);
                setEditingPedido(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOrcamentoForm && (
            <OrcamentoForm
              orcamento={editingOrcamento}
              onSubmit={handleOrcamentoSubmit}
              onCancel={() => {
                setShowOrcamentoForm(false);
                setEditingOrcamento(null);
              }}
            />
          )}
        </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="graficos">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <PedidosList
              pedidos={pedidos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="orcamentos">
            <OrcamentosList
              orcamentos={orcamentos}
              onEdit={handleOrcamentoEdit}
              onDelete={handleOrcamentoDelete}
              currentUser={currentUser}
              pedidos={pedidos}
            />
          </TabsContent>

          <TabsContent value="graficos">
            <div className="grid lg:grid-cols-2 gap-6">
              <GastosChart pedidos={pedidos} />
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-purple-600" />
                    Utilização de Orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {orcamentos.filter(o => o.status === "ativo").map((orc) => {
                      const percentUsed = ((orc.valor_utilizado || 0) / orc.valor_total) * 100;
                      return (
                        <div key={orc.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{orc.titulo}</span>
                            <span className="text-gray-600">
                              {percentUsed.toFixed(0)}% usado
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                percentUsed > 90 ? 'bg-red-500' : 
                                percentUsed > 70 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>R$ {orc.valor_utilizado?.toFixed(2) || '0.00'}</span>
                            <span>R$ {orc.valor_total.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                    {orcamentos.filter(o => o.status === "ativo").length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum orçamento ativo
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
      </Tabs>
    </div>
  );
}