import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Download, Upload } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import VersatilidadeForm from "../components/versatilidade/VersatilidadeForm";
import MatrizHabilidades from "../components/versatilidade/MatrizHabilidades";
import VersatilidadeCards from "../components/versatilidade/VersatilidadeCards";

export default function Versatilidade() {
  const [colaboradores, setColaboradores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("matriz");

  useEffect(() => {
    loadUser();
    loadColaboradores();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadColaboradores = async () => {
    const data = await base44.entities.Versatilidade.list();
    setColaboradores(data);
  };

  const handleSubmit = async (colaboradorData) => {
    if (editingColaborador) {
      await base44.entities.Versatilidade.update(editingColaborador.id, colaboradorData);
    } else {
      await base44.entities.Versatilidade.create(colaboradorData);
    }
    setShowForm(false);
    setEditingColaborador(null);
    loadColaboradores();
  };

  const handleEdit = (colaborador) => {
    setEditingColaborador(colaborador);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Versatilidade.delete(id);
    loadColaboradores();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
              Matriz de Habilidades
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie competências e versatilidade da equipe</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline"
              className="text-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button 
              variant="outline"
              className="text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Adicionar Colaborador
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-md border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{colaboradores.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {colaboradores.filter(c => c.disponibilidade === "disponivel").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Instrutores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {colaboradores.filter(c => 
                  c.habilidades?.some(h => h.nivel === "instrutor")
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <VersatilidadeForm
              colaborador={editingColaborador}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingColaborador(null);
              }}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-lg">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
              <TabsList className="grid w-full md:w-96 grid-cols-2">
                <TabsTrigger value="matriz">Matriz de Habilidades</TabsTrigger>
                <TabsTrigger value="cards">Visualização em Cards</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="matriz" className="m-0">
                <MatrizHabilidades
                  colaboradores={colaboradores}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>
              <TabsContent value="cards" className="m-0 p-6">
                <VersatilidadeCards
                  colaboradores={colaboradores}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}