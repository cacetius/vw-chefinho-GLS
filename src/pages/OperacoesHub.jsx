import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useEquipeFilter } from "@/lib/useEquipeFilter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Shield } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import PedidoForm from "../components/pedidos/PedidoForm";
import PedidosList from "../components/pedidos/PedidosList";

export default function OperacoesHub() {
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const { isSupervisor, filtrar } = useEquipeFilter(currentUser);

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-epi", currentUser?.equipe],
    queryFn: async () => filtrar(await base44.entities.PedidoEPI.list("-created_date")),
    enabled: !!currentUser
  });

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

  if (!currentUser) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  const pendentes = pedidos.filter(p => p.status === "pendente").length;
  const aprovados = pedidos.filter(p => p.status === "aprovado" || p.status === "entregue").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">EPI</h1>
            <p className="text-[10px] text-slate-400">
              {isSupervisor ? "Todas as equipes" : currentUser.equipe ? `Equipe: ${currentUser.equipe}` : "Pedidos de EPI"}
            </p>
          </div>
        </div>
        <Button size="sm" className="h-8 bg-[#0066b1] hover:bg-[#004d82] text-xs" onClick={() => setShowPedidoForm(v => !v)}>
          <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Pedido EPI</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-2.5">
            <p className="text-[9px] text-slate-500">Pendentes</p>
            <div className="text-xl font-bold text-amber-600">{pendentes}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5">
            <p className="text-[9px] text-slate-500">Aprovados/Entregues</p>
            <div className="text-xl font-bold text-green-600">{aprovados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showPedidoForm && (
          <PedidoForm
            pedido={editingPedido}
            currentUser={currentUser}
            onSubmit={(d) => {
              const data = { ...d, solicitante_id: currentUser.id, equipe: currentUser.equipe, turno: currentUser.turno };
              editingPedido ? updatePedido.mutate({ id: editingPedido.id, d: data }) : createPedido.mutate(data);
            }}
            onCancel={() => { setShowPedidoForm(false); setEditingPedido(null); }}
          />
        )}
      </AnimatePresence>

      {/* List */}
      <PedidosList
        pedidos={pedidos}
        onEdit={(p) => { setEditingPedido(p); setShowPedidoForm(true); }}
        onDelete={(id) => { if (window.confirm("Remover pedido?")) deletePedido.mutate(id); }}
        onUpdateStatus={(id, status) => {
          const p = pedidos.find(x => x.id === id);
          updatePedido.mutate({ id, d: { ...p, status } });
        }}
        currentUser={currentUser}
      />
    </div>
  );
}