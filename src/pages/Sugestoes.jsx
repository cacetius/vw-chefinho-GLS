import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import SugestaoForm from "../components/sugestoes/SugestaoForm";
import SugestaosList from "../components/sugestoes/SugestaosList";

export default function Sugestoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [user, data] = await Promise.all([
      base44.auth.me(),
      base44.entities.Sugestao.list("-total_votos")
    ]);
    setCurrentUser(user);
    setSugestoes(data);
  };

  const handleSubmit = async (sugestaoData) => {
    await base44.entities.Sugestao.create(sugestaoData);
    setShowForm(false);
    loadAll();
  };

  const handleVotar = async (sugestao, tipo) => {
    const jaVotou = sugestao.votos?.find(v => v.usuario_id === currentUser.id);
    let novosVotos = sugestao.votos || [];
    if (jaVotou) novosVotos = novosVotos.filter(v => v.usuario_id !== currentUser.id);
    if (!jaVotou || jaVotou.tipo !== tipo) novosVotos.push({ usuario_id: currentUser.id, tipo });
    const totalVotos = novosVotos.reduce((acc, v) => acc + (v.tipo === "positivo" ? 1 : -1), 0);
    await base44.entities.Sugestao.update(sugestao.id, { ...sugestao, votos: novosVotos, total_votos: totalVotos });
    loadAll();
  };

  const stats = [
    { label: "Total", value: sugestoes.length, color: "text-slate-700", bg: "bg-slate-100", icon: Lightbulb },
    { label: "Em Análise", value: sugestoes.filter(s => s.status === "em_analise").length, color: "text-blue-700", bg: "bg-blue-100", icon: Search },
    { label: "Aprovadas", value: sugestoes.filter(s => s.status === "aprovada").length, color: "text-purple-700", bg: "bg-purple-100", icon: CheckCircle2 },
    { label: "Implementadas", value: sugestoes.filter(s => s.status === "implementada").length, color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
    { label: "Rejeitadas", value: sugestoes.filter(s => s.status === "rejeitada").length, color: "text-red-700", bg: "bg-red-100", icon: XCircle },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Quadro de Sugestões</h1>
            <p className="text-xs text-slate-400">Compartilhe ideias para melhorar os processos</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-amber-500 hover:bg-amber-600 h-9 px-3">
          <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline text-sm">Nova Sugestão</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {stats.map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="border border-slate-200">
            <CardContent className="p-3 text-center">
              <div className={`w-7 h-7 ${bg} rounded-lg mx-auto mb-1 flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Taxa de implementação */}
      {sugestoes.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-green-800">Taxa de Implementação</p>
            <p className="text-[11px] text-green-700">
              {sugestoes.filter(s => s.status === "implementada").length} de {sugestoes.filter(s => s.status !== "rejeitada").length} sugestões foram aplicadas
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-2xl font-bold text-green-700">
              {sugestoes.filter(s => s.status !== "rejeitada").length > 0
                ? Math.round((sugestoes.filter(s => s.status === "implementada").length / sugestoes.filter(s => s.status !== "rejeitada").length) * 100)
                : 0}%
            </span>
          </div>
        </div>
      )}

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
        onUpdate={loadAll}
      />
    </div>
  );
}