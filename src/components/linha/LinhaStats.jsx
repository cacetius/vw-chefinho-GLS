import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, AlertTriangle, Car, CheckCircle } from "lucide-react";

const COLORS = ["#0066b1", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4"];

const STATUS_LABELS = {
  aguardando: "Aguardando",
  em_processo: "Em Processo",
  ok: "OK",
  alerta: "Alerta",
  erro: "Erro",
  concluido: "Concluído",
};

export default function LinhaStats({ carros }) {
  // Status
  const statusCount = carros.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCount).map(([s, n]) => ({
    name: STATUS_LABELS[s] || s,
    value: n,
  }));

  // Modelos
  const modeloCount = carros.reduce((acc, c) => {
    const m = c.modelo || "Sem modelo";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const modeloData = Object.entries(modeloCount)
    .map(([modelo, qtd]) => ({ modelo: modelo.replace("Polo ", "P.").replace("Tera ", "T."), qtd }))
    .sort((a, b) => b.qtd - a.qtd);

  // Problemas
  const problemasCount = {};
  carros.forEach(c => c.problemas?.forEach(p => {
    problemasCount[p.tipo] = (problemasCount[p.tipo] || 0) + 1;
  }));
  const problemasData = Object.entries(problemasCount).map(([tipo, qtd]) => ({ tipo, qtd }));

  const totalProblemas = carros.reduce((s, c) => s + (c.problemas?.length || 0), 0);
  const concluidos = carros.filter(c => c.status === "concluido").length;
  const comErro = carros.filter(c => c.status === "erro").length;

  if (carros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0066b1]/10 rounded-xl p-3 text-center">
          <Car className="w-4 h-4 text-[#0066b1] mx-auto mb-1" />
          <p className="text-xl font-bold text-[#0066b1]">{carros.length}</p>
          <p className="text-[9px] text-slate-500">Na Linha</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-emerald-600">{concluidos}</p>
          <p className="text-[9px] text-slate-500">Prontos</p>
        </div>
        <div className={`${comErro > 0 ? "bg-red-50" : "bg-slate-50"} rounded-xl p-3 text-center`}>
          <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${comErro > 0 ? "text-red-500" : "text-slate-400"}`} />
          <p className={`text-xl font-bold ${comErro > 0 ? "text-red-600" : "text-slate-500"}`}>{totalProblemas}</p>
          <p className="text-[9px] text-slate-500">Problemas</p>
        </div>
      </div>

      {/* Status Pie */}
      <Card className="border border-slate-200">
        <CardHeader className="py-3 px-4 border-b bg-slate-50">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#0066b1]" /> Status dos Veículos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={58} dataKey="value" label={({ name, percent }) => percent > 0.08 ? `${(percent*100).toFixed(0)}%` : ""} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legenda manual compacta */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[9px] text-slate-600">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modelos */}
      {modeloData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-[#0066b1]" /> Modelos na Linha
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={Math.max(100, modeloData.length * 32)}>
              <BarChart data={modeloData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="modelo" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="qtd" fill="#0066b1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Problemas */}
      {problemasData.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-3 px-4 border-b bg-red-50">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Problemas por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={Math.max(80, problemasData.length * 32)}>
              <BarChart data={problemasData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="qtd" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}