import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, ThumbsUp, ThumbsDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import SugestaoForm from "../components/sugestoes/SugestaoForm";
import SugestaosList from "../components/sugestoes/SugestaosList";

export default function Sugestoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadSugestoes();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadSugestoes = async () => {
    const data = await base44.entities.Sugestao.list("-total_votos");
    setSugestoes(data);
  };

  const handleSubmit = async (sugestaoData) => {
    await base44.entities.Sugestao.create(sugestaoData);
    setShowForm(false);
    loadSugestoes();
  };

  const handleVotar = async (sugestao, tipo) => {
    const jaVotou = sugestao.votos?.find(v => v.usuario_id === currentUser.id);
    
    let novosVotos = sugestao.votos || [];
    if (jaVotou) {
      novosVotos = novosVotos.filter(v => v.usuario_id !== currentUser.id);
    }
    
    if (!jaVotou || jaVotou.tipo !== tipo) {
      novosVotos.push({ usuario_id: currentUser.id, tipo });
    }

    const totalVotos = novosVotos.reduce((acc, v) => acc + (v.tipo === "positivo" ? 1 : -1), 0);

    await base44.entities.Sugestao.update(sugestao.id, {
      ...sugestao,
      votos: novosVotos,
      total_votos: totalVotos
    });

    loadSugestoes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#001e50] flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              Quadro de Sugestões
            </h1>
            <p className="text-gray-600 mt-1">Compartilhe ideias para melhorar nossos processos</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-yellow-500 to-yellow-600">
            <Plus className="w-5 h-5 mr-2" />
            Nova Sugestão
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm">Total de Sugestões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{sugestoes.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm">Em Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {sugestoes.filter(s => s.status === "em_analise").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm">Implementadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {sugestoes.filter(s => s.status === "implementada").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-sm">Aprovadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {sugestoes.filter(s => s.status === "aprovada").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <SugestaoForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>

        <SugestaosList
          sugestoes={sugestoes}
          currentUser={currentUser}
          onVotar={handleVotar}
        />
      </div>
    </div>
  );
}