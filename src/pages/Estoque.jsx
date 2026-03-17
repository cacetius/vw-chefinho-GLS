import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, TrendingUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";
import EstoqueForm from "../components/estoque/EstoqueForm";
import EstoqueList from "../components/estoque/EstoqueList";
import EstoqueChart from "../components/estoque/EstoqueChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Estoque() {
  const [itens, setItens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    baixoEstoque: 0,
    valorTotal: 0
  });

  useEffect(() => {
    loadUser();
    loadEstoque();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadEstoque = async () => {
    const data = await base44.entities.EstoqueEPI.list();
    setItens(data);
    
    const baixo = data.filter(item => item.quantidade_atual <= item.quantidade_minima).length;
    const valor = data.reduce((sum, item) => sum + (item.quantidade_atual * (item.preco_atual || 0)), 0);
    
    setStats({
      total: data.length,
      baixoEstoque: baixo,
      valorTotal: valor
    });
  };

  const handleSubmit = async (itemData) => {
    if (editingItem) {
      // Atualizar histórico de preços se o preço mudou
      if (itemData.preco_atual !== editingItem.preco_atual) {
        const historicoPrecos = editingItem.historico_precos || [];
        historicoPrecos.push({
          data: new Date().toISOString().split('T')[0],
          preco: itemData.preco_atual,
          fornecedor: itemData.fornecedor
        });
        itemData.historico_precos = historicoPrecos;
      }
      
      await base44.entities.EstoqueEPI.update(editingItem.id, itemData);
    } else {
      await base44.entities.EstoqueEPI.create({
        ...itemData,
        historico_precos: [{
          data: new Date().toISOString().split('T')[0],
          preco: itemData.preco_atual,
          fornecedor: itemData.fornecedor
        }]
      });
    }
    setShowForm(false);
    setEditingItem(null);
    loadEstoque();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.EstoqueEPI.delete(id);
    loadEstoque();
  };

  const handleMovimentar = async (item, mov) => {
    const novaQtd = mov.tipo === "entrada"
      ? (item.quantidade_atual || 0) + mov.quantidade
      : Math.max(0, (item.quantidade_atual || 0) - mov.quantidade);
    await base44.entities.EstoqueEPI.update(item.id, { quantidade_atual: novaQtd });
    loadEstoque();
  };

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Estoque de EPIs</h1>
              <p className="text-[10px] text-slate-400">Entradas, saídas e alertas de reposição</p>
            </div>
          </div>
          {hasLeaderAccess && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}
              className="h-9 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-xs">Novo Item</span>
            </Button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border border-slate-200">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500">Itens</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className={`border ${stats.baixoEstoque > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500">Críticos</p>
              <p className={`text-2xl font-bold ${stats.baixoEstoque > 0 ? "text-red-600" : "text-slate-400"}`}>{stats.baixoEstoque}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500">Valor</p>
              <p className="text-sm font-bold text-[#0066b1]">R${stats.valorTotal.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <EstoqueForm
              item={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          )}
        </AnimatePresence>

        <Tabs defaultValue="lista" className="space-y-6">
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger value="lista">Lista de Itens</TabsTrigger>
            <TabsTrigger value="analise">Análise de Preços</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <EstoqueList
              itens={itens}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMovimentar={handleMovimentar}
              hasLeaderAccess={hasLeaderAccess}
            />
          </TabsContent>

          <TabsContent value="analise">
            <EstoqueChart itens={itens} />
          </TabsContent>
        </Tabs>
    </div>
  );
}