import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Target, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CORES = ["#0066b1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

export default function GastosEPI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mesSel, setMesSel] = useState(new Date());

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const mesRef = format(mesSel, "yyyy-MM");

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-gastos", mesRef],
    queryFn: () => base44.entities.PedidoEPI.list("-created_date", 500),
    enabled: !!currentUser
  });

  const { data: objetivos = [] } = useQuery({
    queryKey: ["objetivos-mes", mesRef],
    queryFn: () => base44.entities.Objetivo.list("-data_referencia", 500),
    enabled: !!currentUser
  });

  // Filtrar pedidos do mês selecionado (aprovados + entregues)
  const pedidosMes = pedidos.filter(p => {
    const data = p.data_solicitacao || p.created_date?.split("T")[0];
    return data && data.startsWith(mesRef) && (p.status === "aprovado" || p.status === "entregue");
  });

  // Consumo por setor/equipe
  const porSetor = {};
  pedidosMes.forEach(p => {
    const equipe = p.equipe || "Sem equipe";
    porSetor[equipe] = (porSetor[equipe] || 0) + (p.quantidade || 0);
  });
  const dadosSetor = Object.entries(porSetor)
    .map(([equipe, total]) => ({ equipe, total }))
    .sort((a, b) => b.total - a.total);

  // Consumo por item EPI
  const porItem = {};
  pedidosMes.forEach(p => {
    const item = p.item || "Outros";
    porItem[item] = (porItem[item] || 0) + (p.quantidade || 0);
  });
  const dadosItem = Object.entries(porItem)
    .map(([item, total]) => ({ item, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const totalMes = pedidosMes.reduce((s, p) => s + (p.quantidade || 0), 0);
  const qtdPedidos = pedidosMes.length;

  // Objetivos do mês para calendário circular
  const diasNoMes = getDaysInMonth(mesSel);
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const mapaObjetivos = {};
  objetivos.forEach(o => {
    if (!o.data_referencia) return;
    const mes = o.data_referencia.substring(0, 7);
    if (mes !== mesRef) return;
    const dia = parseInt(o.data_referencia.split("-")[2]);
    const key = `${dia}-${o.objetivo_id || "geral"}`;
    mapaObjetivos[key] = o.concluido ? "concluido" : o.status_especial || "nao_atingido";
  });

  // Status geral do dia
  const getDiaStatus = (dia) => {
    const ds = new Date(mesSel.getFullYear(), mesSel.getMonth(), dia).getDay();
    if (ds === 0 || ds === 6) return "fds";
    const keys = Object.keys(mapaObjetivos).filter(k => k.startsWith(`${dia}-`));
    if (keys.length === 0) return "vazio";
    if (keys.every(k => mapaObjetivos[k] === "concluido")) return "concluido";
    if (keys.some(k => mapaObjetivos[k] === "feriado")) return "feriado";
    return "nao_atingido";
  };

  const diasConcluidos = diasArray.filter(d => getDiaStatus(d) === "concluido").length;
  const diasUteis = diasArray.filter(d => !["fds", "feriado"].includes(getDiaStatus(d))).length;
  const pct = diasUteis > 0 ? Math.round((diasConcluidos / diasUteis) * 100) : 0;

  // SVG Calendário circular
  const RAIO = 80;
  const CENTRO = 110;
  const STROKE = 14;
  const total = diasArray.length;
  const angPorDia = (2 * Math.PI) / total;

  function polarToXY(angulo, r) {
    return {
      x: CENTRO + r * Math.cos(angulo - Math.PI / 2),
      y: CENTRO + r * Math.sin(angulo - Math.PI / 2),
    };
  }

  const COR_STATUS = {
    concluido: "#22c55e",
    nao_atingido: "#ef4444",
    feriado: "#94a3b8",
    fds: "#e2e8f0",
    vazio: "#f1f5f9",
  };

  const navMes = (delta) => setMesSel(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d2d6b] to-[#0066b1] rounded-xl py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Acompanhamento de Gastos</h1>
            <p className="text-blue-200 text-xs">EPIs & Objetivos do Mês</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
            <button onClick={() => navMes(-1)} className="text-white hover:text-blue-200 p-0.5">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white text-xs font-semibold capitalize w-24 text-center">
              {format(mesSel, "MMM yyyy", { locale: ptBR })}
            </span>
            <button onClick={() => navMes(1)} className="text-white hover:text-blue-200 p-0.5">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
              <p className="text-[9px] text-slate-500">Total Consumido</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{totalMes} unid.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-[9px] text-slate-500">Pedidos</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{qtdPedidos}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              <p className="text-[9px] text-slate-500">Obj. Atingidos</p>
            </div>
            <p className="text-lg font-bold text-purple-600">{pct}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Gastos por Setor + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Barras por setor */}
        <Card className="border-slate-200 shadow-sm">
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#0066b1]" /> Consumo por Setor (unid.)
            </p>
          </div>
          <CardContent className="pt-2 pb-3">
            {dadosSetor.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">Sem gastos no mês</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dadosSetor} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="equipe" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${v}`} />
                  <Tooltip formatter={(v) => [`${v} unid.`, "Total"]} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {dadosSetor.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie por item */}
        <Card className="border-slate-200 shadow-sm">
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-green-600" /> Consumo por Item EPI
            </p>
          </div>
          <CardContent className="pt-2 pb-3">
            {dadosItem.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">Sem gastos no mês</div>
            ) : (
              <div className="flex items-center gap-2">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={dadosItem} dataKey="total" nameKey="item" cx="50%" cy="50%" outerRadius={55} innerRadius={28}>
                      {dadosItem.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} unid.`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {dadosItem.map((d, i) => (
                    <div key={d.item} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CORES[i % CORES.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-slate-700 truncate">{d.item}</p>
                        <p className="text-[9px] text-slate-400">{d.total} unid.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendário Circular de Objetivos */}
      <Card className="border-slate-200 shadow-sm">
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600" /> Objetivos do Mês — Calendário Circular
          </p>
          <span className="text-[10px] text-slate-400 capitalize">{format(mesSel, "MMMM yyyy", { locale: ptBR })}</span>
        </div>
        <CardContent className="flex flex-col items-center pb-4">
          <svg width={CENTRO * 2} height={CENTRO * 2} viewBox={`0 0 ${CENTRO * 2} ${CENTRO * 2}`}>
            {/* Fundo cinza */}
            <circle cx={CENTRO} cy={CENTRO} r={RAIO} fill="none" stroke="#f1f5f9" strokeWidth={STROKE + 4} />

            {/* Arcos por dia */}
            {diasArray.map((dia) => {
              const ang = angPorDia;
              const inicio = (dia - 1) * ang - Math.PI / 2;
              const fim = dia * ang - Math.PI / 2;
              const gap = 0.02;
              const p1 = polarToXY(inicio + gap, RAIO);
              const p2 = polarToXY(fim - gap, RAIO);
              const largArc = ang - 2 * gap > Math.PI ? 1 : 0;
              const status = getDiaStatus(dia);
              const cor = COR_STATUS[status];
              return (
                <path
                  key={dia}
                  d={`M ${p1.x} ${p1.y} A ${RAIO} ${RAIO} 0 ${largArc} 1 ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={cor}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Números de dias (só múltiplos de 5) */}
            {diasArray.filter(d => d % 5 === 0 || d === 1).map((dia) => {
              const ang = (dia - 0.5) * angPorDia - Math.PI / 2;
              const pos = polarToXY(ang, RAIO + STROKE + 8);
              return (
                <text key={dia} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7" fill="#94a3b8" fontWeight="500">{dia}</text>
              );
            })}

            {/* Centro: percentual */}
            <text x={CENTRO} y={CENTRO - 10} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">{pct}%</text>
            <text x={CENTRO} y={CENTRO + 10} textAnchor="middle" fontSize="9" fill="#64748b">atingidos</text>
            <text x={CENTRO} y={CENTRO + 22} textAnchor="middle" fontSize="8" fill="#94a3b8">{diasConcluidos}/{diasUteis} dias</text>
          </svg>

          {/* Legenda */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { cor: "#22c55e", label: "Atingido" },
              { cor: "#ef4444", label: "Não Atingido" },
              { cor: "#94a3b8", label: "Feriado" },
              { cor: "#e2e8f0", label: "Final de Semana" },
            ].map(({ cor, label }) => (
              <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: cor }} />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de pedidos do mês */}
      {pedidosMes.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-bold text-slate-700">Pedidos aprovados no mês</p>
          </div>
          <CardContent className="pt-2 pb-2">
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {pedidosMes.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.item}</p>
                    <p className="text-[10px] text-slate-400">{p.equipe || "—"} • {p.solicitante}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-bold text-green-700">{p.quantidade || 0} unid.</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${p.status === "entregue" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}