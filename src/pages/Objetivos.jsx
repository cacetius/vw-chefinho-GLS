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

  const taxaConclusao = objetivosHoje.length > 0 ? Math.round((objetivosHoje.filter(o => o.concluido).length / objetivosHoje.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Objetivos</h1>
            <p className="text-[10px] text-slate-400">{taxaConclusao}% concluídos hoje</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="h-9 bg-green-600 hover:bg-green-700 px-3">
          <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-xs">Novo</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Hoje", value: objetivosHoje.length, color: "border-l-green-500" },
          { label: "Diários", value: objetivosDiarios.length, color: "border-l-blue-500" },
          { label: "Mensais", value: objetivosMensais.length, color: "border-l-purple-500" },
          { label: `${taxaConclusao}%`, value: "✓", color: "border-l-orange-500" },
        ].map(({ label, value, color }) => (
          <Card key={label} className={`shadow-sm border-l-4 ${color}`}>
            <CardContent className="p-2.5">
              <p className="text-[9px] text-slate-500 leading-tight">{label}</p>
              <div className="text-xl font-bold text-slate-900 leading-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <ObjetivoForm
            objetivo={editingObjetivo}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingObjetivo(null); }}
          />
        )}
      </AnimatePresence>

      <Card className="shadow-sm border border-slate-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b bg-slate-50 py-3">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="diarios">Objetivos Diários</TabsTrigger>
              <TabsTrigger value="mensais">Objetivos Mensais</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="diarios" className="mt-0">
              <ObjetivosDiarios objetivos={objetivosDiarios} onEdit={handleEdit} onDelete={handleDelete} onToggleConcluido={handleToggleConcluido} />
            </TabsContent>
            <TabsContent value="mensais" className="mt-0">
              <ObjetivosMensais objetivos={objetivosMensais} onEdit={handleEdit} onDelete={handleDelete} onToggleConcluido={handleToggleConcluido} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}