import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Save, Copy, Download, ChevronLeft, ChevronRight,
  Check, X, Edit2, AlertTriangle, FileText
} from "lucide-react";
import { format, getDaysInMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  atingido:    { bg: "bg-green-500",  text: "text-white",      label: "✓", ring: "#22c55e" },
  nao_atingido:{ bg: "bg-red-500",    text: "text-white",      label: "✗", ring: "#ef4444" },
  feriado:     { bg: "bg-slate-300",  text: "text-slate-500",  label: "—", ring: "#94a3b8" },
  vazio:       { bg: "bg-white",      text: "text-slate-300",  label: "",  ring: "#e2e8f0" },
};

const calcStatusGeral = (d) => {
  if (!d) return "vazio";
  if (d.acidentes_status === "nao_atingido") return "nao_atingido";
  if ([d.qualidade_status, d.producao_status, d.retrabalho_status, d.trabalho_padronizado_status]
        .some(s => s === "nao_atingido")) return "nao_atingido";
  if ([d.acidentes_status, d.qualidade_status, d.producao_status, d.retrabalho_status, d.trabalho_padronizado_status]
        .every(s => s === "feriado")) return "feriado";
  if ([d.acidentes_status, d.qualidade_status, d.producao_status, d.retrabalho_status, d.trabalho_padronizado_status]
        .every(s => s === "atingido")) return "atingido";
  if ([d.acidentes_status, d.qualidade_status, d.producao_status, d.retrabalho_status, d.trabalho_padronizado_status]
        .some(s => s)) return "nao_atingido";
  return "vazio";
};

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeaderField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  useEffect(() => { setVal(value || ""); }, [value]);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
      {editing ? (
        <div className="flex gap-1 items-center">
          <input className="border-b border-[#0066b1] text-xs font-semibold text-slate-800 outline-none bg-transparent flex-1"
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { onChange(val); setEditing(false); }}}
            autoFocus />
          <button onClick={() => { onChange(val); setEditing(false); }}><Check className="w-3 h-3 text-green-600" /></button>
          <button onClick={() => setEditing(false)}><X className="w-3 h-3 text-red-400" /></button>
        </div>
      ) : (
        <button className="text-xs font-semibold text-slate-800 text-left flex items-center gap-1 hover:text-[#0066b1]" onClick={() => setEditing(true)}>
          {value || <span className="text-slate-300 italic">—</span>}
          <Edit2 className="w-2.5 h-2.5 opacity-40" />
        </button>
      )}
    </div>
  );
}

// Gráfico circular (radial dos dias)
function CircularCalendar({ days, dailyMap, onDayClick, month, year }) {
  const totalDays = getDaysInMonth(new Date(year, month - 1));
  const cx = 140, cy = 140, r = 110;
  const innerR = 55;

  return (
    <div className="flex flex-col items-center">
      <svg width="280" height="280" viewBox="0 0 280 280">
        {/* Centro */}
        <circle cx={cx} cy={cy} r={innerR} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs" fontSize="10" fill="#0066b1" fontWeight="bold">
          {MESES_PT[month - 1]}
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{year}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8" fill="#94a3b8">
          {days.filter(d => dailyMap[d]?.status_geral === "atingido").length}/{totalDays} dias ✓
        </text>

        {days.map((d) => {
          const angle = ((d - 1) / totalDays) * 2 * Math.PI - Math.PI / 2;
          const nextAngle = (d / totalDays) * 2 * Math.PI - Math.PI / 2;
          const gap = 0.04;

          const x1 = cx + innerR * Math.cos(angle + gap);
          const y1 = cy + innerR * Math.sin(angle + gap);
          const x2 = cx + r * Math.cos(angle + gap);
          const y2 = cy + r * Math.sin(angle + gap);
          const x3 = cx + r * Math.cos(nextAngle - gap);
          const y3 = cy + r * Math.sin(nextAngle - gap);
          const x4 = cx + innerR * Math.cos(nextAngle - gap);
          const y4 = cy + innerR * Math.sin(nextAngle - gap);

          const daily = dailyMap[d];
          const status = daily?.status_geral || "vazio";
          const cfg = STATUS_COLOR[status] || STATUS_COLOR.vazio;

          const midAngle = ((d - 0.5) / totalDays) * 2 * Math.PI - Math.PI / 2;
          const labelR = (r + innerR) / 2;
          const lx = cx + labelR * Math.cos(midAngle);
          const ly = cy + labelR * Math.sin(midAngle);

          const fillColor = {
            atingido: "#22c55e", nao_atingido: "#ef4444",
            feriado: "#94a3b8", vazio: "#f1f5f9"
          }[status] || "#f1f5f9";

          const isFeriado = status === "feriado";

          return (
            <g key={d} onClick={() => onDayClick(d)} style={{ cursor: "pointer" }}>
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`}
                fill={fillColor}
                stroke="white"
                strokeWidth="1.5"
                opacity={isFeriado ? 0.5 : 1}
              />
              {isFeriado && (
                <line
                  x1={cx + (innerR + 2) * Math.cos(midAngle - 0.06)}
                  y1={cy + (innerR + 2) * Math.sin(midAngle - 0.06)}
                  x2={cx + (r - 2) * Math.cos(midAngle + 0.06)}
                  y2={cy + (r - 2) * Math.sin(midAngle + 0.06)}
                  stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"
                />
              )}
              <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize="7" fill={status === "vazio" ? "#94a3b8" : "white"} fontWeight="bold">
                {d}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legenda */}
      <div className="flex flex-wrap gap-3 justify-center mt-1">
        {[
          { color: "#22c55e", label: "Atingido" },
          { color: "#ef4444", label: "Não atingido" },
          { color: "#94a3b8", label: "Feriado/Sem prod." },
          { color: "#f1f5f9", label: "Sem preenchimento", border: "#e2e8f0" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color, border: l.border ? `1px solid ${l.border}` : "none" }} />
            <span className="text-[8px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal de edição de dia
function DayModal({ dia, entry, onSave, onClose }) {
  const STATUS_OPTIONS = [
    { value: "atingido", label: "✅ Atingido" },
    { value: "nao_atingido", label: "❌ Não atingido" },
    { value: "feriado", label: "⚪ Feriado / Sem produção" },
  ];
  const [form, setForm] = useState({
    acidentes_status: "atingido",
    acidentes_observacao: "",
    qualidade_status: "atingido",
    qualidade_indicador: "",
    qualidade_area: "ZP6",
    qualidade_observacao: "",
    producao_status: "atingido",
    producao_volume: "",
    producao_observacao: "",
    retrabalho_status: "atingido",
    retrabalho_indicador: "",
    retrabalho_area: "ZP8",
    retrabalho_observacao: "",
    trabalho_padronizado_status: "atingido",
    trabalho_padronizado_observacao: "",
    responsavel: "",
    ...(entry || {}),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0066b1] text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
          <div>
            <p className="font-bold text-sm">Dia {dia}</p>
            <p className="text-[10px] opacity-70">Registro de objetivos</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Acidentes */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">1. Acidentes — Meta: 0 acidentes</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {STATUS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("acidentes_status", o.value)}
                  className={`text-[9px] py-1.5 rounded font-semibold border transition-all ${form.acidentes_status === o.value ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-600 border-slate-200"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <input className="w-full border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Observação" value={form.acidentes_observacao} onChange={e => set("acidentes_observacao", e.target.value)} />
          </div>

          {/* Qualidade */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">2. Qualidade — Meta: D/1000 por turno</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {STATUS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("qualidade_status", o.value)}
                  className={`text-[9px] py-1.5 rounded font-semibold border transition-all ${form.qualidade_status === o.value ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-600 border-slate-200"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className="border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Indicador D/1000" value={form.qualidade_indicador} onChange={e => set("qualidade_indicador", e.target.value)} />
              <input className="border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Área (ex: ZP6)" value={form.qualidade_area} onChange={e => set("qualidade_area", e.target.value)} />
            </div>
            <input className="w-full border border-slate-100 rounded px-2 py-1 text-xs mt-1" placeholder="Observação" value={form.qualidade_observacao} onChange={e => set("qualidade_observacao", e.target.value)} />
          </div>

          {/* Produção */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">3. Cumprimento do Programa — Meta: 100%</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {STATUS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("producao_status", o.value)}
                  className={`text-[9px] py-1.5 rounded font-semibold border transition-all ${form.producao_status === o.value ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-600 border-slate-200"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <input type="number" className="w-full border border-slate-100 rounded px-2 py-1 text-xs mb-1" placeholder="Volume conforme programa" value={form.producao_volume} onChange={e => set("producao_volume", e.target.value)} />
            <input className="w-full border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Observação" value={form.producao_observacao} onChange={e => set("producao_observacao", e.target.value)} />
          </div>

          {/* Retrabalho */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">4. Retrabalhos / Peças NOK — Meta: D/1000</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {STATUS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("retrabalho_status", o.value)}
                  className={`text-[9px] py-1.5 rounded font-semibold border transition-all ${form.retrabalho_status === o.value ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-600 border-slate-200"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-1">
              <input type="number" className="border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Indicador D/1000" value={form.retrabalho_indicador} onChange={e => set("retrabalho_indicador", e.target.value)} />
              <input className="border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Área (ex: ZP8)" value={form.retrabalho_area} onChange={e => set("retrabalho_area", e.target.value)} />
            </div>
            <input className="w-full border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Observação" value={form.retrabalho_observacao} onChange={e => set("retrabalho_observacao", e.target.value)} />
          </div>

          {/* Trabalho Padronizado */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">5. Trabalho Padronizado — Meta: 1 op./turno</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {STATUS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("trabalho_padronizado_status", o.value)}
                  className={`text-[9px] py-1.5 rounded font-semibold border transition-all ${form.trabalho_padronizado_status === o.value ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-600 border-slate-200"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <input className="w-full border border-slate-100 rounded px-2 py-1 text-xs" placeholder="Observação" value={form.trabalho_padronizado_observacao} onChange={e => set("trabalho_padronizado_observacao", e.target.value)} />
          </div>

          {/* Responsável */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Responsável pelo lançamento</label>
            <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.responsavel} onChange={e => set("responsavel", e.target.value)} />
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <Button size="sm" className="bg-[#0066b1] flex-1" onClick={() => onSave(form)}>
            <Check className="w-3 h-3 mr-1" /> Salvar Dia {dia}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MonthlyGoals({ currentUser }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [monthlyGoal, setMonthlyGoal] = useState(null);
  const [dailyMap, setDailyMap] = useState({}); // {dia: entry}
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    lider_area: "Edilson",
    centro_custo: "3338",
    time: "2",
    turno: "2º",
    elaborado_por: currentUser?.full_name || "Matheus",
    data_elaboracao: format(new Date(), "yyyy-MM-dd"),
    area: "",
  });

  const totalDays = getDaysInMonth(new Date(ano, mes - 1));
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  useEffect(() => { loadGoals(); }, [mes, ano]);

  const loadGoals = async () => {
    setLoading(true);
    const goals = await base44.entities.MonitorMonthlyGoals.filter({ mes, ano });
    const goal = goals[0] || null;
    setMonthlyGoal(goal);
    if (goal) {
      const [dailyList, weeklyList] = await Promise.all([
        base44.entities.MonitorDailyGoal.filter({ monthly_goal_id: goal.id }),
        base44.entities.MonitorWeeklyGoal.filter({ monthly_goal_id: goal.id }),
      ]);
      const map = {};
      dailyList.forEach(d => { map[d.dia_mes] = d; });
      setDailyMap(map);
      const wMap = [1,2,3,4,5].map(s => weeklyList.find(w => w.semana === s) || { semana: s, monthly_goal_id: goal.id });
      setWeeklyGoals(wMap);
    } else {
      setDailyMap({});
      setWeeklyGoals([1,2,3,4,5].map(s => ({ semana: s })));
    }
    setLoading(false);
  };

  const criarControle = async () => {
    const created = await base44.entities.MonitorMonthlyGoals.create({ ...newForm, mes, ano, status: "ativo" });
    setMonthlyGoal(created);
    setWeeklyGoals([1,2,3,4,5].map(s => ({ semana: s, monthly_goal_id: created.id })));
    setDailyMap({});
    setShowNewModal(false);
  };

  const duplicarMesAnterior = async () => {
    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAno = mes === 1 ? ano - 1 : ano;
    const prev = await base44.entities.MonitorMonthlyGoals.filter({ mes: prevMes, ano: prevAno });
    if (!prev[0]) return alert("Nenhum controle no mês anterior");
    const created = await base44.entities.MonitorMonthlyGoals.create({
      ...prev[0], id: undefined, mes, ano, status: "ativo"
    });
    setMonthlyGoal(created);
    setDailyMap({});
    setWeeklyGoals([1,2,3,4,5].map(s => ({ semana: s, monthly_goal_id: created.id })));
  };

  const saveDayEntry = async (dia, formData) => {
    setSaving(true);
    const statusGeral = calcStatusGeral(formData);
    const payload = { ...formData, monthly_goal_id: monthlyGoal.id, dia_mes: dia, status_geral: statusGeral };
    const existing = dailyMap[dia];
    let saved;
    if (existing?.id) {
      saved = await base44.entities.MonitorDailyGoal.update(existing.id, payload);
    } else {
      saved = await base44.entities.MonitorDailyGoal.create(payload);
    }
    setDailyMap(prev => ({ ...prev, [dia]: saved }));
    setSaving(false);
    setEditDay(null);
  };

  const saveWeeklyGoal = async (semana, field, value) => {
    const w = weeklyGoals.find(wg => wg.semana === semana) || { semana, monthly_goal_id: monthlyGoal?.id };
    const updated = { ...w, [field]: value };
    if (w.id) {
      await base44.entities.MonitorWeeklyGoal.update(w.id, updated);
    } else if (monthlyGoal?.id) {
      const created = await base44.entities.MonitorWeeklyGoal.create({ ...updated, monthly_goal_id: monthlyGoal.id });
      setWeeklyGoals(prev => prev.map(wg => wg.semana === semana ? created : wg));
      return;
    }
    setWeeklyGoals(prev => prev.map(wg => wg.semana === semana ? updated : wg));
  };

  const updateHeader = async (field, value) => {
    if (!monthlyGoal?.id) return;
    const updated = { ...monthlyGoal, [field]: value };
    await base44.entities.MonitorMonthlyGoals.update(monthlyGoal.id, updated);
    setMonthlyGoal(updated);
  };

  // Stats
  const diasPreenchidos = Object.keys(dailyMap).length;
  const diasAtingidos = Object.values(dailyMap).filter(d => d.status_geral === "atingido").length;
  const diasNaoAtingidos = Object.values(dailyMap).filter(d => d.status_geral === "nao_atingido").length;
  const diasFeriado = Object.values(dailyMap).filter(d => d.status_geral === "feriado").length;
  const acidentes = Object.values(dailyMap).filter(d => d.acidentes_status === "nao_atingido").length;
  const pctAtingimento = diasPreenchidos > 0 ? Math.round((diasAtingidos / diasPreenchidos) * 100) : 0;
  const pendencias = totalDays - diasPreenchidos;

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Cabeçalho industrial */}
      <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-[#0066b1] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-wider">VW</span>
            <div>
              <p className="text-xs font-bold leading-tight">CONTROLE DE OBJETIVOS DO MÊS</p>
              <p className="text-[9px] opacity-70">Acompanhamento de Metas Diárias e Semanais / ZP7</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setShowNewModal(true)}>
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={duplicarMesAnterior}>
              <Copy className="w-3 h-3 mr-1" /> Duplicar Ant.
            </Button>
          </div>
        </div>

        {/* Navegação de mês */}
        <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <button onClick={() => { if (mes === 1) { setMes(12); setAno(a => a - 1); } else setMes(m => m - 1); }} className="p-1 rounded hover:bg-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <p className="text-sm font-bold text-slate-800 capitalize">{MESES_PT[mes - 1]} / {ano}</p>
          <button onClick={() => { if (mes === 12) { setMes(1); setAno(a => a + 1); } else setMes(m => m + 1); }} className="p-1 rounded hover:bg-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Campos do cabeçalho */}
        {monthlyGoal && (
          <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-200">
            <HeaderField label="Líder da Área" value={monthlyGoal.lider_area} onChange={v => updateHeader("lider_area", v)} />
            <HeaderField label="Centro de Custo" value={monthlyGoal.centro_custo} onChange={v => updateHeader("centro_custo", v)} />
            <HeaderField label="Time" value={monthlyGoal.time} onChange={v => updateHeader("time", v)} />
            <HeaderField label="Turno" value={monthlyGoal.turno} onChange={v => updateHeader("turno", v)} />
            <HeaderField label="Elaborado por" value={monthlyGoal.elaborado_por} onChange={v => updateHeader("elaborado_por", v)} />
            <HeaderField label="Data" value={monthlyGoal.data_elaboracao} onChange={v => updateHeader("data_elaboracao", v)} />
            <HeaderField label="Área / Célula" value={monthlyGoal.area} onChange={v => updateHeader("area", v)} />
          </div>
        )}

        {/* Dashboard de stats */}
        <div className="px-3 py-2 border-b border-slate-200 grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
          {[
            { label: "Dias Mês",      value: totalDays,       color: "text-slate-700" },
            { label: "Preenchidos",   value: diasPreenchidos, color: "text-[#0066b1]" },
            { label: "Atingidos",     value: diasAtingidos,   color: "text-green-600" },
            { label: "Não atingidos", value: diasNaoAtingidos,color: diasNaoAtingidos > 0 ? "text-red-600" : "text-slate-400" },
            { label: "Sem produção",  value: diasFeriado,     color: "text-slate-500" },
            { label: "% Atingimento", value: `${pctAtingimento}%`, color: pctAtingimento >= 80 ? "text-green-600" : "text-amber-500" },
            { label: "Pendências",    value: pendencias,      color: pendencias > 0 ? "text-amber-500" : "text-green-600" },
            { label: "Acidentes",     value: acidentes,       color: acidentes > 0 ? "text-red-600" : "text-green-600" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[7px] text-slate-400 uppercase tracking-wider leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {!monthlyGoal ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-slate-400 text-sm">Nenhum controle para {MESES_PT[mes - 1]} / {ano}</p>
          <div className="flex gap-2">
            <Button className="bg-[#0066b1]" onClick={() => setShowNewModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Novo Controle Mensal
            </Button>
            <Button variant="outline" onClick={duplicarMesAnterior}>
              <Copy className="w-4 h-4 mr-1" /> Duplicar Mês Anterior
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Layout: gráfico + tabela diária */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Gráfico circular */}
            <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
                Visão Mensal — Gráfico Circular
              </div>
              <div className="p-4 flex justify-center">
                <CircularCalendar days={days} dailyMap={dailyMap} onDayClick={setEditDay} month={mes} year={ano} />
              </div>
            </div>

            {/* Tabela de dias */}
            <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                <span>Registro Diário</span>
                <Button size="sm" variant="outline" className="h-6 text-[9px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setEditDay(new Date().getDate())}>
                  <Plus className="w-2.5 h-2.5 mr-1" /> Hoje
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[340px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      {["Dia", "Acid.", "Qual.", "Prod.", "Retrab.", "TP", "Status"].map(h => (
                        <th key={h} className="border border-slate-200 px-1.5 py-1 text-[9px] font-bold text-slate-600 text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(d => {
                      const entry = dailyMap[d];
                      const sg = entry?.status_geral || "vazio";
                      const cfg = STATUS_COLOR[sg];
                      const dow = getDay(new Date(ano, mes - 1, d));
                      const isWkd = dow === 0 || dow === 6;
                      return (
                        <tr key={d}
                          className={`cursor-pointer hover:bg-slate-50 ${isWkd ? "opacity-50" : ""}`}
                          onClick={() => setEditDay(d)}
                        >
                          <td className="border border-slate-100 px-1.5 py-1 font-bold text-slate-700 text-center">{d}</td>
                          {["acidentes_status","qualidade_status","producao_status","retrabalho_status","trabalho_padronizado_status"].map(key => {
                            const s = entry?.[key];
                            return (
                              <td key={key} className="border border-slate-100 p-0.5 text-center">
                                <div className={`mx-auto w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center ${
                                  s === "atingido" ? "bg-green-100 text-green-700" :
                                  s === "nao_atingido" ? "bg-red-100 text-red-700" :
                                  s === "feriado" ? "bg-slate-200 text-slate-500" : "bg-slate-50 text-slate-300"
                                }`}>
                                  {s === "atingido" ? "✓" : s === "nao_atingido" ? "✗" : s === "feriado" ? "—" : ""}
                                </div>
                              </td>
                            );
                          })}
                          <td className="border border-slate-100 p-0.5 text-center">
                            <div className={`mx-auto w-5 h-5 rounded-full text-[7px] font-bold flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Objetivos Semanais */}
          <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
              Objetivos Semanais
            </div>
            <div className="p-3 space-y-3">
              {weeklyGoals.map((w, i) => {
                const semana = w.semana || (i + 1);
                const items = [
                  { key: "reuniao_time", label: "Andamento das reuniões do time", color: "bg-blue-500" },
                  { key: "cinco_s",      label: "5S",                             color: "bg-green-500" },
                  { key: "rotatividade", label: "Rotatividade conforme planejamento", color: "bg-purple-500" },
                ];
                return (
                  <div key={semana} className="border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] font-black text-slate-700 uppercase mb-2">Semana {semana}</p>
                    <div className="space-y-2">
                      {items.map(item => {
                        const meta = w[`${item.key}_meta`] ?? 5;
                        const realizado = w[`${item.key}_realizado`] ?? 0;
                        const pct = meta > 0 ? Math.min(100, Math.round((realizado / meta) * 100)) : 0;
                        return (
                          <div key={item.key}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-slate-600 font-medium">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-10 border border-slate-200 rounded px-1 py-0.5 text-[10px] text-center"
                                  value={realizado}
                                  onChange={e => {
                                    const v = Number(e.target.value);
                                    setWeeklyGoals(prev => prev.map(wg => wg.semana === semana ? { ...wg, [`${item.key}_realizado`]: v } : wg));
                                    saveWeeklyGoal(semana, `${item.key}_realizado`, v);
                                  }}
                                />
                                <span className="text-[10px] text-slate-400">/ {meta}</span>
                                <span className={`text-[10px] font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-500" : "text-red-500"}`}>{pct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${item.color}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas de pendências */}
          {pendencias > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">{pendencias} dia{pendencias > 1 ? "s" : ""} sem preenchimento</p>
                <p className="text-[10px] text-amber-600">
                  Dias pendentes: {days.filter(d => !dailyMap[d]).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: editar dia */}
      {editDay && monthlyGoal && (
        <DayModal
          dia={editDay}
          entry={dailyMap[editDay]}
          onSave={(formData) => saveDayEntry(editDay, formData)}
          onClose={() => setEditDay(null)}
        />
      )}

      {/* Modal: novo controle */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0066b1] text-white px-4 py-3 rounded-t-xl flex justify-between">
              <p className="font-bold text-sm">Novo Controle — {MESES_PT[mes - 1]} / {ano}</p>
              <button onClick={() => setShowNewModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { k: "lider_area", label: "Líder da Área" },
                { k: "centro_custo", label: "Centro de Custo" },
                { k: "time", label: "Time" },
                { k: "turno", label: "Turno" },
                { k: "elaborado_por", label: "Elaborado por" },
                { k: "area", label: "Área / Célula" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-[10px] text-slate-500 uppercase">{f.label}</label>
                  <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newForm[f.k] || ""} onChange={e => setNewForm(p => ({ ...p, [f.k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <Button size="sm" className="bg-[#0066b1] flex-1" onClick={criarControle}>Criar Controle</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}