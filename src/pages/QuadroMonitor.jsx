import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, Circle, Play, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ATIVIDADES_DIARIAS = [
  { tipo: "verificar_ferramentas_criticas", titulo: "Verificar Ferramentas Críticas", icone: "🔧" },
  { tipo: "verificar_torques", titulo: "Verificar Torques", icone: "🔩" },
  { tipo: "verificar_etiquetas", titulo: "Verificar Etiquetas", icone: "🏷️" },
  { tipo: "verificar_faixas", titulo: "Verificar Faixas", icone: "📏" },
  { tipo: "verificar_epi", titulo: "Verificar EPIs", icone: "🦺" },
  { tipo: "verificar_5s", titulo: "Verificar 5S", icone: "✨" },
  { tipo: "verificar_equipamentos", titulo: "Verificar Equipamentos", icone: "⚙️" },
];
const ATIVIDADES_SEMANAIS = [
  { tipo: "auditoria_ferramentas", titulo: "Auditoria de Ferramentas", icone: "🔍" },
  { tipo: "auditoria_bancadas", titulo: "Auditoria de Bancadas", icone: "🗄️" },
  { tipo: "revisao_etiquetas", titulo: "Revisão de Etiquetas", icone: "🏷️" },
  { tipo: "revisao_faixas", titulo: "Revisão de Faixas", icone: "📏" },
  { tipo: "revisao_estoque_epi", titulo: "Revisão de Estoque de EPI", icone: "📦" },
];
const ATIVIDADES_MENSAIS = [
  { tipo: "auditoria_completa", titulo: "Auditoria Completa", icone: "📊" },
  { tipo: "inventario", titulo: "Inventário", icone: "🗃️" },
  { tipo: "revisao_documental", titulo: "Revisão Documental", icone: "📄" },
  { tipo: "revisao_calibracoes", titulo: "Revisão de Calibrações", icone: "📐" },
  { tipo: "revisao_equipamentos_criticos", titulo: "Revisão de Equipamentos Críticos", icone: "⚠️" },
];

const STATUS_CONFIG = {
  nao_iniciado: { icon: Circle, color: "text-slate-300", bg: "bg-slate-50", label: "Não iniciado" },
  em_andamento: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-50", label: "Em andamento" },
  concluido: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Concluído" },
  atrasado: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Atrasado" },
};

export default function QuadroMonitor() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades-monitor"], queryFn: () => base44.entities.AtividadeMonitor.list("-data", 200)
  });

  const hoje = format(new Date(), "yyyy-MM-dd");

  const getAtividadeHoje = (tipo) => atividades.find(a => a.tipo === tipo && a.data === hoje);
  const getStatusHoje = (tipo) => getAtividadeHoje(tipo)?.status || "nao_iniciado";

  const toggleStatus = async (tipo, categoria) => {
    const existente = getAtividadeHoje(tipo);
    if (existente) {
      const novoStatus = existente.status === "concluido" ? "nao_iniciado" : existente.status === "nao_iniciado" ? "em_andamento" : "concluido";
      await base44.entities.AtividadeMonitor.update(existente.id, { status: novoStatus });
    } else {
      await base44.entities.AtividadeMonitor.create({
        titulo: [...ATIVIDADES_DIARIAS, ...ATIVIDADES_SEMANAIS, ...ATIVIDADES_MENSAIS].find(a => a.tipo === tipo)?.titulo || tipo,
        tipo, categoria, data: hoje, status: "em_andamento",
        celula: currentUser?.celula || "", equipe: currentUser?.equipe || "",
        responsavel: currentUser?.nome_exibicao || currentUser?.full_name || ""
      });
    }
    // Força refresh
    window.location.reload();
  };

  const renderSecao = (titulo, lista, categoria) => {
    const concluidas = lista.filter(a => getStatusHoje(a.tipo) === "concluido").length;
    const pct = Math.round((concluidas / lista.length) * 100);
    return (
      <Card className="border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">{titulo}</h3>
          <Badge className={`text-[10px] ${pct === 100 ? "bg-emerald-100 text-emerald-700" : pct > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{concluidas}/{lista.length} • {pct}%</Badge>
        </div>
        <CardContent className="p-2">
          <div className="space-y-1">
            {lista.map(({ tipo, titulo, icone }) => {
              const status = getStatusHoje(tipo);
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <button key={tipo} onClick={() => toggleStatus(tipo, categoria)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${cfg.bg} hover:opacity-80 active:scale-[0.98]`}>
                  <span className="text-lg">{icone}</span>
                  <span className="flex-1 text-xs font-medium text-slate-700">{titulo}</span>
                  <Icon className={`w-4 h-4 ${cfg.color} ${status === "em_andamento" ? "animate-spin" : ""}`} />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4">
        <h1 className="text-lg font-bold text-white">Quadro do Monitor</h1>
        <p className="text-blue-200 text-xs">Painel visual de atividades diárias, semanais e mensais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {renderSecao("📅 Atividades Diárias", ATIVIDADES_DIARIAS, "diaria")}
        {renderSecao("📆 Atividades Semanais", ATIVIDADES_SEMANAIS, "semanal")}
        {renderSecao("🗓️ Atividades Mensais", ATIVIDADES_MENSAIS, "mensal")}
      </div>

      <div className="text-[10px] text-slate-400 text-center pb-2">
        Toque em uma atividade para alternar o status • Clique novamente para concluir
      </div>
    </div>
  );
}