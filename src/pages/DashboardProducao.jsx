import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Car, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Zap, Activity, RefreshCw, Timer, BarChart2
} from "lucide-react";
import { motion } from "framer-motion";
import AlertasLinha from "../components/linha/AlertasLinha";

const STATUS_COLORS = {
  aguardando: "#94a3b8",
  em_processo: "#3b82f6",
  ok: "#22c55e",
  alerta: "#f59e0b",
  erro: "#ef4444",
  concluido: "#10b981",
};

export default function DashboardProducao() {
  const [currentUser, setCurrentUser] = useState(null);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
    const t = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const { data: carros = [], refetch, isLoading } = useQuery({
    queryKey: ["carros-dashboard"],
    queryFn: () => base44.entities.CarroLinha.list("-created_date"),
    refetchInterval: 10000,
  });

  const { data: estoqueItens = [] } = useQuery({
    queryKey: ["estoque-dash"],
    queryFn: () => base44.entities.EstoqueEPI.list(),
    refetchInterval: 60000,
  });

  // ── Métricas ──────────────────────────────────────────
  const totalNaLinha = carros.length;
  const concluidos = carros.filter(c => c.status === "concluido");
  const comErro = carros.filter(c => c.status === "erro");
  const emProcesso = carros.filter(c => c.status === "em_processo");
  const comAlerta = carros.filter(c => c.status === "alerta");

  // Taxa de erros %
  const taxaErro = totalNaLinha > 0 ? ((comErro.length / totalNaLinha) * 100).toFixed(1) : 0;

  // Tempo médio de ciclo (minutos) - carros com tempo_entrada
  const carrosComTempo = carros.filter(c => c.tempo_entrada && c.status === "concluido");
  const tempoMedioCiclo = carrosComTempo.length > 0
    ? Math.round(carrosComTempo.reduce((s, c) => {
        const mins = (new Date() - new Date(c.tempo_entrada)) / 60000;
        return s + mins;
      }, 0) / carrosComTempo.length)
    : 0;

  // Carros concluídos na última hora
  const umaHoraAtras = new Date(Date.now() - 3600000);
  const concluidosUltimaHora = concluidos.filter(c =>
    c.updated_date && new Date(c.updated_date) >= umaHoraAtras
  ).length;

  // Distribuição por status para gráfico
  const statusData = Object.entries(
    carros.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
  ).map(([status, qtd]) => ({
    status: status.replace("_", " "),
    qtd,
    fill: STATUS_COLORS[status] || "#94a3b8"
  }));

  // Distribuição por estação (top 8 com mais carros)
  const estacaoData = Object.entries(
    carros.reduce((acc, c) => { acc[c.estacao_atual] = (acc[c.estacao_atual] || 0) + 1; return acc; }, {})
  )
    .map(([est, qtd]) => ({ est: est.replace(/_/g, " ").replace("chaparia ", "").replace("pintura ", ""), qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 8);

  // Problemas por tipo
  const problemasData = (() => {
    const acc = {};
    carros.forEach(c => c.problemas?.forEach(p => { acc[p.tipo] = (acc[p.tipo] || 0) + 1; }));
    return Object.entries(acc).map(([tipo, qtd]) => ({ tipo, qtd }));
  })();

  // Estoque crítico
  const estoqueCritico = estoqueItens.filter(i => i.quantidade_atual <= i.quantidade_minima);

  const KPIS = [
    { label: "Na Linha", value: totalNaLinha, icon: Car, color: "text-[#0066b1]", bg: "bg-blue-50" },
    { label: "Conc./Hora", value: concluidosUltimaHora, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Taxa Erro", value: `${taxaErro}%`, icon: AlertTriangle, color: comErro.length > 0 ? "text-red-600" : "text-slate-400", bg: comErro.length > 0 ? "bg-red-50" : "bg-slate-50" },
    { label: "Ciclo Médio", value: tempoMedioCiclo > 0 ? `${tempoMedioCiclo}m` : "—", icon: Timer, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066b1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#0066b1] rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Dashboard Produção</h1>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Tempo real · {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3" /> Atualizar
        </Button>
      </div>

      {/* Alertas ativos */}
      <AlertasLinha carros={carros} currentUser={currentUser} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {KPIS.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border border-slate-200">
              <CardContent className="p-2.5 flex flex-col items-center text-center">
                <div className={`w-7 h-7 ${bg} rounded-lg mb-1 flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Status + Em processo/erro */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border border-slate-200">
          <CardContent className="p-3 flex flex-col items-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{concluidos.length}</p>
            <p className="text-[10px] text-slate-500">Concluídos hoje</p>
          </CardContent>
        </Card>
        <Card className={`border ${comErro.length > 0 ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}>
          <CardContent className="p-3 flex flex-col items-center">
            <AlertTriangle className={`w-5 h-5 mb-1 ${comErro.length > 0 ? "text-red-500" : "text-slate-300"}`} />
            <p className={`text-2xl font-bold ${comErro.length > 0 ? "text-red-600" : "text-slate-400"}`}>{comErro.length}</p>
            <p className="text-[10px] text-slate-500">Com erro</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico: Distribuição por status */}
      {statusData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-[#0066b1]" /> Status dos Veículos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={statusData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip formatter={v => [v, "Qtd"]} />
                <Bar dataKey="qtd" radius={[4, 4, 0, 0]}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico: Carros por estação */}
      {estacaoData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Ocupação por Estação (Top 8)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={Math.max(100, estacaoData.length * 28)}>
              <BarChart data={estacaoData} layout="vertical" margin={{ top: 2, right: 16, bottom: 2, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                <YAxis dataKey="est" type="category" tick={{ fontSize: 9 }} width={64} />
                <Tooltip />
                <Bar dataKey="qtd" fill="#0066b1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Problemas por tipo */}
      {problemasData.length > 0 && (
        <Card className="border border-red-200 bg-red-50/30">
          <CardHeader className="py-2.5 px-4 border-b border-red-200">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" /> Problemas Ativos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {problemasData.map(({ tipo, qtd }) => {
                const total = problemasData.reduce((s, d) => s + d.qtd, 0);
                const pct = Math.round((qtd / total) * 100);
                return (
                  <div key={tipo}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-700 capitalize">{tipo}</span>
                      <span className="font-semibold text-red-700">{qtd}</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estoque crítico de EPI */}
      {estoqueCritico.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardHeader className="py-2.5 px-4 border-b border-amber-200">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> EPIs em Estoque Crítico ({estoqueCritico.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {estoqueCritico.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-800 truncate">{item.item}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5">
                    {item.quantidade_atual}/{item.quantidade_minima}
                  </Badge>
                </div>
              </div>
            ))}
            {estoqueCritico.length > 4 && (
              <p className="text-[10px] text-amber-600">+{estoqueCritico.length - 4} outros itens críticos</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Carros com erro - ações rápidas */}
      {comErro.length > 0 && (
        <Card className="border border-red-300">
          <CardHeader className="py-2.5 px-4 border-b bg-red-50">
            <CardTitle className="text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Veículos com Erro — Ação Imediata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {comErro.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-800 truncate">{c.modelo}</p>
                  <p className="text-[10px] text-red-500 font-mono">{c.chassi?.slice(-8)} · {c.estacao_atual?.replace(/_/g, " ")}</p>
                </div>
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 flex-shrink-0">
                  {c.problemas?.length || 0} prob.
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}