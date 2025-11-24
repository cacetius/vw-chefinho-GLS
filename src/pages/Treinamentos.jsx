import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap, Users, Calendar, Award, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import TreinamentoForm from "../components/treinamentos/TreinamentoForm";
import TreinamentosList from "../components/treinamentos/TreinamentosList";
import PDIList from "../components/treinamentos/PDIList";

export default function Treinamentos() {
  const [treinamentos, setTreinamentos] = useState([]);
  const [pdis, setPdis] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    emAndamento: 0,
    concluidos: 0,
    participantes: 0
  });

  useEffect(() => {
    loadUser();
    loadTreinamentos();
    loadPDIs();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadTreinamentos = async () => {
    const data = await base44.entities.Treinamento.list("-data_inicio");
    setTreinamentos(data);
    
    const participantesUnicos = new Set();
    data.forEach(t => {
      t.participantes?.forEach(p => participantesUnicos.add(p.colaborador_id));
    });
    
    setStats({
      total: data.length,
      emAndamento: data.filter(t => t.status === "em_andamento").length,
      concluidos: data.filter(t => t.status === "concluido").length,
      participantes: participantesUnicos.size
    });
  };

  const loadPDIs = async () => {
    const data = await base44.entities.PDI.list();
    setPdis(data);
  };

  const handleSubmit = async (treinamentoData) => {
    if (editingTreinamento) {
      await base44.entities.Treinamento.update(editingTreinamento.id, treinamentoData);
    } else {
      await base44.entities.Treinamento.create(treinamentoData);
    }
    setShowForm(false);
    setEditingTreinamento(null);
    loadTreinamentos();
  };

  const handleEdit = (treinamento) => {
    setEditingTreinamento(treinamento);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Treinamento.delete(id);
    loadTreinamentos();
  };

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              Treinamentos e Desenvolvimento
            </h1>
            <p className="text-gray-600 mt-1">Gerencie capacitações e planos de desenvolvimento</p>
          </div>
          {hasLeaderAccess && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Treinamento
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Total de Treinamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.emAndamento}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.concluidos}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.participantes}</div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <TreinamentoForm
              treinamento={editingTreinamento}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTreinamento(null);
              }}
            />
          )}
        </AnimatePresence>

        <Tabs defaultValue="treinamentos" className="space-y-6">
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
            <TabsTrigger value="pdis">PDIs</TabsTrigger>
          </TabsList>

          <TabsContent value="treinamentos">
            <TreinamentosList
              treinamentos={treinamentos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUser={currentUser}
              onReload={loadTreinamentos}
            />
          </TabsContent>

          <TabsContent value="pdis">
            <PDIList
              pdis={pdis}
              currentUser={currentUser}
              onReload={loadPDIs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}