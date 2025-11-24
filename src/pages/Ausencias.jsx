import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Check, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";
import AusenciaForm from "../components/ausencias/AusenciaForm";
import AusenciasList from "../components/ausencias/AusenciasList";
import CalendarioAusencias from "../components/ausencias/CalendarioAusencias";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Ausencias() {
  const [ausencias, setAusencias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAusencia, setEditingAusencia] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    pendentes: 0,
    aprovadas: 0,
    reprovadas: 0,
    total: 0
  });

  useEffect(() => {
    loadUser();
    loadAusencias();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadAusencias = async () => {
    const user = await base44.auth.me();
    let data = await base44.entities.Ausencia.list("-data_inicio");
    
    // Se for monitor, mostrar apenas suas ausências
    if (user.cargo === "monitor") {
      data = data.filter(a => a.colaborador_id === user.id);
    }
    
    setAusencias(data);
    setStats({
      pendentes: data.filter(a => a.status === "pendente").length,
      aprovadas: data.filter(a => a.status === "aprovado").length,
      reprovadas: data.filter(a => a.status === "reprovado").length,
      total: data.length
    });
  };

  const handleSubmit = async (ausenciaData) => {
    const dataToSubmit = {
      ...ausenciaData,
      colaborador_id: currentUser.id,
      colaborador_nome: currentUser.nome_exibicao || currentUser.full_name
    };

    if (editingAusencia) {
      await base44.entities.Ausencia.update(editingAusencia.id, dataToSubmit);
    } else {
      await base44.entities.Ausencia.create(dataToSubmit);
    }
    setShowForm(false);
    setEditingAusencia(null);
    loadAusencias();
  };

  const handleEdit = (ausencia) => {
    setEditingAusencia(ausencia);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Ausencia.delete(id);
    loadAusencias();
  };

  const handleAprovar = async (ausencia) => {
    await base44.entities.Ausencia.update(ausencia.id, {
      ...ausencia,
      status: "aprovado",
      aprovado_por: currentUser.id,
      data_aprovacao: new Date().toISOString()
    });
    
    // Criar notificação
    await base44.entities.Notificacao.create({
      usuario_id: ausencia.colaborador_id,
      titulo: "Ausência Aprovada",
      mensagem: `Sua solicitação de ${ausencia.tipo} foi aprovada`,
      tipo: "sucesso",
      categoria: "ausencia"
    });
    
    loadAusencias();
  };

  const handleReprovar = async (ausencia, observacoes) => {
    await base44.entities.Ausencia.update(ausencia.id, {
      ...ausencia,
      status: "reprovado",
      aprovado_por: currentUser.id,
      data_aprovacao: new Date().toISOString(),
      observacoes_aprovacao: observacoes
    });
    
    // Criar notificação
    await base44.entities.Notificacao.create({
      usuario_id: ausencia.colaborador_id,
      titulo: "Ausência Reprovada",
      mensagem: `Sua solicitação de ${ausencia.tipo} foi reprovada: ${observacoes}`,
      tipo: "erro",
      categoria: "ausencia"
    });
    
    loadAusencias();
  };

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Gestão de Ausências
            </h1>
            <p className="text-gray-600 mt-1">Solicite e gerencie férias, folgas e afastamentos</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Solicitação
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendentes}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.aprovadas}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <X className="w-4 h-4" />
                Reprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.reprovadas}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <AusenciaForm
              ausencia={editingAusencia}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAusencia(null);
              }}
            />
          )}
        </AnimatePresence>

        <Tabs defaultValue="lista" className="space-y-6">
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <AusenciasList
              ausencias={ausencias}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAprovar={handleAprovar}
              onReprovar={handleReprovar}
              currentUser={currentUser}
              hasLeaderAccess={hasLeaderAccess}
            />
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarioAusencias ausencias={ausencias.filter(a => a.status === "aprovado")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}