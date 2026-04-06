import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from "recharts";
import { TrendingUp, Users, ShoppingCart, Target } from "lucide-react";

const COLORS = ["#0066b1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

export default function GraficosGerais({ currentUser }) {
  const isSup = currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-graficos"],
    queryFn: () => base44.entities.PedidoEPI.list(),
    refetchInterval: 60000,
  });

  const { data: versatilidades = [] } = useQuery({
    queryKey: ["vers-graficos"],
    queryFn: () => base44.entities.Versatilidade.list(),
    refetchInterval: 60000,
  });

  const { data: objetivos = [] } = useQuery({
    queryKey: ["obj-graficos"],
    queryFn: () => base44.entities.Objetivo.list(),
    refetchInterval: 60000,
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ["audit-graficos"],
    queryFn: () => base44.entities.AuditoriaVDA.list("-data_auditoria"),
    refetchInterval: 60000,
  });

  // Gráfico de status dos pedidos EPI
  const pedidosStatusData = ["pendente", "aprovado", "reprovado", "entregue"].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: pedidos.filter(p => p.status === s).length,
  })).filter(d => d.value > 0);

  // Gráfico de habilidades por nível
  const habilidadesData = (() => {
    const acc = { nao_treinado: 0, em_treinamento: 0, treinado: 0, instrutor: 0 };
    versatilidades.forEach(v => v.habilidades?.forEach(h => { if (acc[h.nivel] !== undefined) acc[h.nivel]++; }));
    return [
      { name: "Não Treinado", value: acc.nao_treinado, fill: "#94a3b8" },
      { name: "Em Treinamento", value: acc.em_treinamento, fill: "#f59e0b" },
      { name: "Treinado", value: acc.treinado, fill: "#22c55e" },
      { name: "Instrutor", value: acc.instrutor, fill: "#0066b1" },
    ].filter(d => d.value > 0);
  })();

  // Gráfico de objetivos por categoria
  const objetivosData = ["seguranca", "qualidade", "producao", "processo"].map(cat => ({
    categoria: cat.charAt(0).toUpperCase() + cat.slice(1),
    total: objetivos.filter(o => o.categoria === cat).length,
    concluidos: objetivos.filter(o => o.categoria === cat && o.concluido).length,
  })).filter(d => d.total > 0);

  // Evolução de conformidade VDA
  const conformidadeData = auditorias.slice(-6).map(a => ({
    data: new Date(a.data_auditoria).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    conformidade: a.percentual_conformidade || 0,
  }));

  // Gastos por equipe (pedidos aprovados)
  const gastosPorEquipe = (() => {
    const acc = {};
    pedidos.filter(p => p.status === "aprovado" || p.status === "entregue").forEach(p => {
      const eq = p.equipe || "Sem equipe";
      acc[eq] = (acc[eq] || 0) + (p.valor_total || 0);
    });
    return Object.entries(acc).map(([equipe, valor]) => ({ equipe: equipe.slice(0, 10), valor: Math.round(valor) })).sort((a, b) => b.valor - a.valor).slice(0, 5);
  })();

  return (
    <div className="space-y-3">

      {/* Pedidos EPI por status */}
      {pedidosStatusData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5 text-[#0066b1]" /> Pedidos EPI por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="50%" height={120}>
                <PieChart>
                  <Pie data={pedidosStatusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                    {pedidosStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {pedidosStatusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habilidades da equipe */}
      {habilidadesData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Habilidades da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={habilidadesData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {habilidadesData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Objetivos por categoria */}
      {objetivosData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-emerald-600" /> Objetivos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={objetivosData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="categoria" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="concluidos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Concluídos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Conformidade VDA */}
      {conformidadeData.length > 1 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Conformidade VDA (últimas auditorias)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={conformidadeData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="data" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip formatter={v => [`${v}%`, "Conformidade"]} />
                <Bar dataKey="conformidade" fill="#0066b1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gastos por equipe */}
      {gastosPorEquipe.length > 0 && isSup && (
        <Card className="border border-slate-200">
          <CardHeader className="py-2.5 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-600" /> Gastos EPI por Equipe (R$)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={Math.max(80, gastosPorEquipe.length * 28)}>
              <BarChart data={gastosPorEquipe} layout="vertical" margin={{ top: 2, right: 16, bottom: 2, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="equipe" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip formatter={v => [`R$ ${v}`, "Gasto"]} />
                <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}