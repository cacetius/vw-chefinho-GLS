import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Search, Plus, Pencil, Trash2, Star, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const SENSOS = ["utilizacao", "organizacao", "limpeza", "padronizacao", "disciplina"];
const SENSO_LABELS = { utilizacao: "Utilização", organizacao: "Organização", limpeza: "Limpeza", padronizacao: "Padronização", disciplina: "Disciplina" };

export default function CincoSPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [visao, setVisao] = useState("grafico");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ data: format(new Date(), "yyyy-MM-dd"), area: "", equipe: "", utilizacao: 8, organizacao: 8, limpeza: 8, padronizacao: 8, disciplina: 8, observacoes: "" });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => { setCurrentUser(u); if (u?.equipe) setForm(f => ({...f, equipe: u.equipe})); }); }, []);

  const { data = [], isLoading } = useQuery({
    queryKey: ["cincoS"], queryFn: () => base44.entities.CincoS.list("-data", 200)
  });

  const abrirForm = (c = null) => {
    if (c) { setForm(c); setEditing(c); } else { setForm({ data: format(new Date(), "yyyy-MM-dd"), area: "", equipe: currentUser?.equipe || "", utilizacao: 8, organizacao: 8, limpeza: 8, padronizacao: 8, disciplina: 8, observacoes: "" }); setEditing(null); }
    setFormOpen(true);
  };

  const salvar = async () => {
    const pTotal = form.utilizacao + form.organizacao + form.limpeza + form.padronizacao + form.disciplina;
    const dados = { ...form, celula: currentUser?.celula || "", auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "", pontuacao_total: pTotal };
    if (editing) await base44.entities.CincoS.update(editing.id, dados);
    else await base44.entities.CincoS.create(dados);
    queryClient.invalidateQueries({ queryKey: ["cincoS"] });
    setFormOpen(false);
  };

  const excluir = async (id) => { if (confirm("Excluir?")) { await base44.entities.CincoS.delete(id); queryClient.invalidateQueries({ queryKey: ["cincoS"] }); } };

  // Radar data
  const avgSensos = SENSOS.map(s => ({ senso: SENSO_LABELS[s], media: data.length ? Math.round(data.reduce((acc, d) => acc + (d[s] || 0), 0) / data.length) : 0, max: 10 }));
  const barData = data.slice(-10).map(d => ({ data: format(new Date(d.data + "T00:00:00"), "dd/MM"), pontuacao: d.pontuacao_total || 0, equipe: d.equipe }));

  return (
    <div className="space-y-3 max-w-full">
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Gestão 5S</h1><p className="text-blue-200 text-xs">Auditoria dos 5 Sensos</p></div>
        <Button size="sm" onClick={() => abrirForm()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Nova Auditoria</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {[{ key: "grafico", label: "Gráficos" }, { key: "lista", label: "Histórico" }].map(t => (
          <button key={t.key} onClick={() => setVisao(t.key)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${visao === t.key ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>{t.label}</button>
        ))}
      </div>

      {visao === "grafico" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> Radar 5S (média)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={avgSensos}><PolarGrid /><PolarAngleAxis dataKey="senso" tick={{ fontSize: 9 }} /><PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 8 }} /><Radar name="Média" dataKey="media" stroke="#0066b1" fill="#0066b1" fillOpacity={0.2} /></RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Histórico (últimas 10)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="data" tick={{ fontSize: 8 }} /><YAxis domain={[0, 50]} tick={{ fontSize: 8 }} /><Tooltip /><Bar dataKey="pontuacao" fill="#0066b1" radius={[2,2,0,0]} /></BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Ranking por equipe */}
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-slate-600 mb-3">Ranking por Equipe</h3>
              <div className="space-y-2">
                {(() => {
                  const rank = {};
                  data.forEach(d => { if (d.equipe) { if (!rank[d.equipe]) rank[d.equipe] = { s: 0, n: 0 }; rank[d.equipe].s += d.pontuacao_total || 0; rank[d.equipe].n++; } });
                  return Object.entries(rank).sort((a,b) => (b[1].s/b[1].n) - (a[1].s/a[1].n)).map(([equipe, {s, n}], i) => {
                    const media = Math.round(s / n);
                    return (
                      <div key={equipe} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}º</span>
                        <span className="text-xs font-semibold text-slate-700 flex-1">{equipe}</span>
                        <div className="w-32 bg-slate-200 rounded-full h-2"><div className="bg-[#0066b1] h-2 rounded-full" style={{ width: `${(media/50)*100}%` }} /></div>
                        <span className="text-xs font-bold text-slate-800">{media}/50</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {visao === "lista" && (
        <>
          <div className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="grid gap-2">
            {data.filter(d => !search || d.area?.toLowerCase().includes(search.toLowerCase()) || d.equipe?.toLowerCase().includes(search.toLowerCase())).map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="border border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-blue-600" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div><h3 className="text-sm font-bold text-slate-900">{d.area || d.equipe}</h3><p className="text-[10px] text-slate-400">{d.data ? format(new Date(d.data + "T00:00:00"), "dd/MM/yy") : ""} {d.equipe && `• ${d.equipe}`}</p></div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => abrirForm(d)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => excluir(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {SENSOS.map(s => <span key={s} className="text-[9px] text-slate-500">{SENSO_LABELS[s]}: <strong>{d[s]}</strong></span>)}
                          <span className="text-[10px] font-bold text-[#0066b1] ml-auto">Total: {d.pontuacao_total}/50</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Nova"} Auditoria 5S</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Data</label><input type="date" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                  <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Área</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.area} onChange={e => setForm({...form, area: e.target.value})} /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Equipe</label><input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.equipe} onChange={e => setForm({...form, equipe: e.target.value})} /></div>
                <div className="border-t border-slate-100 pt-3">
                  <h3 className="text-xs font-bold text-slate-600 mb-2">Notas por Senso (0-10)</h3>
                  {SENSOS.map(s => (
                    <div key={s} className="mb-2">
                      <div className="flex items-center justify-between text-xs"><span className="text-slate-600">{SENSO_LABELS[s]}</span><span className="font-bold text-[#0066b1]">{form[s]}/10</span></div>
                      <input type="range" min="0" max="10" value={form[s]} onChange={e => setForm({...form, [s]: Number(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0066b1]" />
                    </div>
                  ))}
                </div>
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