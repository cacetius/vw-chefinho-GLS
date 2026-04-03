import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Target, BookOpen, Plus, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ObjetivoForm from "../components/objetivos/ObjetivoForm";
import ObjetivosDiarios from "../components/objetivos/ObjetivosDiarios";
import ObjetivosMensais from "../components/objetivos/ObjetivosMensais";
import AvisoForm from "../components/avisos/AvisoForm";
import AvisosList from "../components/avisos/AvisosList";
import DialogoForm from "../components/dialogo/DialogoForm";
import AssistenteIA from "../components/dialogo/AssistenteIA";
import DialogoApresentacao from "../components/dialogo/DialogoApresentacao";

export default function SegurancaHub() {
  const [activeTab, setActiveTab] = useState("objetivos");
  const [showObjetivoForm, setShowObjetivoForm] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState(null);
  const [showAvisoForm, setShowAvisoForm] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  const [showDialogoForm, setShowDialogoForm] = useState(false);
  const [editingDialogo, setEditingDialogo] = useState(null);
  const [apresentandoDialogo, setApresentandoDialogo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const { data: objetivos = [] } = useQuery({
    queryKey: ["objetivos"],
    queryFn: () => base44.entities.Objetivo.list("-data_referencia"),
    enabled: !!currentUser
  });

  const { data: avisos = [] } = useQuery({
    queryKey: ["avisos"],
    queryFn: () => base44.entities.Aviso.list("-created_date"),
    enabled: !!currentUser
  });

  const { data: dialogos = [] } = useQuery({
    queryKey: ["dialogos"],
    queryFn: () => base44.entities.DialogoSeguranca.list("-created_date"),
    enabled: !!currentUser
  });

  const handleObjetivoSubmit = async (data) => {
    if (editingObjetivo) await base44.entities.Objetivo.update(editingObjetivo.id, data);
    else await base44.entities.Objetivo.create(data);
    queryClient.invalidateQueries({ queryKey: ["objetivos"] });
    setShowObjetivoForm(false); setEditingObjetivo(null);
  };

  const handleAvisoSubmit = async (data) => {
    const payload = { ...data, autor: currentUser.nome_exibicao || currentUser.full_name, cargo_autor: currentUser.cargo };
    if (editingAviso) await base44.entities.Aviso.update(editingAviso.id, payload);
    else await base44.entities.Aviso.create(payload);
    queryClient.invalidateQueries({ queryKey: ["avisos"] });
    setShowAvisoForm(false); setEditingAviso(null);
  };

  const hoje = new Date().toISOString().split('T')[0];
  const objetivosDiarios = objetivos.filter(o => o.tipo === "diario");
  const objetivosMensais = objetivos.filter(o => o.tipo === "mensal");
  const objetivosHoje = objetivosDiarios.filter(o => o.data_referencia === hoje);
  const taxaConclusao = objetivosHoje.length > 0
    ? Math.round((objetivosHoje.filter(o => o.concluido).length / objetivosHoje.length) * 100)
    : 0;

  if (!currentUser) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  if (apresentandoDialogo) {
    return (
      <DialogoApresentacao
        dialogo={apresentandoDialogo}
        onClose={() => setApresentandoDialogo(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Segurança & Qualidade</h1>
            <p className="text-[10px] text-slate-400">{taxaConclusao}% objetivos concluídos hoje</p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === "objetivos" && (
            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => setShowObjetivoForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Objetivo</span>
            </Button>
          )}
          {activeTab === "avisos" && (
            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => setShowAvisoForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Aviso</span>
            </Button>
          )}
          {activeTab === "dialogos" && (
            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => setShowDialogoForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">DDS</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-green-600">{taxaConclusao}%</p>
            <p className="text-[9px] text-slate-500">Objetivos Hoje</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-red-500">{avisos.filter(a => a.prioridade === "urgente").length}</p>
            <p className="text-[9px] text-slate-500">Avisos Urgentes</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-blue-600">{dialogos.length}</p>
            <p className="text-[9px] text-slate-500">Diálogos DDS</p>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <AnimatePresence>
        {showObjetivoForm && (
          <ObjetivoForm
            objetivo={editingObjetivo}
            onSubmit={handleObjetivoSubmit}
            onCancel={() => { setShowObjetivoForm(false); setEditingObjetivo(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAvisoForm && (
          <AvisoForm
            aviso={editingAviso}
            onSubmit={handleAvisoSubmit}
            onCancel={() => { setShowAvisoForm(false); setEditingAviso(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDialogoForm && (
          <DialogoForm
            dialogo={editingDialogo}
            onSubmit={async (data) => {
              if (editingDialogo) await base44.entities.DialogoSeguranca.update(editingDialogo.id, data);
              else await base44.entities.DialogoSeguranca.create({ ...data, autor: currentUser.full_name });
              queryClient.invalidateQueries({ queryKey: ["dialogos"] });
              setShowDialogoForm(false); setEditingDialogo(null);
            }}
            onCancel={() => { setShowDialogoForm(false); setEditingDialogo(null); }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="objetivos" className="text-xs flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> Objetivos
          </TabsTrigger>
          <TabsTrigger value="avisos" className="text-xs flex items-center gap-1">
            <Bell className="w-3.5 h-3.5" /> Avisos
          </TabsTrigger>
          <TabsTrigger value="dialogos" className="text-xs flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> DDS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objetivos" className="mt-3 space-y-3">
          <Tabs defaultValue="diarios">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="diarios" className="text-xs">Diários</TabsTrigger>
              <TabsTrigger value="mensais" className="text-xs">Mensais</TabsTrigger>
            </TabsList>
            <TabsContent value="diarios" className="mt-2">
              <ObjetivosDiarios
                objetivos={objetivosDiarios}
                onEdit={(o) => { setEditingObjetivo(o); setShowObjetivoForm(true); }}
                onDelete={async (id) => { await base44.entities.Objetivo.delete(id); queryClient.invalidateQueries({ queryKey: ["objetivos"] }); }}
                onToggleConcluido={async (o) => { await base44.entities.Objetivo.update(o.id, { ...o, concluido: !o.concluido }); queryClient.invalidateQueries({ queryKey: ["objetivos"] }); }}
              />
            </TabsContent>
            <TabsContent value="mensais" className="mt-2">
              <ObjetivosMensais
                objetivos={objetivosMensais}
                onEdit={(o) => { setEditingObjetivo(o); setShowObjetivoForm(true); }}
                onDelete={async (id) => { await base44.entities.Objetivo.delete(id); queryClient.invalidateQueries({ queryKey: ["objetivos"] }); }}
                onToggleConcluido={async (o) => { await base44.entities.Objetivo.update(o.id, { ...o, concluido: !o.concluido }); queryClient.invalidateQueries({ queryKey: ["objetivos"] }); }}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="avisos" className="mt-3">
          <AvisosList
            avisos={avisos}
            onEdit={(a) => { setEditingAviso(a); setShowAvisoForm(true); }}
            onDelete={async (id) => { await base44.entities.Aviso.delete(id); queryClient.invalidateQueries({ queryKey: ["avisos"] }); }}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="dialogos" className="mt-3">
          <AssistenteIA
            dialogos={dialogos}
            onEdit={(d) => { setEditingDialogo(d); setShowDialogoForm(true); }}
            onDelete={async (id) => { await base44.entities.DialogoSeguranca.delete(id); queryClient.invalidateQueries({ queryKey: ["dialogos"] }); }}
            onApresentar={(d) => setApresentandoDialogo(d)}
            currentUser={currentUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}