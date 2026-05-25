import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Save, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";

const NIVEIS = [
  { value: 0, label: "Não qualificado", short: "—", color: "bg-white text-slate-300 border border-slate-200" },
  { value: 1, label: "Em treinamento", short: "1", color: "bg-yellow-100 text-yellow-700 border border-yellow-300" },
  { value: 2, label: "Treinado e apto", short: "2", color: "bg-blue-100 text-blue-700 border border-blue-300" },
  { value: 3, label: "Capaz de treinar outros", short: "3", color: "bg-green-100 text-green-700 border border-green-300" },
  { value: 4, label: "Referência / Solução de problemas", short: "4", color: "bg-purple-100 text-purple-700 border border-purple-300" },
];

const getNivel = (v) => NIVEIS.find(n => n.value === v) || NIVEIS[0];

function CellPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const n = getNivel(value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-all hover:scale-110 ${n.color}`}
        title={n.label}
      >
        {n.short}
      </button>
      {open && (
        <div className="absolute z-50 top-9 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-1 min-w-[220px]">
          {NIVEIS.map(nivel => (
            <button
              key={nivel.value}
              onClick={() => { onChange(nivel.value); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 text-left"
            >
              <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${nivel.color}`}>{nivel.short}</span>
              <span className="text-xs text-slate-700">{nivel.label}</span>
              {nivel.value === value && <Check className="w-3 h-3 text-green-500 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeaderField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
      {editing ? (
        <div className="flex gap-1">
          <input
            className="border-b border-[#0066b1] text-xs font-semibold text-slate-800 outline-none bg-transparent w-full"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { onChange(val); setEditing(false); }}}
            autoFocus
          />
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

export default function TrainingMatrix({ currentUser }) {
  const [matrix, setMatrix] = useState(null);
  const [operators, setOperators] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddOp, setShowAddOp] = useState(false);
  const [showAddWs, setShowAddWs] = useState(false);
  const [newOpForm, setNewOpForm] = useState({ nome: "", chapa: "", turno: "manha" });
  const [newWsForm, setNewWsForm] = useState({ numero: "", codigo: "", descricao: "", lado: "Centro", criticidade: "normal", operadores_necessarios: 1 });
  const [qualMap, setQualMap] = useState({}); // {operator_id_workstation_id: nivel}

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [ops, wss, mats] = await Promise.all([
      base44.entities.MonitorOperator.filter({ ativo: true }),
      base44.entities.MonitorWorkstation.filter({ ativo: true }),
      base44.entities.MonitorTrainingMatrix.list("-created_date", 1),
    ]);
    const sorted_ws = [...wss].sort((a, b) => a.numero - b.numero);
    setOperators(ops);
    setWorkstations(sorted_ws);
    const mat = mats[0] || null;
    setMatrix(mat);
    const map = {};
    (mat?.qualificacoes || []).forEach(q => {
      map[`${q.operator_id}_${q.workstation_id}`] = q.nivel;
    });
    setQualMap(map);
    setLoading(false);
  };

  const getQual = (opId, wsId) => qualMap[`${opId}_${wsId}`] ?? 0;

  const setQual = (opId, wsId, nivel) => {
    setQualMap(prev => ({ ...prev, [`${opId}_${wsId}`]: nivel }));
  };

  const saveMatrix = async () => {
    setSaving(true);
    const qualificacoes = [];
    operators.forEach(op => {
      workstations.forEach(ws => {
        const nivel = qualMap[`${op.id}_${ws.id}`] ?? 0;
        qualificacoes.push({ operator_id: op.id, workstation_id: ws.id, nivel });
      });
    });
    const payload = { ...matrix, qualificacoes };
    if (matrix?.id) {
      await base44.entities.MonitorTrainingMatrix.update(matrix.id, payload);
    } else {
      const created = await base44.entities.MonitorTrainingMatrix.create({
        celula: currentUser?.equipe || "Célula",
        elaborado_por: currentUser?.full_name || "",
        data_elaboracao: format(new Date(), "yyyy-MM-dd"),
        qualificacoes,
      });
      setMatrix(created);
    }
    setSaving(false);
  };

  const updateHeader = (field, value) => {
    setMatrix(prev => ({ ...(prev || {}), [field]: value }));
  };

  const addOperator = async () => {
    if (!newOpForm.nome || !newOpForm.chapa) return;
    await base44.entities.MonitorOperator.create({ ...newOpForm, ativo: true });
    setNewOpForm({ nome: "", chapa: "", turno: "manha" });
    setShowAddOp(false);
    loadAll();
  };

  const addWorkstation = async () => {
    if (!newWsForm.codigo || !newWsForm.descricao) return;
    await base44.entities.MonitorWorkstation.create({ ...newWsForm, ativo: true, numero: Number(newWsForm.numero) });
    setNewWsForm({ numero: "", codigo: "", descricao: "", lado: "Centro", criticidade: "normal", operadores_necessarios: 1 });
    setShowAddWs(false);
    loadAll();
  };

  // Alertas
  const getAptosCount = (wsId) => operators.filter(op => getQual(op.id, wsId) >= 2).length;
  const getMultiCount = (wsId) => operators.filter(op => getQual(op.id, wsId) >= 3).length;
  const totalAptos = operators.filter(op => workstations.some(ws => getQual(op.id, ws.id) >= 2)).length;
  const totalMulti = operators.filter(op => workstations.some(ws => getQual(op.id, ws.id) >= 3)).length;
  const coberturaGeral = operators.length > 0 && workstations.length > 0
    ? Math.round((operators.reduce((acc, op) => acc + workstations.filter(ws => getQual(op.id, ws.id) >= 2).length, 0) / (operators.length * workstations.length)) * 100)
    : 0;

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Cabeçalho estilo formulário industrial */}
      <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-[#0066b1] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-wider">VW</span>
            <div>
              <p className="text-xs font-bold leading-tight">MATRIZ DE TREINAMENTO E VERSATILIDADE</p>
              <p className="text-[9px] opacity-70">Controle de Qualificação por Operação / ZP7</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setShowAddOp(true)}>
              <Plus className="w-3 h-3 mr-1" /> Operador
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setShowAddWs(true)}>
              <Plus className="w-3 h-3 mr-1" /> Posto
            </Button>
            <Button size="sm" className="h-7 text-[10px] bg-green-500 hover:bg-green-600 text-white border-0" onClick={saveMatrix} disabled={saving}>
              <Save className="w-3 h-3 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Campos do cabeçalho */}
        <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50">
          <HeaderField label="Líder de Célula" value={matrix?.lider_celula} onChange={v => updateHeader("lider_celula", v)} />
          <HeaderField label="Célula" value={matrix?.celula} onChange={v => updateHeader("celula", v)} />
          <HeaderField label="Time" value={matrix?.time} onChange={v => updateHeader("time", v)} />
          <HeaderField label="Turno" value={matrix?.turno} onChange={v => updateHeader("turno", v)} />
          <HeaderField label="Centro de Custo" value={matrix?.centro_custo} onChange={v => updateHeader("centro_custo", v)} />
          <HeaderField label="Elaborado por" value={matrix?.elaborado_por} onChange={v => updateHeader("elaborado_por", v)} />
          <HeaderField label="Data de Elaboração" value={matrix?.data_elaboracao} onChange={v => updateHeader("data_elaboracao", v)} />
          <HeaderField label="Observações" value={matrix?.observacoes} onChange={v => updateHeader("observacoes", v)} />
        </div>

        {/* Legenda */}
        <div className="px-3 py-2 border-b border-slate-200 flex flex-wrap gap-2">
          {NIVEIS.map(n => (
            <div key={n.value} className="flex items-center gap-1">
              <span className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${n.color}`}>{n.short}</span>
              <span className="text-[9px] text-slate-500">{n.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard de cobertura */}
        <div className="px-3 py-2 border-b border-slate-200 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-black text-[#0066b1]">{coberturaGeral}%</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Cobertura Geral</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-green-600">{totalAptos}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Operadores Aptos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-purple-600">{totalMulti}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Multiplicadores</p>
          </div>
        </div>

        {/* Alertas */}
        {workstations.some(ws => getAptosCount(ws.id) < 2) && (
          <div className="px-3 py-2 bg-red-50 border-b border-red-200 flex flex-wrap gap-2">
            {workstations.filter(ws => getAptosCount(ws.id) < 2).map(ws => (
              <Badge key={ws.id} className="bg-red-100 text-red-700 text-[9px] flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Posto {ws.numero} — {getAptosCount(ws.id)} apto(s)
              </Badge>
            ))}
          </div>
        )}
        {workstations.some(ws => ws.criticidade === "critico" && getMultiCount(ws.id) === 0) && (
          <div className="px-3 py-2 bg-orange-50 border-b border-orange-200 flex flex-wrap gap-2">
            {workstations.filter(ws => ws.criticidade === "critico" && getMultiCount(ws.id) === 0).map(ws => (
              <Badge key={ws.id} className="bg-orange-100 text-orange-700 text-[9px] flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Posto {ws.numero} crítico sem multiplicador
              </Badge>
            ))}
          </div>
        )}

        {/* Matriz */}
        {operators.length === 0 || workstations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Adicione operadores e postos de trabalho para montar a matriz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-100 px-2 py-1 text-left text-[9px] font-bold text-slate-600 sticky left-0 z-10 min-w-[120px]">OPERADOR</th>
                  {workstations.map(ws => (
                    <th key={ws.id} className="border border-slate-200 bg-slate-100 px-1 py-1 text-center min-w-[36px]">
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-black ${ws.criticidade === "critico" ? "text-red-600" : "text-slate-700"}`}>{ws.numero}</span>
                        <span className="text-[7px] text-slate-400 leading-tight max-w-[30px] truncate" title={ws.codigo}>{ws.codigo}</span>
                        {ws.criticidade === "critico" && <span className="text-[6px] text-red-500">★</span>}
                        <span className={`text-[7px] font-semibold mt-0.5 ${getAptosCount(ws.id) < 2 ? "text-red-500" : "text-green-600"}`}>{getAptosCount(ws.id)}✓</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operators.map((op, i) => (
                  <tr key={op.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-200 px-2 py-1 sticky left-0 bg-inherit z-10">
                      <div>
                        <p className="font-semibold text-slate-800 text-[10px]">{op.nome}</p>
                        <p className="text-[8px] text-slate-400">{op.chapa}</p>
                      </div>
                    </td>
                    {workstations.map(ws => (
                      <td key={ws.id} className="border border-slate-200 p-0.5 text-center">
                        <div className="flex justify-center">
                          <CellPicker value={getQual(op.id, ws.id)} onChange={v => setQual(op.id, ws.id, v)} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form: Novo Operador */}
      {showAddOp && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-bold text-slate-800">Novo Operador</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">Nome *</label>
              <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newOpForm.nome} onChange={e => setNewOpForm(p => ({...p, nome: e.target.value}))} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Chapa *</label>
              <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newOpForm.chapa} onChange={e => setNewOpForm(p => ({...p, chapa: e.target.value}))} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Turno</label>
              <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newOpForm.turno} onChange={e => setNewOpForm(p => ({...p, turno: e.target.value}))}>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#0066b1]" onClick={addOperator}>Adicionar</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddOp(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Form: Novo Posto */}
      {showAddWs && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-bold text-slate-800">Novo Posto de Trabalho</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">Número *</label>
              <input type="number" className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newWsForm.numero} onChange={e => setNewWsForm(p => ({...p, numero: e.target.value}))} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Código *</label>
              <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" placeholder="Ex: F361" value={newWsForm.codigo} onChange={e => setNewWsForm(p => ({...p, codigo: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500">Descrição *</label>
              <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newWsForm.descricao} onChange={e => setNewWsForm(p => ({...p, descricao: e.target.value}))} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Lado</label>
              <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newWsForm.lado} onChange={e => setNewWsForm(p => ({...p, lado: e.target.value}))}>
                {["LE","LD","Centro","Ambos"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Criticidade</label>
              <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newWsForm.criticidade} onChange={e => setNewWsForm(p => ({...p, criticidade: e.target.value}))}>
                <option value="normal">Normal</option>
                <option value="critico">Crítico ★</option>
                <option value="especial">Especial</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Operadores necessários</label>
              <input type="number" min="1" className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={newWsForm.operadores_necessarios} onChange={e => setNewWsForm(p => ({...p, operadores_necessarios: Number(e.target.value)}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#0066b1]" onClick={addWorkstation}>Adicionar</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddWs(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Descrição dos Postos */}
      {workstations.length > 0 && (
        <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
            Descrição dos Postos de Trabalho
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100">
                  {["#", "Código", "Descrição", "Lado", "Criticidade", "T.P. (s)", "Op. Nec."].map(h => (
                    <th key={h} className="border border-slate-200 px-2 py-1 text-left text-[9px] font-bold text-slate-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workstations.map((ws, i) => (
                  <tr key={ws.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-200 px-2 py-1 font-bold text-slate-700">{ws.numero}</td>
                    <td className="border border-slate-200 px-2 py-1 font-mono text-[#0066b1]">{ws.codigo}</td>
                    <td className="border border-slate-200 px-2 py-1 text-slate-700">{ws.descricao}</td>
                    <td className="border border-slate-200 px-2 py-1 text-slate-500">{ws.lado}</td>
                    <td className="border border-slate-200 px-2 py-1">
                      <Badge className={`text-[8px] ${ws.criticidade === "critico" ? "bg-red-100 text-red-700" : ws.criticidade === "especial" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>
                        {ws.criticidade}
                      </Badge>
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-slate-500">{ws.tempo_padrao || "—"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center font-bold text-slate-700">{ws.operadores_necessarios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}