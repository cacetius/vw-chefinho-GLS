import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, DollarSign, TrendingUp, Shield } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import PedidoForm from "../components/pedidos/PedidoForm";
import PedidosList from "../components/pedidos/PedidosList";
import OrcamentosList from "../components/pedidos/OrcamentosList";
import OrcamentoForm from "../components/pedidos/OrcamentoForm";

export default function OperacoesHub() {
  const [activeTab, setActiveTab] = useState("epi");
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [showOrcForm, setShowOrcForm] = useState(false);
  const [editingOrc, setEditingOrc] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const isSupervisor = currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-epi", currentUser?.equipe],
    queryFn: async () => {
      const all = await base44.entities.PedidoEPI.list("-created_date");
      // Supervisor/admin vê tudo; demais só veem da própria equipe
      if (isSupervisor || !currentUser?.equipe) return all;
      return all.filter(p => p.equipe === currentUser.equipe);
    },
    enabled: !!currentUser
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ["orcamentos", currentUser?.equipe],
    queryFn: async () => {
      const all = await base44.entities.Orcamento.list("-mes_referencia");
      if (isSupervisor || !currentUser?.equipe) return all;
      return all.filter(o => !o.equipe || o.equipe === currentUser.equipe);
    },
    enabled: !!currentUser
  });

  const hasLeader = currentUser?.cargo === "lider" || isSupervisor;

  const createPedido = useMutation({
    mutationFn: (d) => base44.entities.PedidoEPI.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] }); setShowPedidoForm(false); setEditingPedido(null); }
  });
  const updatePedido = useMutation({
    mutationFn: ({ id, d }) => base44.entities.PedidoEPI.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] }); setShowPedidoForm(false); setEditingPedido(null); }
  });
  const deletePedido = useMutation({
    mutationFn: (id) => base44.entities.PedidoEPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedidos-epi"] })
  });
  const createOrc = useMutation({
    mutationFn: (d) => base44.entities.Orcamento.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orcamentos"] }); setShowOrcForm(false); setEditingOrc(null); }
  });
  const updateOrc = useMutation({
    mutationFn: ({ id, d }) => base44.entities.Orcamento.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orcamentos"] }); setShowOrcForm(false); setEditingOrc(null); }
  });
  const deleteOrc = useMutation({
    mutationFn: (id) => base44.entities.Orcamento.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orcamentos"] })
  });

  const orcamentosComSaldo = orcamentos.map(o => ({
    ...o,
    _utilizado: pedidos.filter(p =>
      (p.status === "aprovado" || p.status === "entregue") &&
      (!o.equipe || p.equipe === o.equipe) &&
      (o.turno === "todos" || p.turno === o.turno)
    ).reduce((s, p) => s + (p.valor_total || 0), 0)
  }));

  const totalGastos = pedidos.filter(p => p.status === "aprovado" || p.status === "entregue").reduce((s, p) => s + (p.valor_total || 0), 0);
  const totalOrc = orcamentosComSaldo.filter(o => o.status === "ativo").reduce((s, o) => s + (o.valor_total || 0), 0);
  const totalUtil = orcamentosComSaldo.filter(o => o.status === "ativo").reduce((s, o) => s + (o._utilizado || 0), 0);

  if (!currentUser) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">EPI & Orçamentos</h1>
            <p className="text-[10px] text-slate-400">
              {isSupervisor ? "Todas as equipes" : currentUser.equipe ? `Equipe: ${currentUser.equipe}` : "Pedidos & Orçamentos"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === "epi" && (
            <>
              {hasLeader && (
                <Button size="sm" variant="outline" className="h-8 text-xs border-[#0066b1] text-[#0066b1]" onClick={() => setShowOrcForm(v => !v)}>
                  <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Orçamento</span>
                </Button>
              )}
              <Button size="sm" className="h-8 bg-[#0066b1] hover:bg-[#004d82] text-xs" onClick={() => setShowPedidoForm(v => !v)}>
                <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Pedido EPI</span>
              </Button>
            </>
          )}
          {activeTab === "orcamentos" && hasLeader && (
            <Button size="sm" variant="outline" className="h-8 text-xs border-[#0066b1] text-[#0066b1]" onClick={() => setShowOrcForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Orçamento</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-2.5">
            <p className="text-[9px] text-slate-500">EPI Pendentes</p>
            <div className="text-xl font-bold text-amber-600">{pedidos.filter(p => p.status === "pendente").length}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5">
            <p className="text-[9px] text-slate-500 flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />Gastos</p>
            <div className="text-lg font-bold text-slate-900">R${totalGastos.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5">
            <p className="text-[9px] text-slate-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />Saldo</p>
            <div className="text-lg font-bold text-green-600">R${(totalOrc - totalUtil).toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <AnimatePresence>
        {showPedidoForm && (
          <PedidoForm
            pedido={editingPedido}
            currentUser={currentUser}
            orcamentosAtivos={orcamentosComSaldo}
            onSubmit={(d) => {
              const data = { ...d, solicitante_id: currentUser.id, equipe: currentUser.equipe, turno: currentUser.turno };
              editingPedido ? updatePedido.mutate({ id: editingPedido.id, d: data }) : createPedido.mutate(data);
            }}
            onCancel={() => { setShowPedidoForm(false); setEditingPedido(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOrcForm && (
          <OrcamentoForm
            orcamento={editingOrc}
            onSubmit={(d) => editingOrc ? updateOrc.mutate({ id: editingOrc.id, d }) : createOrc.mutate(d)}
            onCancel={() => { setShowOrcForm(false); setEditingOrc(null); }}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="epi" className="text-xs flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5" /> Pedidos EPI
          </TabsTrigger>
          <TabsTrigger value="orcamentos" className="text-xs">Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="epi" className="mt-3">
          <PedidosList
            pedidos={pedidos}
            onEdit={(p) => { setEditingPedido(p); setShowPedidoForm(true); }}
            onDelete={(id) => { if (window.confirm("Remover pedido?")) deletePedido.mutate(id); }}
            onUpdateStatus={(id, status, orc, obs) => {
              const p = pedidos.find(x => x.id === id);
              updatePedido.mutate({ id, d: { ...p, status, orcamento_aprovado: orc, observacoes_orcamento: obs } });
            }}
            currentUser={currentUser}
            orcamentosAtivos={orcamentosComSaldo}
          />
        </TabsContent>
        <TabsContent value="orcamentos" className="mt-3">
          <OrcamentosList
            orcamentos={orcamentosComSaldo}
            onEdit={(o) => { setEditingOrc(o); setShowOrcForm(true); }}
            onDelete={(id) => { if (window.confirm("Remover orçamento?")) deleteOrc.mutate(id); }}
            currentUser={currentUser}
            pedidos={pedidos}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}