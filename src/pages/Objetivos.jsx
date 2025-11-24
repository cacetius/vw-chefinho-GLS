import React, { useState, useEffect } from "react";
import { Objetivo } from "@/entities/Objetivo";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, TrendingUp, Calendar } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import ObjetivoForm from "../components/objetivos/ObjetivoForm";
import ObjetivosDiarios from "../components/objetivos/ObjetivosDiarios";
import ObjetivosMensais from "../components/objetivos/ObjetivosMensais";

export default function Objetivos() {
  const [objetivos, setObjetivos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("diarios");

  useEffect(() => {
    loadUser();
    loadObjetivos();
  }, []);

  const loadUser = async () => {
    const user = await User.me();
    setCurrentUser(user);
  };

  const loadObjetivos = async () => {
    const data = await Objetivo.list("-data_referencia");
    setObjetivos(data);
  };

  const handleSubmit = async (objetivoData) => {
    if (editingObjetivo) {
      await Objetivo.update(editingObjetivo.id, objetivoData);
    } else {
      await Objetivo.create(objetivoData);
    }
    setShowForm(false);
    setEditingObjetivo(null);
    loadObjetivos();
  };

  const handleEdit = (objetivo) => {
    setEditingObjetivo(objetivo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await Objetivo.delete(id);
    loadObjetivos();
  };

  const handleToggleConcluido = async (objetivo) => {
    await Objetivo.update(objetivo.id, { ...objetivo, concluido: !objetivo.concluido });
    loadObjetivos();
  };

  const objetivosDiarios = objetivos.filter(o => o.tipo === "diario");
  const objetivosMensais = objetivos.filter(o => o.tipo === "mensal");

  const hoje = new Date().toISOString().split('T')[0];
  const objetivosHoje = objetivosDiarios.filter(o => o.data_referencia === hoje);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              Objetivos e Metas
            </h1>
            <p className="text-gray-600 mt-1">Acompanhe os objetivos diários e mensais da equipe</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Objetivo
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Objetivos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{objetivosHoje.length}</div>
              <p className="text-sm text-gray-500 mt-1">
                {objetivosHoje.filter(o => o.concluido).length} concluídos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Objetivos Diários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{objetivosDiarios.length}</div>
              <p className="text-sm text-gray-500 mt-1">Total registrados</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Objetivos Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{objetivosMensais.length}</div>
              <p className="text-sm text-gray-500 mt-1">Total registrados</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {objetivosHoje.length > 0 
                  ? Math.round((objetivosHoje.filter(o => o.concluido).length / objetivosHoje.length) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Hoje</p>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <ObjetivoForm
              objetivo={editingObjetivo}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingObjetivo(null);
              }}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-white">
              <TabsList className="grid w-full md:w-96 grid-cols-2">
                <TabsTrigger value="diarios">Objetivos Diários</TabsTrigger>
                <TabsTrigger value="mensais">Objetivos Mensais</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="diarios" className="mt-0">
                <ObjetivosDiarios
                  objetivos={objetivosDiarios}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleConcluido={handleToggleConcluido}
                />
              </TabsContent>
              <TabsContent value="mensais" className="mt-0">
                <ObjetivosMensais
                  objetivos={objetivosMensais}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleConcluido={handleToggleConcluido}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}