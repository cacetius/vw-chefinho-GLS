import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Save, Shuffle, Download, Trash2, Copy, AlertTriangle, Check, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, getDaysInMonth, getDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_DIA = [
  { value: "normal", label: "Normal", color: "bg-white", textColor: "text-slate-700" },
  { value: "folga", label: "Folga", color: "bg-slate-200", textColor: "text-slate-500", riscado: true },
  { value: "ferias", label: "Férias", color: "bg-blue-100", textColor: "text-blue-700", riscado: true },
  { value: "afastado", label: "Afastado", color: "bg-red-100", textColor: "text-red-700", riscado: true },
  { value: "treinamento", label: "Treinamento", color: "bg-yellow-100", textColor: "text-yellow-700", riscado: true },
  { value: "emprestado", label: "Emprestado", color: "bg-purple-100", textColor: "text-purple-700", riscado: true },
  { value: "bloqueado", label: "Bloqueado", color: "bg-gray-300", textColor: "text-gray-600", riscado: true },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CellEditor({ entry, workstations, onSave, onClose }) {
  const [form, setForm] = useState({
    workstation_numero: entry?.workstation_numero || "",
    status_dia: entry?.status_dia || "normal",
    observacao: entry?.observacao || "",
    turno: entry?.turno || "manha",
    responsavel_alteracao: entry?.responsavel_alteracao || "",
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-4 min-w-[260px] max-w-[320px] w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-slate-800">Editar Dia</p>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Posto</label>
            <input type="number" placeholder="N° do posto" className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.workstation_numero} onChange={e => setForm(p => ({...p, workstation_numero: e.target.value}))} />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Status</label>
            <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.status_dia} onChange={e => setForm(p => ({...p, status_dia: e.target.value}))}>
              {STATUS_DIA.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Turno</label>
            <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.turno} onChange={e => setForm(p => ({...p, turno: e.target.value}))}>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Observação</label>
            <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.observacao} onChange={e => setForm(p => ({...p, observacao: e.target.value}))} />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Responsável alteração</label>
            <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={form.responsavel_alteracao} onChange={e => setForm(p => ({...p, responsavel_alteracao: e.target.value}))} />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="bg-[#0066b1] flex-1" onClick={() => onSave(form)}>
            <Check className="w-3 h-3 mr-1" /> Salvar
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

export default function RotationPlanning({ currentUser }) {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [operators, setOperators] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [schedule, setSchedule] = useState({}); // {operator_id_dia: entry}
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editCell, setEditCell] = useState(null); // {operatorId, dia}
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "yyyy-MM"));
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  useEffect(() => { loadAll(); }, [currentMonth]);

  const loadAll = async () => {
    setLoading(true);
    const [ops, wss, plansData, mats] = await Promise.all([
      base44.entities.MonitorOperator.filter({ ativo: true }),
      base44.entities.MonitorWorkstation.filter({ ativo: true }),
      base44.entities.MonitorRotationPlan.filter({ mes_referencia: currentMonth }),
      base44.entities.MonitorTrainingMatrix.list("-created_date", 1),
    ]);
    setOperators(ops);
    setWorkstations([...wss].sort((a, b) => a.numero - b.numero));
    setPlans(plansData);
    setMatrix(mats[0] || null);
    if (plansData.length > 0 && !activePlan) {
      loadPlan(plansData[0]);
    } else if (plansData.length === 0) {
      setActivePlan(null);
      setSchedule({});
    }
    setLoading(false);
  };

  const loadPlan = (plan) => {
    setActivePlan(plan);
    const map = {};
    (plan.schedule || []).forEach(entry => {
      map[`${entry.operator_id}_${entry.dia}`] = entry;
    });
    setSchedule(map);
  };

  const getEntry = (opId, dia) => schedule[`${opId}_${dia}`] || null;

  const setEntry = (opId, dia, data) => {
    setSchedule(prev => ({
      ...prev,
      [`${opId}_${dia}`]: { operator_id: opId, dia, ...data }
    }));
  };

  const daysInMonth = getDaysInMonth(new Date(currentMonth + "-01"));
  const firstDayOfWeek = getDay(startOfMonth(new Date(currentMonth + "-01")));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayWeeks = days.map(d => getDay(new Date(`${currentMonth}-${String(d).padStart(2, "0")}`)));

  // Stats
  const totalDias = operators.length * daysInMonth;
  const diasPreenchidos = Object.keys(schedule).filter(k => {
    const e = schedule[k];
    return e && e.status_dia === "normal" && e.workstation_numero;
  }).length;
  const semCobertura = days.filter(d => {
    const aptos = operators.filter(op => {
      const e = getEntry(op.id, d);
      return !e || (e.status_dia === "normal" && e.workstation_numero);
    });
    return aptos.length < workstations.length;
  }).length;

  const getQualLevel = (opId, wsNum) => {
    if (!matrix) return 0;
    const ws = workstations.find(w => w.numero === Number(wsNum));
    if (!ws) return 0;
    const q = (matrix.qualificacoes || []).find(q2 => q2.operator_id === opId && q2.workstation_id === ws.id);
    return q?.nivel || 0;
  };

  // Auto-rotate
  const gerarRotatividadeAutomatica = () => {
    const newSchedule = { ...schedule };
    const wsNums = workstations.map(w => w.numero);
    operators.forEach(op => {
      let lastTwo = [];
      days.forEach(dia => {
        const key = `${op.id}_${dia}`;
        const existing = newSchedule[key];
        if (existing && existing.status_dia !== "normal") return; // respeitar folgas etc

        const dayW = dayWeeks[dia - 1];
        if (dayW === 0 || dayW === 6) {
          newSchedule[key] = { operator_id: op.id, dia, status_dia: "folga", workstation_numero: "" };
          lastTwo = [];
          return;
        }

        // Find best post - avoid repeating last 2, prefer apt operator
        const available = wsNums.filter(w => !lastTwo.includes(w));
        let chosen = available.find(w => getQualLevel(op.id, w) >= 2) || available[0] || wsNums[0];

        // Round-robin fallback
        if (!chosen) chosen = wsNums[(dia - 1) % wsNums.length];

        newSchedule[key] = { operator_id: op.id, dia, status_dia: "normal", workstation_numero: chosen };
        lastTwo = [...lastTwo.slice(-1), chosen];
      });
    });
    setSchedule(newSchedule);
  };

  const savePlan = async () => {
    setSaving(true);
    const scheduleArr = Object.values(schedule).filter(e => e.workstation_numero || e.status_dia !== "normal");
    if (activePlan?.id) {
      const updated = await base44.entities.MonitorRotationPlan.update(activePlan.id, { ...activePlan, schedule: scheduleArr });
      setActivePlan(updated);
    } else {
      const created = await base44.entities.MonitorRotationPlan.create({
        nome: newPlanName || `Planejamento ${currentMonth}`,
        celula: currentUser?.equipe || "Célula",
        mes_referencia: currentMonth,
        turno: currentUser?.turno || "manha",
        responsavel: currentUser?.full_name || "",
        schedule: scheduleArr,
      });
      setActivePlan(created);
      setPlans(prev => [created, ...prev]);
    }
    setSaving(false);
  };

  const duplicarPlanejamento = async () => {
    if (!activePlan) return;
    const clone = await base44.entities.MonitorRotationPlan.create({
      ...activePlan,
      id: undefined,
      nome: `${activePlan.nome} (cópia)`,
      status: "rascunho",
    });
    setPlans(prev => [clone, ...prev]);
    loadPlan(clone);
  };

  const limparMes = () => {
    setSchedule({});
  };

  const criarNovoPlanejamento = async () => {
    if (!newPlanName) return;
    const created = await base44.entities.MonitorRotationPlan.create({
      nome: newPlanName,
      celula: currentUser?.equipe || "Célula",
      mes_referencia: currentMonth,
      turno: currentUser?.turno || "manha",
      responsavel: currentUser?.full_name || "",
      schedule: [],
    });
    setActivePlan(created);
    setPlans(prev => [created, ...prev]);
    setSchedule({});
    setShowNewPlan(false);
    setNewPlanName("");
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-[#0066b1] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-wider">VW</span>
            <div>
              <p className="text-xs font-bold">PLANEJAMENTO DE ROTATIVIDADE</p>
              <p className="text-[9px] opacity-70">Escala Mensal de Operadores / ZP7</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setShowNewPlan(true)}>
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={duplicarPlanejamento} disabled={!activePlan}>
              <Copy className="w-3 h-3 mr-1" /> Duplicar
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={gerarRotatividadeAutomatica}>
              <Shuffle className="w-3 h-3 mr-1" /> Auto
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={limparMes}>
              <Trash2 className="w-3 h-3 mr-1" /> Limpar
            </Button>
            <Button size="sm" className="h-7 text-[10px] bg-green-500 hover:bg-green-600 text-white border-0" onClick={savePlan} disabled={saving}>
              <Save className="w-3 h-3 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Navegação de mês */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <button onClick={() => {
            const d = new Date(currentMonth + "-01");
            d.setMonth(d.getMonth() - 1);
            setCurrentMonth(format(d, "yyyy-MM"));
            setActivePlan(null);
          }} className="p-1 rounded hover:bg-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800 capitalize">
              {format(new Date(currentMonth + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            {activePlan && <p className="text-[10px] text-slate-500">{activePlan.nome}</p>}
          </div>
          <button onClick={() => {
            const d = new Date(currentMonth + "-01");
            d.setMonth(d.getMonth() + 1);
            setCurrentMonth(format(d, "yyyy-MM"));
            setActivePlan(null);
          }} className="p-1 rounded hover:bg-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Dashboard stats */}
        <div className="px-3 py-2 border-b border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          {[
            { label: "Operadores", value: operators.length, color: "text-[#0066b1]" },
            { label: "Postos", value: workstations.length, color: "text-slate-700" },
            { label: "Dias Planj.", value: diasPreenchidos, color: "text-green-600" },
            { label: "Sem Cobertura", value: semCobertura, color: semCobertura > 0 ? "text-red-600" : "text-green-600" },
            { label: "% Planej.", value: `${totalDias > 0 ? Math.round((diasPreenchidos / totalDias) * 100) : 0}%`, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-base font-black ${s.color}`}>{s.value}</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Legenda status */}
        <div className="px-3 py-1.5 border-b border-slate-200 flex flex-wrap gap-2">
          {STATUS_DIA.map(s => (
            <div key={s.value} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded text-[7px] flex items-center justify-center ${s.color} border border-slate-200 ${s.riscado ? "relative overflow-hidden" : ""}`}>
                {s.riscado && <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)" }} />}
              </div>
              <span className="text-[8px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabela de escala */}
        {operators.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Adicione operadores na aba Matriz de Treinamento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-[10px] border-collapse" style={{ minWidth: `${120 + daysInMonth * 28}px` }}>
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-100 px-2 py-1 text-left font-bold text-[9px] text-slate-600 sticky left-0 z-10 min-w-[100px]">OPERADOR</th>
                  {days.map(d => {
                    const dow = dayWeeks[d - 1];
                    const isWkd = dow === 0 || dow === 6;
                    return (
                      <th key={d} className={`border border-slate-200 px-0.5 py-0.5 text-center min-w-[28px] ${isWkd ? "bg-slate-200" : "bg-slate-100"}`}>
                        <div className="flex flex-col items-center">
                          <span className={`font-black ${isWkd ? "text-slate-400" : "text-slate-700"}`}>{d}</span>
                          <span className={`text-[7px] ${isWkd ? "text-slate-400" : "text-slate-500"}`}>{DIAS_SEMANA[dow]}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {operators.map((op, i) => (
                  <tr key={op.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-200 px-2 py-0.5 sticky left-0 bg-inherit z-10">
                      <p className="font-semibold text-slate-800 text-[10px] leading-tight">{op.nome}</p>
                      <p className="text-[8px] text-slate-400">{op.chapa}</p>
                    </td>
                    {days.map(d => {
                      const entry = getEntry(op.id, d);
                      const statusCfg = STATUS_DIA.find(s => s.value === (entry?.status_dia || "normal")) || STATUS_DIA[0];
                      const dow = dayWeeks[d - 1];
                      const isWkd = dow === 0 || dow === 6;
                      const isOccupied = entry?.status_dia === "normal" && entry?.workstation_numero;
                      return (
                        <td key={d} className={`border border-slate-100 p-0 ${isWkd ? "bg-slate-100" : ""}`}>
                          <button
                            onClick={() => setEditCell({ operatorId: op.id, dia: d })}
                            className={`w-full h-7 flex items-center justify-center relative text-[9px] font-bold transition-all hover:scale-105 hover:z-10 hover:shadow ${statusCfg.color} ${statusCfg.textColor}`}
                            title={entry?.observacao || statusCfg.label}
                          >
                            {statusCfg.riscado && (
                              <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)" }} />
                            )}
                            <span className="relative z-10">
                              {entry?.status_dia === "normal" && entry?.workstation_numero ? entry.workstation_numero : ""}
                              {!isOccupied && entry?.status_dia && entry.status_dia !== "normal" ? entry.status_dia.slice(0, 2).toUpperCase() : ""}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: editar célula */}
      {editCell && (
        <CellEditor
          entry={getEntry(editCell.operatorId, editCell.dia)}
          workstations={workstations}
          onSave={(data) => {
            setEntry(editCell.operatorId, editCell.dia, data);
            setEditCell(null);
          }}
          onClose={() => setEditCell(null)}
        />
      )}

      {/* Modal: novo planejamento */}
      {showNewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewPlan(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-4 min-w-[260px]" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-slate-800 mb-3">Novo Planejamento</p>
            <input
              className="w-full border border-slate-200 rounded px-2 py-1 text-xs mb-3"
              placeholder="Nome do planejamento"
              value={newPlanName}
              onChange={e => setNewPlanName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" className="bg-[#0066b1] flex-1" onClick={criarNovoPlanejamento}>Criar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewPlan(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}