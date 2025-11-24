import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, CheckCircle, Clock, XCircle, Filter, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import AtividadeForm from "../components/logistica/AtividadeForm";
import AtividadesList from "../components/logistica/AtividadesList";
import AtividadesFilters from "../components/logistica/AtividadesFilters";

export default function Logistica() {
  const [atividades, setAtividades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState(null);
  const [filters, setFilters] = useState({ status: "all", prioridade: "all" });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadAtividades();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadAtividades = async () => {
    const data = await base44.entities.AtividadeLogistica.list("-created_date");
    setAtividades(data);
  };

  const handleSubmit = async (atividadeData) => {
    if (editingAtividade) {
      await base44.entities.AtividadeLogistica.update(editingAtividade.id, atividadeData);
    } else {
      await base44.entities.AtividadeLogistica.create(atividadeData);
    }
    setShowForm(false);
    setEditingAtividade(null);
    loadAtividades();
  };

  const handleEdit = (atividade) => {
    setEditingAtividade(atividade);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) return;
    await base44.entities.AtividadeLogistica.delete(id);
    loadAtividades();
  };

  const filteredAtividades = atividades.filter(atividade => {
    const statusMatch = filters.status === "all" || atividade.status === filters.status;
    const prioridadeMatch = filters.prioridade === "all" || atividade.prioridade === filters.prioridade;
    return statusMatch && prioridadeMatch;
  });

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
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl"
              >
                <Truck className="w-8 h-8 text-white" />
              </motion.div>
              Gestão de Logística
            </h1>
            <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Organize e acompanhe suas atividades
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all px-6 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Atividade
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-3xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-100">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{atividades.length}</div>
                <p className="text-xs text-blue-100 mt-1">Atividades registradas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-yellow-500 to-orange-600 text-white hover:shadow-3xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-100 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {atividades.filter(a => a.status === "pendente").length}
                </div>
                <p className="text-xs text-yellow-100 mt-1">Aguardando início</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-3xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-cyan-100">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {atividades.filter(a => a.status === "em_andamento").length}
                </div>
                <p className="text-xs text-cyan-100 mt-1">Em execução</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-3xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Concluídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {atividades.filter(a => a.status === "concluida").length}
                </div>
                <p className="text-xs text-green-100 mt-1">Finalizadas</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {showForm && (
            <AtividadeForm
              atividade={editingAtividade}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAtividade(null);
              }}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-2xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AtividadesFilters onFilterChange={setFilters} />
          </CardContent>
        </Card>

        <AtividadesList
          atividades={filteredAtividades}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}