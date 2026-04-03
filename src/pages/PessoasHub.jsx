import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CalendarX, BookOpen, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import VersatilidadeCards from "../components/versatilidade/VersatilidadeCards";
import VersatilidadeForm from "../components/versatilidade/VersatilidadeForm";
import MatrizHabilidades from "../components/versatilidade/MatrizHabilidades";
import AusenciaForm from "../components/ausencias/AusenciaForm";
import AusenciasList from "../components/ausencias/AusenciasList";
import TreinamentosList from "../components/treinamentos/TreinamentosList";
import TreinamentoForm from "../components/treinamentos/TreinamentoForm";

export default function PessoasHub() {
  const [activeTab, setActiveTab] = useState("versatilidade");
  const [showVersForm, setShowVersForm] = useState(false);
  const [editingVers, setEditingVers] = useState(null);
  const [showAusForm, setShowAusForm] = useState(false);
  const [editingAus, setEditingAus] = useState(null);
  const [showTreinForm, setShowTreinForm] = useState(false);
  const [editingTrein, setEditingTrein] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const isSupervisor = currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const filtraEquipe = (arr, campo = "equipe") =>
    isSupervisor || !currentUser?.equipe ? arr : arr.filter(x => x[campo] === currentUser.equipe);

  const { data: versatilidades = [] } = useQuery({
    queryKey: ["versatilidade", currentUser?.equipe],
    queryFn: async () => {
      const all = await base44.entities.Versatilidade.list("-created_date");
      return isSupervisor || !currentUser?.equipe ? all : all.filter(v => v.equipe === currentUser.equipe);
    },
    enabled: !!currentUser
  });

  const { data: ausencias = [] } = useQuery({
    queryKey: ["ausencias", currentUser?.equipe],
    queryFn: async () => {
      const all = await base44.entities.Ausencia.list("-created_date");
      return isSupervisor || !currentUser?.equipe ? all : all.filter(a => {
        // Monitores veem só as próprias; líderes veem da equipe
        if (currentUser.cargo === "lider") return true; // lider já filtra por equipe indiretamente
        return a.colaborador_id === currentUser.id;
      });
    },
    enabled: !!currentUser
  });

  const { data: treinamentos = [] } = useQuery({
    queryKey: ["treinamentos", currentUser?.equipe],
    queryFn: async () => {
      const all = await base44.entities.Treinamento.list("-created_date");
      // Todos veem treinamentos (é informação de capacitação geral)
      return all;
    },
    enabled: !!currentUser
  });

  const handleVersSubmit = async (data) => {
    if (editingVers) await base44.entities.Versatilidade.update(editingVers.id, data);
    else await base44.entities.Versatilidade.create(data);
    queryClient.invalidateQueries({ queryKey: ["versatilidade"] });
    setShowVersForm(false); setEditingVers(null);
  };

  const handleAusSubmit = async (data) => {
    if (editingAus) await base44.entities.Ausencia.update(editingAus.id, data);
    else await base44.entities.Ausencia.create({ ...data, colaborador_id: currentUser.id, colaborador_nome: currentUser.full_name });
    queryClient.invalidateQueries({ queryKey: ["ausencias"] });
    setShowAusForm(false); setEditingAus(null);
  };

  const handleTreinSubmit = async (data) => {
    if (editingTrein) await base44.entities.Treinamento.update(editingTrein.id, data);
    else await base44.entities.Treinamento.create(data);
    queryClient.invalidateQueries({ queryKey: ["treinamentos"] });
    setShowTreinForm(false); setEditingTrein(null);
  };

  if (!currentUser) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Pessoas & Times</h1>
            <p className="text-[10px] text-slate-400">
              {isSupervisor ? "Todas as equipes" : currentUser.equipe ? `Equipe: ${currentUser.equipe}` : "Versatilidade, Ausências e Treinamentos"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === "versatilidade" && (
            <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700 text-xs" onClick={() => setShowVersForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Colaborador</span>
            </Button>
          )}
          {activeTab === "ausencias" && (
            <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700 text-xs" onClick={() => setShowAusForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Ausência</span>
            </Button>
          )}
          {activeTab === "treinamentos" && (
            <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700 text-xs" onClick={() => setShowTreinForm(v => !v)}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Treinamento</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-purple-600">{versatilidades.length}</p>
            <p className="text-[9px] text-slate-500">Colaboradores</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-amber-600">{ausencias.filter(a => a.status === "pendente").length}</p>
            <p className="text-[9px] text-slate-500">Ausências Pend.</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-2.5 text-center">
            <p className="text-2xl font-bold text-blue-600">{treinamentos.filter(t => t.status === "em_andamento").length}</p>
            <p className="text-[9px] text-slate-500">Em Treinamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <AnimatePresence>
        {showVersForm && (
          <VersatilidadeForm
            versatilidade={editingVers}
            onSubmit={handleVersSubmit}
            onCancel={() => { setShowVersForm(false); setEditingVers(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAusForm && (
          <AusenciaForm
            ausencia={editingAus}
            onSubmit={handleAusSubmit}
            onCancel={() => { setShowAusForm(false); setEditingAus(null); }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTreinForm && (
          <TreinamentoForm
            treinamento={editingTrein}
            onSubmit={handleTreinSubmit}
            onCancel={() => { setShowTreinForm(false); setEditingTrein(null); }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="versatilidade" className="text-xs flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Versatiidade
          </TabsTrigger>
          <TabsTrigger value="ausencias" className="text-xs flex items-center gap-1">
            <CalendarX className="w-3.5 h-3.5" /> Ausências
          </TabsTrigger>
          <TabsTrigger value="treinamentos" className="text-xs flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Treinamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versatilidade" className="mt-3 space-y-3">
          <VersatilidadeCards
            versatilidades={versatilidades}
            onEdit={(v) => { setEditingVers(v); setShowVersForm(true); }}
            onDelete={async (id) => {
              if (!window.confirm("Remover colaborador?")) return;
              await base44.entities.Versatilidade.delete(id);
              queryClient.invalidateQueries({ queryKey: ["versatilidade"] });
            }}
            currentUser={currentUser}
          />
          {versatilidades.length > 0 && (
            <MatrizHabilidades versatilidades={versatilidades} />
          )}
        </TabsContent>
        <TabsContent value="ausencias" className="mt-3">
          <AusenciasList
            ausencias={ausencias}
            onEdit={(a) => { setEditingAus(a); setShowAusForm(true); }}
            onDelete={async (id) => {
              if (!window.confirm("Remover ausência?")) return;
              await base44.entities.Ausencia.delete(id);
              queryClient.invalidateQueries({ queryKey: ["ausencias"] });
            }}
            onUpdateStatus={async (id, status) => {
              const a = ausencias.find(x => x.id === id);
              await base44.entities.Ausencia.update(id, { ...a, status });
              queryClient.invalidateQueries({ queryKey: ["ausencias"] });
            }}
            currentUser={currentUser}
          />
        </TabsContent>
        <TabsContent value="treinamentos" className="mt-3">
          <TreinamentosList
            treinamentos={treinamentos}
            onEdit={(t) => { setEditingTrein(t); setShowTreinForm(true); }}
            onDelete={async (id) => {
              if (!window.confirm("Remover treinamento?")) return;
              await base44.entities.Treinamento.delete(id);
              queryClient.invalidateQueries({ queryKey: ["treinamentos"] });
            }}
            currentUser={currentUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}