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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Quadro de Avisos</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Informações importantes da equipe</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-500 hover:bg-red-600 h-9 px-3">
          <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-sm">Novo Aviso</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: avisos.length, color: "bg-blue-500" },
          { label: "Fixados", value: avisosFixados.length, color: "bg-cyan-500", Icon: Pin },
          { label: "Urgentes", value: avisos.filter(a => a.prioridade === "urgente").length, color: "bg-red-500" },
          { label: "Importantes", value: avisos.filter(a => a.prioridade === "importante").length, color: "bg-orange-500" },
        ].map(({ label, value, color }) => (
          <Card key={label} className={`border-0 text-white ${color}`}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-[10px] opacity-80 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
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

        <Card className="border border-slate-200">
          <CardContent className="pt-4 pb-4 px-4">
            <AvisosFilters onFilterChange={setFilters} />
          </CardContent>
        </Card>

        {avisosFixados.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-slate-700">
              <Pin className="w-4 h-4 text-blue-600" /> Avisos Fixados
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
          <h2 className="text-sm font-semibold mb-3 text-slate-700">Todos os Avisos</h2>
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
  );
}