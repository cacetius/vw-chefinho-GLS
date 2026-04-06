import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar, ShoppingCart, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays, parseISO } from "date-fns";

export default function PrazoAlertas({ currentUser }) {
  const isSup = currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const { data: tarefas = [] } = useQuery({
    queryKey: ["tarefas-prazos"],
    queryFn: () => base44.entities.TarefaMonitor.list("-created_date"),
    refetchInterval: 60000,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-prazos"],
    queryFn: () => base44.entities.PedidoEPI.list(),
    refetchInterval: 60000,
  });

  const { data: ausencias = [] } = useQuery({
    queryKey: ["ausencias-prazos"],
    queryFn: () => base44.entities.Ausencia.list(),
    refetchInterval: 60000,
  });

  const { data: planosVDA = [] } = useQuery({
    queryKey: ["planos-prazos"],
    queryFn: () => base44.entities.PlanoAcaoVDA.list(),
    refetchInterval: 60000,
  });

  const hoje = new Date();

  // Tarefas vencidas ou vencendo em 2 dias
  const tarefasAlerta = tarefas
    .filter(t => t.status !== "concluida" && t.data_limite)
    .map(t => ({ ...t, diasRestantes: differenceInDays(parseISO(t.data_limite), hoje) }))
    .filter(t => t.diasRestantes <= 2)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 4);

  // Pedidos urgentes pendentes
  const pedidosUrgentes = pedidos.filter(p => p.status === "pendente" && p.urgencia === "urgente").slice(0, 3);

  // Ausências pendentes de aprovação
  const ausenciasPendentes = ausencias.filter(a => a.status === "pendente").slice(0, 3);

  // Planos de ação VDA vencendo
  const planosAlerta = planosVDA
    .filter(p => p.status !== "concluido" && p.prazo_conclusao)
    .map(p => ({ ...p, diasRestantes: differenceInDays(parseISO(p.prazo_conclusao), hoje) }))
    .filter(p => p.diasRestantes <= 3)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 3);

  const totalAlertas = tarefasAlerta.length + pedidosUrgentes.length + ausenciasPendentes.length + planosAlerta.length;

  if (totalAlertas === 0) return null;

  return (
    <Card className="border border-orange-200 bg-orange-50/30">
      <CardHeader className="py-2.5 px-4 border-b border-orange-200">
        <CardTitle className="text-xs font-bold text-orange-800 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          Alertas de Prazo
          <Badge className="bg-orange-500 text-white text-[9px] px-1.5 py-0 ml-auto">{totalAlertas}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">

        {/* Tarefas */}
        {tarefasAlerta.map(t => (
          <Link key={t.id} to={createPageUrl(t.tipo_area === "lider" ? "LiderArea" : "MonitorArea")}>
            <div className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer active:scale-[0.98] transition-all ${
              t.diasRestantes < 0 ? "bg-red-50 border-red-200" : t.diasRestantes === 0 ? "bg-orange-50 border-orange-200" : "bg-yellow-50 border-yellow-200"
            }`}>
              <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${t.diasRestantes < 0 ? "text-red-500" : "text-orange-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{t.titulo}</p>
                <p className="text-[10px] text-slate-500">Tarefa</p>
              </div>
              <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 ${
                t.diasRestantes < 0 ? "bg-red-500 text-white" :
                t.diasRestantes === 0 ? "bg-orange-500 text-white" : "bg-yellow-500 text-white"
              }`}>
                {t.diasRestantes < 0 ? `${Math.abs(t.diasRestantes)}d atraso` : t.diasRestantes === 0 ? "Hoje" : `${t.diasRestantes}d`}
              </Badge>
            </div>
          </Link>
        ))}

        {/* Pedidos urgentes */}
        {pedidosUrgentes.map(p => (
          <Link key={p.id} to={createPageUrl("OperacoesHub")}>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-red-50 border-red-200 cursor-pointer active:scale-[0.98] transition-all">
              <ShoppingCart className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{p.item}</p>
                <p className="text-[10px] text-slate-500">EPI Urgente — {p.solicitante}</p>
              </div>
              <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 flex-shrink-0">Urgente</Badge>
            </div>
          </Link>
        ))}

        {/* Ausências pendentes */}
        {ausenciasPendentes.map(a => (
          <Link key={a.id} to={createPageUrl("PessoasHub")}>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-blue-50 border-blue-200 cursor-pointer active:scale-[0.98] transition-all">
              <UserX className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{a.colaborador_nome}</p>
                <p className="text-[10px] text-slate-500">Ausência pendente — {a.tipo}</p>
              </div>
              <Badge className="bg-blue-500 text-white text-[9px] px-1.5 py-0 flex-shrink-0">Pendente</Badge>
            </div>
          </Link>
        ))}

        {/* Planos VDA */}
        {planosAlerta.map(p => (
          <Link key={p.id} to={createPageUrl("AuditoriaVDA")}>
            <div className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer active:scale-[0.98] transition-all ${
              p.diasRestantes < 0 ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"
            }`}>
              <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${p.diasRestantes < 0 ? "text-red-500" : "text-purple-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{p.nao_conformidade || "Plano VDA"}</p>
                <p className="text-[10px] text-slate-500">Plano de Ação VDA</p>
              </div>
              <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 ${p.diasRestantes < 0 ? "bg-red-500 text-white" : "bg-purple-500 text-white"}`}>
                {p.diasRestantes < 0 ? `${Math.abs(p.diasRestantes)}d atraso` : `${p.diasRestantes}d`}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}