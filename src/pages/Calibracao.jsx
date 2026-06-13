import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Search, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, differenceInDays } from "date-fns";

const CAT_LABELS = { torquimetro: "Torquímetro", apertadeira: "Apertadeira", medicao: "Medição", eletronico: "Eletrônico", outro: "Outro" };

export default function Calibracao() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ equipamento: "", categoria: "torquimetro", marca: "", modelo: "", numero_serie: "", certificado: "", data_calibracao: "", data_vencimento: "", responsavel: "", calibracao_obrigatoria: true });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: calibracoes = [], isLoading } = useQuery({
    queryKey: ["calibracoes"], queryFn: () => base44.entities.Calibracao.list("-data_vencimento", 200)
  });

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const getStatus = (c) => {
    if (!c.data_vencimento) return "info";
    const venc = new Date(c.data_vencimento + "T00:00:00");
    const dias = differenceInDays(venc, hoje);
    if (dias < 0) return "vencido";
    if (dias <= 30) return "proximo";
    return "ok";
  };

  const statusConfig = {
    ok: { label: "Em dia", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    proximo: { label: "Vence em breve", color: "bg-amber-100 text-amber-700", icon: Clock },
    vencido: { label: "Vencido", color: "bg-red-100 text-red-700", icon: AlertTriangle },
    info: { label: "Sem data", color: "bg-slate-100 text-slate-600", icon: Calendar },
  };

  const filtradas = calibracoes.filter(c => {
    if (search && !c.equipamento?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroStatus !== "todos" && getStatus(c) !== filtroStatus) return false;
    return true;
  });

  const stats = {
    total: calibracoes.length,
    ok: calibracoes.filter(c => getStatus(c) === "ok").length,
    proximo: calibracoes.filter(c => getStatus(c) === "proximo").length,
    vencido: calibracoes.filter(c => getStatus(c) === "vencido").length,
  };

  const abrirForm = (c = null) => {
    if (c) { setForm(c); setEditing(c); } else { setForm({ equipamento: "", categoria: "torquimetro", marca: "", modelo: "", numero_serie: "", certificado: "", data_calibracao: "", data_vencimento: "", responsavel: "", calibracao_obrigatoria: true }); setEditing(null); }
    setFormOpen(true);
  };

  const salvar = async () => {
    const dados = { ...form, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "" };
    if (editing) await base44.entities.Calibracao.update(editing.id, dados);
    else await base44.entities.Calibracao.create(dados);
    queryClient.invalidateQueries({ queryKey: ["calibracoes"] });
    setFormOpen(false);
  };

  const excluir = async (id) => { if (confirm("Excluir registro?")) { await base44.entities.Calibracao.delete(id); queryClient.invalidateQueries({ queryKey: ["calibracoes"] }); } };

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Calibração</h1><p className="text-blue-200 text-xs">Controle de calibração de equipamentos</p></div>
        <Button size="sm" onClick={() => abrirForm()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Novo Registro</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[{ label: "Total", val: stats.total, color: "bg-slate-700" }, { label: "Em Dia", val: stats.ok, color: "bg-emerald-500" }, { label: "Vence <30d", val: stats.proximo, color: "bg-amber-500" }, { label: "Vencidos", val: stats.vencido, color: "bg-red-500" }].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><span className="text-[10px] text-slate-500">{s.label}</span></div>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder="Buscar equipamento..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos</option><option value="ok">Em dia</option><option value="proximo">Vence em breve</option><option value="vencido">Vencidos</option>
        </select>
      </div>

      {isLoading ? <div className="text-center py-10 text-slate-400">Carregando...</div> : filtradas.length === 0 ? <div className="text-center py-10 text-slate-400">Nenhum registro</div> : (
        <div className="grid gap-2">
          {filtradas.map((c, i) => {
            const st = getStatus(c);
            const cfg = statusConfig[st];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className={`border ${st === "vencido" ? "border-red-300 bg-red-50/10" : "border-slate-200"}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${st === "vencido" ? "bg-red-100" : "bg-slate-100"}`}>
                        <Gauge className={`w-4 h-4 ${st === "vencido" ? "text-red-500" : "text-slate-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{c.equipamento}</h3>
                            <p className="text-[10px] text-slate-400">{c.marca && `${c.marca}`} {c.modelo && `• ${c.modelo}`} {c.numero_serie && `• S/N: ${c.numero_serie}`}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => abrirForm(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => excluir(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          <Badge className={`text-[9px] px-1.5 py-0 ${cfg.color}`}><cfg.icon className="w-3 h-3 mr-0.5" />{cfg.label}</Badge>
                          <Badge className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600">{CAT_LABELS[c.categoria] || c.categoria}</Badge>
                          {c.data_calibracao && <span className="text-[10px] text-slate-400">Calibrado: {format(new Date(c.data_calibracao + "T00:00:00"), "dd/MM/yyyy")}</span>}
                          {c.data_vencimento && <span className={`text-[10px] ${st === "vencido" ? "text-red-600 font-semibold" : "text-slate-400"}`}>Vence: {format(new Date(c.data_vencimento + "T00:00:00"), "dd/MM/yyyy")}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Novo"} Registro de Calibração</h2>
              <div className="space-y-3">
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Equipamento *</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.equipamento} onChange={e => setForm({...form, equipamento: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Categoria</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>{Object.entries(CAT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Marca</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Modelo</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Nº Série</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.numero_serie} onChange={e => setForm({...form, numero_serie: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Data Calibração</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.data_calibracao} onChange={e => setForm({...form, data_calibracao: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Vencimento</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Certificado</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.certificado} onChange={e => setForm({...form, certificado: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Responsável</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} /></div>
                </div>
              </div>
              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
                <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={salvar}>Salvar</Button>
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}