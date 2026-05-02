import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { Activity } from "lucide-react";

const COLORS_STATUS = {
  pendente: "#f59e0b",
  em_andamento: "#3b82f6",
  concluida: "#10b981",
  cancelada: "#94a3b8",
};

const COLORS_EPI = {
  pendente: "#f59e0b",
  aprovado: "#10b981",
  reprovado: "#ef4444",
  entregue: "#3b82f6",
};

const COLORS_NIVEL = {
  nao_treinado: "#e2e8f0",
  em_treinamento: "#fbbf24",
  treinado: "#34d399",
  instrutor: "#6366f1",
};

const NIVEL_LABEL = {
  nao_treinado: "Não treinado",
  em_treinamento: "Em treinamento",
  treinado: "Treinado",
  instrutor: "Instrutor",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
      <p className="font-semibold text-slate-800">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} itens</p>
    </div>
  );
}

export default function DashboardEquipe({ tarefas = [], pedidos = [], versatilidades = [], atividades = [] }) {
  // Tarefas por status
  const tarefasData = ["pendente", "em_andamento", "concluida"].map(s => ({
    name: s === "pendente" ? "Pendente" : s === "em_andamento" ? "Andamento" : "Concluída",
    value: tarefas.filter(t => t.status === s).length,
    color: COLORS_STATUS[s],
  })).filter(d => d.value > 0);

  // EPI por status
  const epiData = ["pendente", "aprovado", "reprovado", "entregue"].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: pedidos.filter(p => p.status === s).length,
    color: COLORS_EPI[s],
  })).filter(d => d.value > 0);

  // Logística por status
  const logData = ["pendente", "em_andamento", "concluida"].map(s => ({
    name: s === "pendente" ? "Pend." : s === "em_andamento" ? "Andamento" : "Concluída",
    value: atividades.filter(a => a.status === s).length,
  }));

  // Versatilidade — habilidades por nível
  const nivelCount = { nao_treinado: 0, em_treinamento: 0, treinado: 0, instrutor: 0 };
  versatilidades.forEach(v => {
    (v.habilidades || []).forEach(h => {
      if (nivelCount[h.nivel] !== undefined) nivelCount[h.nivel]++;
    });
  });
  const versData = Object.entries(nivelCount).map(([k, v]) => ({
    name: NIVEL_LABEL[k],
    value: v,
    color: COLORS_NIVEL[k],
  })).filter(d => d.value > 0);

  const empty = (msg) => (
    <div className="flex items-center justify-center h-20 text-xs text-slate-400">{msg}</div>
  );

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5" /> Dashboard da Equipe
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Tarefas */}
        <Card className="border border-slate-200 col-span-1">
          <CardHeader className="py-2.5 px-3 border-b border-slate-100">
            <CardTitle className="text-[11px] font-bold text-slate-700">📋 Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {tarefasData.length === 0 ? empty("Sem dados") : (
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={tarefasData} dataKey="value" cx="50%" cy="50%" outerRadius={42} innerRadius={22}>
                    {tarefasData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* EPI */}
        <Card className="border border-slate-200 col-span-1">
          <CardHeader className="py-2.5 px-3 border-b border-slate-100">
            <CardTitle className="text-[11px] font-bold text-slate-700">🛡️ Pedidos EPI</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {epiData.length === 0 ? empty("Sem dados") : (
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={epiData} dataKey="value" cx="50%" cy="50%" outerRadius={42} innerRadius={22}>
                    {epiData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Logística — barra full width */}
        <Card className="border border-slate-200 col-span-2">
          <CardHeader className="py-2.5 px-3 border-b border-slate-100">
            <CardTitle className="text-[11px] font-bold text-slate-700">🚚 Logística</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {atividades.length === 0 ? empty("Sem atividades") : (
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={logData} margin={{ top: 0, right: 8, left: -28, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qtd" radius={[4, 4, 0, 0]}>
                    {logData.map((d, i) => (
                      <Cell key={i} fill={["#f59e0b", "#3b82f6", "#10b981"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Versatilidade — full width */}
        <Card className="border border-slate-200 col-span-2">
          <CardHeader className="py-2.5 px-3 border-b border-slate-100">
            <CardTitle className="text-[11px] font-bold text-slate-700">👷 Versatilidade — Níveis de Habilidade</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {versData.length === 0 ? empty("Sem habilidades cadastradas") : (
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={versData} margin={{ top: 0, right: 8, left: -28, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qtd" radius={[4, 4, 0, 0]}>
                    {versData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}