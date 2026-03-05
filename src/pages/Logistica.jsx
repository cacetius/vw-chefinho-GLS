import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, CheckCircle, Clock, Filter, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import AtividadeForm from "../components/logistica/AtividadeForm";
import AtividadesList from "../components/logistica/AtividadesList";
import AtividadesFilters from "../components/logistica/AtividadesFilters";

export default function Logistica() {
  const [showForm, setShowForm] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState(null);
  const [filters, setFilters] = useState({ status: "all", prioridade: "all" });
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades-logistica"],
    queryFn: () => base44.entities.AtividadeLogistica.list("-created_date"),
    refetchInterval: 30000
  });

  const createAtividadeMutation = useMutation({
    mutationFn: (data) => base44.entities.AtividadeLogistica.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades-logistica"] });
      setShowForm(false);
      setEditingAtividade(null);
    }
  });

  const updateAtividadeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AtividadeLogistica.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades-logistica"] });
      setShowForm(false);
      setEditingAtividade(null);
    }
  });

  const deleteAtividadeMutation = useMutation({
    mutationFn: (id) => base44.entities.AtividadeLogistica.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["atividades-logistica"] })
  });

  const handleSubmit = (atividadeData) => {
    if (editingAtividade) {
      updateAtividadeMutation.mutate({ id: editingAtividade.id, data: atividadeData });
    } else {
      createAtividadeMutation.mutate(atividadeData);
    }
  };

  const handleEdit = (atividade) => {
    setEditingAtividade(atividade);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta atividade?")) {
      deleteAtividadeMutation.mutate(id);
    }
  };

  const filteredAtividades = atividades.filter(atividade => {
    const statusMatch = filters.status === "all" || atividade.status === filters.status;
    const prioridadeMatch = filters.prioridade === "all" || atividade.prioridade === filters.prioridade;
    return statusMatch && prioridadeMatch;
  });

  const statsData = [
    { label: "Total", value: atividades.length, color: "bg-[#0066b1]" },
    { label: "Pendentes", value: atividades.filter(a => a.status === "pendente").length, color: "bg-amber-500" },
    { label: "Andamento", value: atividades.filter(a => a.status === "em_andamento").length, color: "bg-cyan-600" },
    { label: "Concluídas", value: atividades.filter(a => a.status === "concluida").length, color: "bg-green-600" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Gestão de Logística</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Organize e acompanhe atividades</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#0066b1] hover:bg-[#004d82] h-9 px-3">
          <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-sm">Nova Atividade</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {statsData.map(({ label, value, color }) => (
          <Card key={label} className={`border-0 text-white ${color}`}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-[10px] opacity-80">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <AtividadeForm atividade={editingAtividade} onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingAtividade(null); }} />
        )}
      </AnimatePresence>

      <Card className="border border-slate-200">
        <CardContent className="pt-4 pb-4 px-4">
          <AtividadesFilters onFilterChange={setFilters} />
        </CardContent>
      </Card>

      <AtividadesList atividades={filteredAtividades} onEdit={handleEdit} onDelete={handleDelete} currentUser={currentUser} />
    </div>
  );
}