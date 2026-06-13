import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Search, Plus, Pencil, Trash2, Filter, Wrench, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const CONF_COLORS = { conforme: "bg-emerald-100 text-emerald-700", nao_conforme: "bg-red-100 text-red-700", em_analise: "bg-amber-100 text-amber-700", resolvido: "bg-blue-100 text-blue-700" };
const CONF_LABELS = { conforme: "Conforme", nao_conforme: "Não Conforme", em_analise: "Em Análise", resolvido: "Resolvido" };
const RES_COLORS = { conforme: "bg-emerald-100 text-emerald-700", nao_conforme: "bg-red-100 text-red-700", em_analise: "bg-amber-100 text-amber-700" };

export default function AuditoriaIndustrial() {
  const [currentUser, setCurrentUser] = useState(null);
  const [aba, setAba] = useState("processo");
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ data: "", hora: "", area: "", ferramenta: "", conformidade: "conforme", condicao_encontrada: "", acao_corretiva: "", observacao: "", categoria: "ferramenta" });
  const [formTorque, setFormTorque] = useState({ data_auditoria: "", ferramenta: "", tacto: "", lado: "", posto: "", resultado: "conforme", condicao: "", acao_necessaria: "" });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: auditorias = [] } = useQuery({
    queryKey: ["auditorias-processo"], queryFn: () => base44.entities.AuditoriaProcesso.list("-data", 200), enabled: aba === "processo"
  });
  const { data: torques = [] } = useQuery({
    queryKey: ["auditorias-torque"], queryFn: () => base44.entities.AuditoriaTorque.list("-data_auditoria", 200), enabled: aba === "torque"
  });

  const abrirFormProc = (a = null) => {
    if (a) { setForm(a); setEditing(a); } else { setForm({ data: format(new Date(), "yyyy-MM-dd"), hora: "", area: "", ferramenta: "", conformidade: "conforme", condicao_encontrada: "", acao_corretiva: "", observacao: "", categoria: "ferramenta" }); setEditing(null); }
    setFormOpen(true);
  };

  const abrirFormTorque = (a = null) => {
    if (a) { setFormTorque(a); setEditing(a); } else { setFormTorque({ data_auditoria: format(new Date(), "yyyy-MM-dd"), ferramenta: "", tacto: "", lado: "", posto: "", resultado: "conforme", condicao: "", acao_necessaria: "" }); setEditing(null); }
    setFormOpen(true);
  };

  const salvarProc = async () => {
    const dados = { ...form, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "", auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "" };
    if (editing) await base44.entities.AuditoriaProcesso.update(editing.id, dados);
    else await base44.entities.AuditoriaProcesso.create(dados);
    queryClient.invalidateQueries({ queryKey: ["auditorias-processo"] });
    setFormOpen(false);
  };

  const salvarTorque = async () => {
    const dados = { ...formTorque, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "", auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "" };
    if (editing) await base44.entities.AuditoriaTorque.update(editing.id, dados);
    else await base44.entities.AuditoriaTorque.create(dados);
    queryClient.invalidateQueries({ queryKey: ["auditorias-torque"] });
    setFormOpen(false);
  };

  const excluirProc = async (id) => { if (confirm("Excluir?")) { await base44.entities.AuditoriaProcesso.delete(id); queryClient.invalidateQueries({ queryKey: ["auditorias-processo"] }); } };
  const excluirTorque = async (id) => { if (confirm("Excluir?")) { await base44.entities.AuditoriaTorque.delete(id); queryClient.invalidateQueries({ queryKey: ["auditorias-torque"] }); } };

  const lista = aba === "processo" ? auditorias : torques;

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Auditoria Industrial</h1><p className="text-blue-200 text-xs">Auditoria de processo e torque</p></div>
        <Button size="sm" onClick={() => aba === "processo" ? abrirFormProc() : abrirFormTorque()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Nova Auditoria</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {[{ key: "processo", label: "Processo" }, { key: "torque", label: "Torque" }].map(t => (
          <button key={t.key} onClick={() => setAba(t.key)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${aba === t.key ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {aba === "processo" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[{ label: "Total", val: auditorias.length }, { label: "Conforme", val: auditorias.filter(a => a.conformidade === "conforme").length, color: "bg-emerald-500" }, { label: "Não Conforme", val: auditorias.filter(a => a.conformidade === "nao_conforme").length, color: "bg-red-500" }, { label: "Em Análise", val: auditorias.filter(a => a.conformidade === "em_analise").length, color: "bg-amber-500" }].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.color || "bg-slate-500"}`} /><span className="text-[10px] text-slate-500">{s.label}</span></div>
              <p className="text-lg font-bold text-slate-800">{s.val}</p>
            </div>
          ))}
        </div>
      )}
      {aba === "torque" && (
        <div className="grid grid-cols-3 gap-2">
          {[{ label: "Total", val: torques.length }, { label: "Conforme", val: torques.filter(t => t.resultado === "conforme").length, color: "bg-emerald-500" }, { label: "Não Conforme", val: torques.filter(t => t.resultado === "nao_conforme").length, color: "bg-red-500" }].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.color || "bg-slate-500"}`} /><span className="text-[10px] text-slate-500">{s.label}</span></div>
              <p className="text-lg font-bold text-slate-800">{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder={`Buscar ${aba === "processo" ? "área ou ferramenta" : "ferramenta ou posto"}...`} value={search} onChange={e => setSearch(e.target.value)} /></div>

      {/* List */}
      <div className="grid gap-2">
        {lista.filter(a => {
          const txt = (a.ferramenta || "") + (a.area || "") + (a.posto || "");
          return !search || txt.toLowerCase().includes(search.toLowerCase());
        }).map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Card className={`border ${(a.conformidade === "nao_conforme" || a.resultado === "nao_conforme") ? "border-red-300 bg-red-50/10" : "border-slate-200"}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${aba === "torque" ? "bg-blue-50" : "bg-slate-100"}`}>
                    {aba === "torque" ? <Wrench className="w-4 h-4 text-blue-600" /> : <ClipboardCheck className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div><h3 className="text-sm font-bold text-slate-900">{a.ferramenta || a.area}</h3>
                        <p className="text-[10px] text-slate-400">{a.data || a.data_auditoria ? format(new Date((a.data || a.data_auditoria) + "T00:00:00"), "dd/MM/yy") : ""} {a.hora && `• ${a.hora}`} {a.area && aba === "processo" ? `• ${a.area}` : ""} {a.posto && `• Posto: ${a.posto}`}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => aba === "processo" ? abrirFormProc(a) : abrirFormTorque(a)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => aba === "processo" ? excluirProc(a.id) : excluirTorque(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {aba === "processo" && <Badge className={`text-[9px] px-1.5 py-0 ${CONF_COLORS[a.conformidade] || "bg-slate-100"}`}>{CONF_LABELS[a.conformidade]}</Badge>}
                      {aba === "torque" && <Badge className={`text-[9px] px-1.5 py-0 ${RES_COLORS[a.resultado] || "bg-slate-100"}`}>{a.resultado === "conforme" ? "Conforme" : a.resultado === "nao_conforme" ? "Não Conforme" : "Em Análise"}</Badge>}
                      {a.condicao_encontrada && <span className="text-[10px] text-slate-500">{a.condicao_encontrada}</span>}
                      {a.acao_corretiva && <span className="text-[10px] text-blue-600">Ação: {a.acao_corretiva}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal Processo */}
      <AnimatePresence>
        {formOpen && aba === "processo" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Nova"} Auditoria de Processo</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Data</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Hora</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Área</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.area} onChange={e => setForm({...form, area: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Ferramenta</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.ferramenta} onChange={e => setForm({...form, ferramenta: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Conformidade</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.conformidade} onChange={e => setForm({...form, conformidade: e.target.value})}>{Object.entries(CONF_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Condição Encontrada</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.condicao_encontrada} onChange={e => setForm({...form, condicao_encontrada: e.target.value})} /></div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Ação Corretiva</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.acao_corretiva} onChange={e => setForm({...form, acao_corretiva: e.target.value})} /></div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Observação</label><textarea className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20" value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})} /></div>
              </div>
              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100"><Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={salvarProc}>Salvar</Button><Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Torque */}
      <AnimatePresence>
        {formOpen && aba === "torque" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Nova"} Auditoria de Torque</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Data</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.data_auditoria} onChange={e => setFormTorque({...formTorque, data_auditoria: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Resultado</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.resultado} onChange={e => setFormTorque({...formTorque, resultado: e.target.value})}><option value="conforme">Conforme</option><option value="nao_conforme">Não Conforme</option><option value="em_analise">Em Análise</option></select></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Ferramenta *</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.ferramenta} onChange={e => setFormTorque({...formTorque, ferramenta: e.target.value})} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Tacto</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.tacto} onChange={e => setFormTorque({...formTorque, tacto: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Lado</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.lado} onChange={e => setFormTorque({...formTorque, lado: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Posto</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.posto} onChange={e => setFormTorque({...formTorque, posto: e.target.value})} /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Condição</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.condicao} onChange={e => setFormTorque({...formTorque, condicao: e.target.value})} /></div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Ação Necessária</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={formTorque.acao_necessaria} onChange={e => setFormTorque({...formTorque, acao_necessaria: e.target.value})} /></div>
              </div>
              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100"><Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={salvarTorque}>Salvar</Button><Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}