import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, AlertTriangle, CheckCircle, Clock, Zap, Grid } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CarroForm from "../components/linha/CarroForm";
import LinhaVisual from "../components/linha/LinhaVisual";
import CarrosList from "../components/linha/CarrosList";
import LinhaStats from "../components/linha/LinhaStats";
import LayoutEditor from "../components/linha/LayoutEditor";
import LayoutsList from "../components/linha/LayoutsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LinhaProducao() {
  const [showForm, setShowForm] = useState(false);
  const [editingCarro, setEditingCarro] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("visual");
  const [editingLayout, setEditingLayout] = useState(null);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: carros = [], isLoading } = useQuery({
    queryKey: ["carros-linha"],
    queryFn: () => base44.entities.CarroLinha.list("posicao_linha"),
    refetchInterval: 5000
  });

  const { data: layouts = [] } = useQuery({
    queryKey: ["layouts-linha"],
    queryFn: () => base44.entities.LayoutLinha.list("-created_date")
  });

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
    queryClient.invalidateQueries({ queryKey: ["carros-linha"] });
  };

  const handleEdit = (carro) => { setEditingCarro(carro); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover este carro da linha?")) return;
    await base44.entities.CarroLinha.delete(id);
    queryClient.invalidateQueries({ queryKey: ["carros-linha"] });
  };

  const handleDeleteLayout = async (id) => {
    await base44.entities.LayoutLinha.delete(id);
    queryClient.invalidateQueries({ queryKey: ["layouts-linha"] });
  };

  const carrosComErro = carros.filter(c => c.status === "erro").length;
  const carrosEmProcesso = carros.filter(c => c.status === "em_processo").length;
  const carrosConcluidos = carros.filter(c => c.status === "concluido").length;

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066b1]"></div>
      </div>
    );
  }

  // Se está editando um layout, mostra o editor em tela cheia
  if (showLayoutEditor) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#0066b1] rounded-lg flex items-center justify-center">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingLayout ? `Editando: ${editingLayout.nome_linha}` : "Novo Layout de Linha"}
            </h2>
            <p className="text-xs text-slate-500">Monte o layout físico da sua linha de produção</p>
          </div>
        </div>
        <LayoutEditor
          layout={editingLayout}
          currentUser={currentUser}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["layouts-linha"] });
            setShowLayoutEditor(false);
            setEditingLayout(null);
            setActiveTab("layout");
          }}
          onCancel={() => { setShowLayoutEditor(false); setEditingLayout(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Linha de Produção</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Monitoramento em tempo real
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#0066b1] hover:bg-[#004d82]">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Carro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Na Linha", value: carros.length, icon: Car, from: "from-[#001e50]", to: "to-[#0066b1]" },
          { label: "Em Processo", value: carrosEmProcesso, icon: Clock, from: "from-cyan-600", to: "to-blue-600" },
          { label: "Com Erro", value: carrosComErro, icon: AlertTriangle, from: "from-red-500", to: "to-red-600" },
          { label: "Concluídos", value: carrosConcluidos, icon: CheckCircle, from: "from-green-500", to: "to-emerald-600" },
        ].map(({ label, value, icon: Icon, from, to }) => (
          <Card key={label} className={`border-0 bg-gradient-to-br ${from} ${to} text-white`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-medium">{label}</p>
                  <p className="text-3xl font-bold mt-0.5">{value}</p>
                </div>
                <Icon className="w-10 h-10 text-white/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <CarroForm
            carro={editingCarro}
            onSubmit={handleSubmit}
            currentUser={currentUser}
            onCancel={() => { setShowForm(false); setEditingCarro(null); }}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Card className="border border-slate-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b bg-slate-50 p-3 md:p-4">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="visual" className="text-xs md:text-sm">Linha</TabsTrigger>
              <TabsTrigger value="lista" className="text-xs md:text-sm">Lista</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs md:text-sm">Stats</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs md:text-sm flex items-center gap-1">
                <Grid className="w-3 h-3" /> Layout
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4 md:pt-6">
            <TabsContent value="visual" className="mt-0">
              <LinhaVisual carros={carros} onEdit={handleEdit} />
            </TabsContent>
            <TabsContent value="lista" className="mt-0">
              <CarrosList carros={carros} onEdit={handleEdit} onDelete={handleDelete} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="stats" className="mt-0">
              <LinhaStats carros={carros} />
            </TabsContent>
            <TabsContent value="layout" className="mt-0">
              <LayoutsList
                layouts={layouts}
                onEdit={(layout) => { setEditingLayout(layout); setShowLayoutEditor(true); }}
                onDelete={handleDeleteLayout}
                onNew={() => { setEditingLayout(null); setShowLayoutEditor(true); }}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}