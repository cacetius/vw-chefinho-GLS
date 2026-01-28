import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Plus, TrendingUp, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AuditoriaVDAForm from "../components/auditoria/AuditoriaVDAForm";
import AuditoriaVDAList from "../components/auditoria/AuditoriaVDAList";
import PlanoAcaoList from "../components/auditoria/PlanoAcaoList";
import AuditoriaChart from "../components/auditoria/AuditoriaChart";

export default function AuditoriaVDA() {
  const [showForm, setShowForm] = useState(false);
  const [editingAuditoria, setEditingAuditoria] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("auditorias");
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: auditorias = [], isLoading } = useQuery({
    queryKey: ["auditorias"],
    queryFn: () => base44.entities.AuditoriaVDA.list("-data_auditoria"),
    refetchInterval: 30000
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ["planos-acao"],
    queryFn: () => base44.entities.PlanoAcaoVDA.list("-created_date"),
    refetchInterval: 30000
  });

  const createAuditoriaMutation = useMutation({
    mutationFn: (auditoriaData) => base44.entities.AuditoriaVDA.create(auditoriaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditorias"] });
      setShowForm(false);
      setEditingAuditoria(null);
    }
  });

  const updateAuditoriaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AuditoriaVDA.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditorias"] });
      setShowForm(false);
      setEditingAuditoria(null);
    }
  });

  const deleteAuditoriaMutation = useMutation({
    mutationFn: (id) => base44.entities.AuditoriaVDA.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auditorias"] })
  });

  const handleSubmit = async (auditoriaData) => {
    const itens = auditoriaData.itens_checklist || [];
    const pontuacaoTotal = itens.reduce((sum, item) => sum + (item.pontuacao || 0), 0);
    const pontuacaoMaxima = itens.length * 10;
    const percentual = pontuacaoMaxima > 0 ? (pontuacaoTotal / pontuacaoMaxima) * 100 : 0;

    const dataComCalculo = {
      ...auditoriaData,
      pontuacao_total: pontuacaoTotal,
      pontuacao_maxima: pontuacaoMaxima,
      percentual_conformidade: Math.round(percentual)
    };

    if (editingAuditoria) {
      updateAuditoriaMutation.mutate({ id: editingAuditoria.id, data: dataComCalculo });
    } else {
      createAuditoriaMutation.mutate(dataComCalculo);
    }
  };

  const handleEdit = (auditoria) => {
    setEditingAuditoria(auditoria);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta auditoria?")) {
      deleteAuditoriaMutation.mutate(id);
    }
  };

  const calcularMediaConformidade = () => {
    if (auditorias.length === 0) return 0;
    const soma = auditorias.reduce((sum, a) => sum + (a.percentual_conformidade || 0), 0);
    return Math.round(soma / auditorias.length);
  };

  const contarNaoConformidades = () => {
    return auditorias.reduce((sum, a) => {
      return sum + (a.nao_conformidades?.length || 0);
    }, 0);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-blue-600" style={{ borderTopColor: 'transparent' }}></div>
            <div className="absolute top-2 left-2 rounded-full h-16 w-16 bg-white"></div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <p className="text-gray-700 font-semibold text-lg">Carregando auditorias...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              Auditoria VDA
            </h1>
            <p className="text-slate-600 mt-1 text-xs md:text-sm">Sistema de gestão de qualidade automotiva</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#001e50] to-[#0066b1] hover:from-[#001e50] hover:to-[#004d82]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-slate-600 text-[10px] sm:text-xs font-medium mb-1">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0066b1]">{auditorias.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0066b1]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Conformidade Média</p>
                    <p className="text-4xl font-bold">{calcularMediaConformidade()}%</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Não Conformidades</p>
                    <p className="text-4xl font-bold">{contarNaoConformidades()}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Planos de Ação</p>
                    <p className="text-4xl font-bold">{planosAcao.length}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <AuditoriaVDAForm
              auditoria={editingAuditoria}
              onSubmit={handleSubmit}
              currentUser={currentUser}
              onCancel={() => {
                setShowForm(false);
                setEditingAuditoria(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Card className="shadow-2xl border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
              <TabsList className="grid w-full md:w-[600px] grid-cols-3">
                <TabsTrigger value="auditorias">Auditorias</TabsTrigger>
                <TabsTrigger value="planos">Planos de Ação</TabsTrigger>
                <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="auditorias" className="mt-0">
                <AuditoriaVDAList
                  auditorias={auditorias}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUser={currentUser}
                />
              </TabsContent>

              <TabsContent value="planos" className="mt-0">
                <PlanoAcaoList
                  planosAcao={planosAcao}
                  auditorias={auditorias}
                  onRefresh={() => queryClient.invalidateQueries({ queryKey: ["planos-acao"] })}
                  currentUser={currentUser}
                />
              </TabsContent>

              <TabsContent value="indicadores" className="mt-0">
                <AuditoriaChart auditorias={auditorias} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}