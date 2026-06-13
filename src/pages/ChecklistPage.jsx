import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Search, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const CAT_LABELS = { ferramentas: "Ferramentas", torques: "Torques", equipamentos: "Equipamentos", bancadas: "Bancadas", etiquetas: "Etiquetas", faixas: "Faixas", "5s": "5S", seguranca: "Segurança", documentacao: "Documentação", qualidade: "Qualidade" };

export default function ChecklistPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: "", categoria: "ferramentas", data: format(new Date(), "yyyy-MM-dd"), area: "", itens: [{ descricao: "", conforme: true, observacao: "", pontuacao: 10 }], observacoes_gerais: "" });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data = [], isLoading } = useQuery({
    queryKey: ["checklists-auditoria"], queryFn: () => base44.entities.ChecklistAuditoria.list("-data", 200)
  });

  const abrirForm = (c = null) => {
    if (c) { setForm({...c, itens: c.itens || []}); setEditing(c); } else { setForm({ titulo: "", categoria: "ferramentas", data: format(new Date(), "yyyy-MM-dd"), area: "", itens: [{ descricao: "", conforme: true, observacao: "", pontuacao: 10 }], observacoes_gerais: "" }); setEditing(null); }
    setFormOpen(true);
  };

  const salvar = async () => {
    const pTotal = form.itens.reduce((s, i) => s + (i.conforme ? (i.pontuacao || 10) : 0), 0);
    const pMax = form.itens.length * 10;
    const dados = { ...form, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "", auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "", pontuacao_total: pTotal, status: "finalizado" };
    if (editing) await base44.entities.ChecklistAuditoria.update(editing.id, dados);
    else await base44.entities.ChecklistAuditoria.create(dados);
    queryClient.invalidateQueries({ queryKey: ["checklists-auditoria"] });
    setFormOpen(false);
  };

  const excluir = async (id) => { if (confirm("Excluir?")) { await base44.entities.ChecklistAuditoria.delete(id); queryClient.invalidateQueries({ queryKey: ["checklists-auditoria"] }); } };

  const addItem = () => setForm({...form, itens: [...form.itens, { descricao: "", conforme: true, observacao: "", pontuacao: 10 }]});

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Checklist de Auditoria</h1><p className="text-blue-200 text-xs">Checklists configuráveis por categoria</p></div>
        <Button size="sm" onClick={() => abrirForm()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Novo Checklist</Button>
      </div>

      <div className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      {isLoading ? <div className="text-center py-10 text-slate-400">Carregando...</div> : (
        <div className="grid gap-2">
          {data.filter(c => !search || c.titulo?.toLowerCase().includes(search.toLowerCase())).map((c, i) => {
            const pct = c.itens?.length ? Math.round((c.itens.filter(i => i.conforme).length / c.itens.length) * 100) : 0;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="border border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><ClipboardList className="w-4 h-4 text-slate-600" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div><h3 className="text-sm font-bold text-slate-900">{c.titulo}</h3><p className="text-[10px] text-slate-400">{c.data ? format(new Date(c.data + "T00:00:00"), "dd/MM/yy") : ""} {c.area && `• ${c.area}`} {c.auditor_nome && `• ${c.auditor_nome}`}</p></div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => abrirForm(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => excluir(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          <Badge className="text-[9px] px-1.5 py-0 bg-slate-100">{CAT_LABELS[c.categoria] || c.categoria}</Badge>
                          {c.pontuacao_total > 0 && <Badge className={`text-[9px] px-1.5 py-0 ${pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{pct}% ({c.pontuacao_total} pts)</Badge>}
                          <span className="text-[10px] text-slate-400">{c.itens?.length || 0} itens</span>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Novo"} Checklist</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Título *</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Categoria</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>{Object.entries(CAT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Data</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Área</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.area} onChange={e => setForm({...form, area: e.target.value})} /></div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h3 className="text-xs font-bold text-slate-600 mb-2">Itens do Checklist</h3>
                  {form.itens.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 mb-2 p-2 bg-slate-50 rounded-lg">
                      <button onClick={() => setForm({...form, itens: form.itens.map((it, j) => j === idx ? {...it, conforme: !it.conforme} : it)})} className={`mt-1.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${item.conforme ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-slate-300"}`}>{item.conforme ? <Check className="w-3 h-3" /> : null}</button>
                      <div className="flex-1 space-y-1">
                        <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" placeholder="Descrição do item" value={item.descricao} onChange={e => setForm({...form, itens: form.itens.map((it, j) => j === idx ? {...it, descricao: e.target.value} : it)})} />
                        <input className="w-full border border-slate-200 rounded px-2 py-1 text-[10px]" placeholder="Observação" value={item.observacao} onChange={e => setForm({...form, itens: form.itens.map((it, j) => j === idx ? {...it, observacao: e.target.value} : it)})} />
                      </div>
                      <button onClick={() => setForm({...form, itens: form.itens.filter((_, j) => j !== idx)})} className="text-slate-300 hover:text-red-400 p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"><Plus className="w-3.5 h-3.5" /> Adicionar item</button>
                </div>

                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Observações Gerais</label><textarea className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-16" value={form.observacoes_gerais} onChange={e => setForm({...form, observacoes_gerais: e.target.value})} /></div>
              </div>
              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100"><Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={salvar}>Salvar</Button><Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}