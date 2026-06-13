import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, Search, Plus, Pencil, Trash2, MapPin, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";

const COND_LABELS = { bom: "Bom", regular: "Regular", ruim: "Ruim", critico: "Crítico" };
const COND_COLORS = { bom: "bg-emerald-100 text-emerald-700", regular: "bg-amber-100 text-amber-700", ruim: "bg-orange-100 text-orange-700", critico: "bg-red-100 text-red-700" };

export default function Bancadas() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: "", area: "", responsavel: "", condicao_atual: "bom", plaquetas: "", etiquetas: "", faixas: "", tempo_uso: 0, tempo_desgaste: 180, ultima_troca: "", observacoes: "" });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: bancadas = [], isLoading } = useQuery({
    queryKey: ["bancadas"], queryFn: () => base44.entities.Bancada.list("-created_date", 200)
  });

  const hoje = new Date(); hoje.setHours(0,0,0,0);

  const filtradas = bancadas.filter(b => {
    if (search && !b.nome?.toLowerCase().includes(search.toLowerCase()) && !b.area?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtro === "criticas" && b.condicao_atual !== "critico" && b.condicao_atual !== "ruim") return false;
    if (filtro === "alerta" && !b.alerta_substituicao) return false;
    return true;
  });

  const abrirForm = (b = null) => {
    if (b) { setForm(b); setEditing(b); } else { setForm({ nome: "", area: "", responsavel: "", condicao_atual: "bom", plaquetas: "", etiquetas: "", faixas: "", tempo_uso: 0, tempo_desgaste: 180, ultima_troca: "", observacoes: "" }); setEditing(null); }
    setFormOpen(true);
  };

  const salvar = async () => {
    const dados = { ...form, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "", alerta_substituicao: form.condicao_atual === "critico" || form.condicao_atual === "ruim" };
    if (editing) await base44.entities.Bancada.update(editing.id, dados);
    else await base44.entities.Bancada.create(dados);
    queryClient.invalidateQueries({ queryKey: ["bancadas"] });
    setFormOpen(false);
  };

  const excluir = async (id) => { if (confirm("Excluir?")) { await base44.entities.Bancada.delete(id); queryClient.invalidateQueries({ queryKey: ["bancadas"] }); } };

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Bancadas</h1><p className="text-blue-200 text-xs">Controle de bancadas, plaquetas e faixas</p></div>
        <Button size="sm" onClick={() => abrirForm()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Nova Bancada</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[{ label: "Total", val: bancadas.length, color: "bg-slate-700" }, { label: "Boas", val: bancadas.filter(b => b.condicao_atual === "bom").length, color: "bg-emerald-500" }, { label: "Regulares", val: bancadas.filter(b => b.condicao_atual === "regular").length, color: "bg-amber-500" }, { label: "Críticas", val: bancadas.filter(b => b.condicao_atual === "critico" || b.condicao_atual === "ruim").length, color: "bg-red-500" }].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><span className="text-[10px] text-slate-500">{s.label}</span></div>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todas">Todas</option><option value="criticas">Críticas / Ruins</option><option value="alerta">Alerta Substituição</option>
        </select>
      </div>

      {isLoading ? <div className="text-center py-10 text-slate-400">Carregando...</div> : (
        <div className="grid gap-2">
          {filtradas.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className={`border ${b.condicao_atual === "critico" ? "border-red-300 bg-red-50/10" : b.alerta_substituicao ? "border-amber-300" : "border-slate-200"}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.condicao_atual === "critico" ? "bg-red-100" : "bg-slate-100"}`}>
                      <LayoutGrid className={`w-4 h-4 ${b.condicao_atual === "critico" ? "text-red-500" : "text-slate-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div><h3 className="text-sm font-bold text-slate-900">{b.nome}</h3><p className="text-[10px] text-slate-400">{b.area && `${b.area}`} {b.responsavel && `• ${b.responsavel}`}</p></div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => abrirForm(b)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluir(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        <Badge className={`text-[9px] px-1.5 py-0 ${COND_COLORS[b.condicao_atual] || "bg-slate-100"}`}>{COND_LABELS[b.condicao_atual]}</Badge>
                        {b.alerta_substituicao && <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700"><AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Substituir</Badge>}
                        {b.ultima_troca && <span className="text-[10px] text-slate-400">Última troca: {format(new Date(b.ultima_troca + "T00:00:00"), "dd/MM/yy")}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Nova"} Bancada</h2>
              <div className="space-y-3">
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Nome *</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Área</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.area} onChange={e => setForm({...form, area: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Responsável</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Condição</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.condicao_atual} onChange={e => setForm({...form, condicao_atual: e.target.value})}>{Object.entries(COND_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Tempo Uso (dias)</label><input type="number" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.tempo_uso} onChange={e => setForm({...form, tempo_uso: Number(e.target.value)})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Desgaste (dias)</label><input type="number" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.tempo_desgaste} onChange={e => setForm({...form, tempo_desgaste: Number(e.target.value)})} /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Última Troca</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.ultima_troca} onChange={e => setForm({...form, ultima_troca: e.target.value})} /></div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Observações</label><textarea className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-16" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
              </div>
              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100"><Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={salvar}>Salvar</Button><Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}