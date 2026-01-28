import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, Receipt, Sparkles } from "lucide-react";
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

  const totalOrcamento = orcamentos
    .filter(o => o.status === "ativo")
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const totalUtilizado = orcamentos
    .filter(o => o.status === "ativo")
    .reduce((sum, o) => sum + (o.valor_utilizado || 0), 0);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos de EPI & Gestão de Gastos</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.equipe && `Equipe: ${currentUser.equipe}`}
              {currentUser?.turno && ` • Turno: ${currentUser.turno}`}
            </p>
          </div>
          <div className="flex gap-3">
            {hasLeaderAccess && (
              <Button 
                onClick={() => setShowOrcamentoForm(!showOrcamentoForm)}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Receipt className="w-5 h-5 mr-2" />
                Novo Orçamento
              </Button>
            )}
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Pedido
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pedidos.length}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {pedidos.filter(p => p.status === "pendente").length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Gastos Aprovados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                R$ {totalGastos.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Orçamento Disponível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                R$ {(totalOrcamento - totalUtilizado).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                De R$ {totalOrcamento.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <PedidoForm
              pedido={editingPedido}
              onSubmit={handleSubmit}
              currentUser={currentUser}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-96 grid-cols-3">
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
    </div>
  );
}