import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import CarroForm from "../components/linha/CarroForm";
import LinhaVisual from "../components/linha/LinhaVisual";
import CarrosList from "../components/linha/CarrosList";
import LinhaStats from "../components/linha/LinhaStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LinhaProducao() {
  const [carros, setCarros] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCarro, setEditingCarro] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visual");

  useEffect(() => {
    loadUser();
    loadCarros();
    
    // Atualiza a cada 5 segundos (tempo real)
    const interval = setInterval(loadCarros, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadCarros = async () => {
    const data = await base44.entities.CarroLinha.list("posicao_linha");
    setCarros(data);
    setLoading(false);
  };

  const handleSubmit = async (carroData) => {
    if (editingCarro) {
      await base44.entities.CarroLinha.update(editingCarro.id, carroData);
    } else {
      await base44.entities.CarroLinha.create({
        ...carroData,
        tempo_entrada: new Date().toISOString(),
        operador_id: currentUser.id,
        operador_responsavel: currentUser.nome_exibicao || currentUser.full_name
      });
    }
    setShowForm(false);
    setEditingCarro(null);
    loadCarros();
  };

  const handleEdit = (carro) => {
    setEditingCarro(carro);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover este carro da linha?")) return;
    await base44.entities.CarroLinha.delete(id);
    loadCarros();
  };

  const carrosComErro = carros.filter(c => c.status === "erro").length;
  const carrosEmProcesso = carros.filter(c => c.status === "em_processo").length;
  const carrosConcluidos = carros.filter(c => c.status === "concluido").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066b1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl"
              >
                <Car className="w-8 h-8 text-white" />
              </motion.div>
              Linha de Produção
            </h1>
            <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Monitoramento em tempo real
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all px-6 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Carro
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Na Linha</p>
                    <p className="text-4xl font-bold">{carros.length}</p>
                  </div>
                  <Car className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium mb-1">Em Processo</p>
                    <p className="text-4xl font-bold">{carrosEmProcesso}</p>
                  </div>
                  <Clock className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Com Erro</p>
                    <p className="text-4xl font-bold">{carrosComErro}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Concluídos</p>
                    <p className="text-4xl font-bold">{carrosConcluidos}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <CarroForm
              carro={editingCarro}
              onSubmit={handleSubmit}
              currentUser={currentUser}
              onCancel={() => {
                setShowForm(false);
                setEditingCarro(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Card className="shadow-2xl border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <TabsList className="grid w-full md:w-[600px] grid-cols-3">
                <TabsTrigger value="visual">Visualização da Linha</TabsTrigger>
                <TabsTrigger value="lista">Lista Detalhada</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="visual" className="mt-0">
                <LinhaVisual carros={carros} onEdit={handleEdit} />
              </TabsContent>

              <TabsContent value="lista" className="mt-0">
                <CarrosList 
                  carros={carros} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  currentUser={currentUser}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <LinhaStats carros={carros} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}