import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Pin, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import AvisoForm from "../components/avisos/AvisoForm";
import AvisosList from "../components/avisos/AvisosList";
import AvisosFilters from "../components/avisos/AvisosFilters";

export default function Avisos() {
  const [avisos, setAvisos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  const [filters, setFilters] = useState({ prioridade: "all", categoria: "all" });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadAvisos();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadAvisos = async () => {
    const data = await base44.entities.Aviso.list("-created_date");
    setAvisos(data);
  };

  const handleSubmit = async (avisoData) => {
    if (editingAviso) {
      await base44.entities.Aviso.update(editingAviso.id, avisoData);
    } else {
      await base44.entities.Aviso.create({
        ...avisoData,
        autor: currentUser.nome_exibicao || currentUser.full_name,
        cargo_autor: currentUser.cargo
      });
    }
    setShowForm(false);
    setEditingAviso(null);
    loadAvisos();
  };

  const handleEdit = (aviso) => {
    setEditingAviso(aviso);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aviso?")) return;
    await base44.entities.Aviso.delete(id);
    loadAvisos();
  };

  const handleToggleFixar = async (aviso) => {
    await base44.entities.Aviso.update(aviso.id, { ...aviso, fixado: !aviso.fixado });
    loadAvisos();
  };

  const filteredAvisos = avisos.filter(aviso => {
    const prioridadeMatch = filters.prioridade === "all" || aviso.prioridade === filters.prioridade;
    const categoriaMatch = filters.categoria === "all" || aviso.categoria === filters.categoria;
    return prioridadeMatch && categoriaMatch;
  });

  const avisosFixados = filteredAvisos.filter(a => a.fixado);
  const avisosNormais = filteredAvisos.filter(a => !a.fixado);

  // Usuário pode editar/excluir se for líder OU se for o criador do aviso
  const canEdit = (aviso) => {
    return currentUser?.cargo === "lider" || aviso.created_by === currentUser?.email;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-2xl"
              >
                <Bell className="w-8 h-8 text-white" />
              </motion.div>
              Quadro de Avisos
            </h1>
            <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Compartilhe informações importantes com a equipe
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all px-6 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Aviso
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-100">Total de Avisos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{avisos.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  Fixados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{avisosFixados.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-red-100">Urgentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {avisos.filter(a => a.prioridade === "urgente").length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-500 to-yellow-600 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-orange-100">Importantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {avisos.filter(a => a.prioridade === "importante").length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {showForm && (
            <AvisoForm
              aviso={editingAviso}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAviso(null);
              }}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-2xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-red-50 via-pink-50 to-orange-50">
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AvisosFilters onFilterChange={setFilters} />
          </CardContent>
        </Card>

        {avisosFixados.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Pin className="w-6 h-6 text-blue-600" />
              Avisos Fixados
            </h2>
            <AvisosList
              avisos={avisosFixados}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFixar={handleToggleFixar}
              currentUser={currentUser}
              canEdit={canEdit}
            />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Todos os Avisos
          </h2>
          <AvisosList
            avisos={avisosNormais}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFixar={handleToggleFixar}
            currentUser={currentUser}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}