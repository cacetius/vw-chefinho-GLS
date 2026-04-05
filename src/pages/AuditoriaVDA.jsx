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
    <div className="space-y-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Auditoria VDA</h1>
              <p className="text-[10px] text-slate-400">Gestão de qualidade automotiva</p>
            </div>
          </div>
          <Button size="sm"
            onClick={() => setShowForm(!showForm)}
            className="h-8 text-xs bg-[#0066b1] hover:bg-[#004d82]"
          >
            <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Nova Auditoria</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="border border-slate-200">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-4 h-4 text-[#0066b1]" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Total</p>
                <p className="text-xl font-bold text-[#0066b1]">{auditorias.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-green-100">Conformidade</p>
                <p className="text-xl font-bold">{calcularMediaConformidade()}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-red-100">Não Conformidades</p>
                <p className="text-xl font-bold">{contarNaoConformidades()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-purple-100">Planos de Ação</p>
                <p className="text-xl font-bold">{planosAcao.length}</p>
              </div>
            </CardContent>
          </Card>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="auditorias" className="text-xs">Auditorias</TabsTrigger>
            <TabsTrigger value="planos" className="text-xs">Planos</TabsTrigger>
            <TabsTrigger value="indicadores" className="text-xs">Indicadores</TabsTrigger>
          </TabsList>

          <TabsContent value="auditorias" className="mt-3">
            <AuditoriaVDAList auditorias={auditorias} onEdit={handleEdit} onDelete={handleDelete} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="planos" className="mt-3">
            <PlanoAcaoList planosAcao={planosAcao} auditorias={auditorias} onRefresh={() => queryClient.invalidateQueries({ queryKey: ["planos-acao"] })} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="indicadores" className="mt-3">
            <AuditoriaChart auditorias={auditorias} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}