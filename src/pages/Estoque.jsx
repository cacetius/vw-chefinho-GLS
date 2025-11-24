import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
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

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              Gestão de Estoque de EPIs
            </h1>
            <p className="text-gray-600 mt-1">Controle de estoque e histórico de preços</p>
          </div>
          {hasLeaderAccess && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Item
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total de Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.baixoEstoque}</div>
              <p className="text-xs text-gray-500 mt-1">Necessitam reposição</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {stats.valorTotal.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Em estoque</p>
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
              hasLeaderAccess={hasLeaderAccess}
            />
          </TabsContent>

          <TabsContent value="analise">
            <EstoqueChart itens={itens} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}