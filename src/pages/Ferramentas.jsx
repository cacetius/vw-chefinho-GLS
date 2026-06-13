import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Search, Plus, Pencil, Trash2, MapPin, Settings, Tag, FileCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";

const CAT_LABELS = {
  maquina: "Máquina", ferramenta: "Ferramenta", torque: "Torque",
  equipamento: "Equipamento", instrumento_medicao: "Instrumento", dispositivo: "Dispositivo", gabarito: "Gabarito"
};
const STATUS_COLORS = {
  ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  em_manutencao: "bg-amber-100 text-amber-700 border-amber-200",
  em_calibracao: "bg-blue-100 text-blue-700 border-blue-200",
  fora_de_uso: "bg-red-100 text-red-700 border-red-200"
};
const STATUS_LABELS = { ativo: "Ativo", em_manutencao: "Em Manutenção", em_calibracao: "Em Calibração", fora_de_uso: "Fora de Uso" };

export default function Ferramentas() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroCat, setFiltroCat] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const INITIAL_FORM = { nome: "", codigo: "", categoria: "ferramenta", status: "ativo", marca: "", modelo: "", numero_serie: "", patrimonio: "", area: "", localizacao: "", etiqueta_data_instalacao: "", etiqueta_ultima_revisao: "", etiqueta_status: "ok", etiqueta_legivel: true, etiqueta_fixada: true, etiqueta_atualizada: true, certificado_calibracao: "", data_ultima_calibracao: "", data_vencimento_calibracao: "", anexo_certificado: "", calibracao_obrigatoria: false };
  const [form, setForm] = useState(INITIAL_FORM);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: ferramentas = [], isLoading } = useQuery({
    queryKey: ["ferramentas"], queryFn: () => base44.entities.Ferramenta.list("-created_date", 200)
  });

  const filtradas = ferramentas.filter(f => {
    if (search && !f.nome?.toLowerCase().includes(search.toLowerCase()) && !f.codigo?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroCat !== "todas" && f.categoria !== filtroCat) return false;
    if (filtroStatus !== "todos" && f.status !== filtroStatus) return false;
    return true;
  });

  const stats = {
    total: ferramentas.length,
    ativo: ferramentas.filter(f => f.status === "ativo").length,
    manutencao: ferramentas.filter(f => f.status === "em_manutencao").length,
    calibracao: ferramentas.filter(f => f.status === "em_calibracao").length,
    fora: ferramentas.filter(f => f.status === "fora_de_uso").length,
  };

  const abrirForm = (f = null) => {
    if (f) { setForm(f); setEditing(f); } else { setForm(INITIAL_FORM); setEditing(null); }
    setFormOpen(true);
  };

  const salvar = async () => {
    const dados = { ...form, celula: currentUser?.celula || "", equipe: currentUser?.equipe || "", monitor_responsavel: currentUser?.nome_exibicao || currentUser?.full_name || "" };
    if (editing) await base44.entities.Ferramenta.update(editing.id, dados);
    else await base44.entities.Ferramenta.create(dados);
    queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
    setFormOpen(false);
  };

  const excluir = async (id) => { if (confirm("Excluir esta ferramenta?")) { await base44.entities.Ferramenta.delete(id); queryClient.invalidateQueries({ queryKey: ["ferramentas"] }); } };

  return (
    <div className="space-y-3 max-w-full">
      {/* Header */}
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold text-white">Ferramentas</h1><p className="text-blue-200 text-xs">Gestão de ferramentas e equipamentos</p></div>
        <Button size="sm" onClick={() => abrirForm()} className="bg-white text-[#0d2d6b] hover:bg-blue-50 gap-1 text-xs h-8"><Plus className="w-3.5 h-3.5" /> Nova Ferramenta</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[{ label: "Total", val: stats.total, color: "bg-slate-700" }, { label: "Ativos", val: stats.ativo, color: "bg-emerald-500" }, { label: "Manutenção", val: stats.manutencao, color: "bg-amber-500" }, { label: "Calibração", val: stats.calibracao, color: "bg-blue-500" }, { label: "Fora de Uso", val: stats.fora, color: "bg-red-500" }].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><span className="text-[10px] text-slate-500">{s.label}</span></div>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs" placeholder="Buscar por nome ou código..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
          <option value="todas">Todas Categorias</option>
          {Object.entries(CAT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos Status</option>
          {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Lista */}
      {isLoading ? <div className="text-center py-10 text-slate-400">Carregando...</div> : filtradas.length === 0 ? <div className="text-center py-10 text-slate-400">Nenhuma ferramenta encontrada</div> : (
        <div className="grid gap-2">
          {filtradas.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="border border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><Wrench className="w-4 h-4 text-slate-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{f.nome}</h3>
                          <p className="text-[10px] text-slate-400">{f.codigo && `#${f.codigo}`} {f.marca && `• ${f.marca}`} {f.modelo && `• ${f.modelo}`}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => abrirForm(f)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluir(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                       <Badge className={`text-[9px] px-1.5 py-0 ${STATUS_COLORS[f.status] || "bg-slate-100"}`}>{STATUS_LABELS[f.status] || f.status}</Badge>
                       <Badge className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600">{CAT_LABELS[f.categoria] || f.categoria}</Badge>
                       {f.area && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{f.area}</span>}
                       {f.calibracao_obrigatoria && (
                         (() => {
                           if (!f.data_vencimento_calibracao) return <Badge className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-500"><Clock className="w-2.5 h-2.5 mr-0.5" />Sem data</Badge>;
                           const venc = new Date(f.data_vencimento_calibracao + "T00:00:00");
                           const dias = differenceInDays(venc, new Date());
                           if (dias < 0) return <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700"><AlertTriangle className="w-2.5 h-2.5 mr-0.5" />Cal. Vencida</Badge>;
                           if (dias <= 30) return <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700"><Clock className="w-2.5 h-2.5 mr-0.5" />Vence {dias}d</Badge>;
                           return <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />Cal. OK</Badge>;
                         })()
                       )}
                       {f.etiqueta_status && f.etiqueta_status !== "ok" && (
                         <Badge className={`text-[9px] px-1.5 py-0 ${f.etiqueta_status === "substituir" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}><Tag className="w-2.5 h-2.5 mr-0.5" />Etiqueta {f.etiqueta_status === "substituir" ? "Substituir" : "Desgastada"}</Badge>
                       )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-slate-800 mb-4">{editing ? "Editar" : "Nova"} Ferramenta</h2>
              <div className="space-y-3">
                <InputField label="Nome *" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Código" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
                  <SelectField label="Categoria" value={form.categoria} options={CAT_LABELS} onChange={e => setForm({...form, categoria: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Marca" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
                  <InputField label="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Nº Série" value={form.numero_serie} onChange={e => setForm({...form, numero_serie: e.target.value})} />
                  <InputField label="Patrimônio" value={form.patrimonio} onChange={e => setForm({...form, patrimonio: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Área" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                  <InputField label="Localização" value={form.localizacao} onChange={e => setForm({...form, localizacao: e.target.value})} />
                </div>
                <SelectField label="Status" value={form.status} options={STATUS_LABELS} onChange={e => setForm({...form, status: e.target.value})} />

                {/* Etiqueta */}
                <div className="pt-2 border-t border-slate-100"><h3 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Etiqueta</h3></div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Data Instalação" value={form.etiqueta_data_instalacao} onChange={e => setForm({...form, etiqueta_data_instalacao: e.target.value})} type="date" />
                  <InputField label="Última Revisão" value={form.etiqueta_ultima_revisao} onChange={e => setForm({...form, etiqueta_ultima_revisao: e.target.value})} type="date" />
                </div>
                <SelectField label="Estado" value={form.etiqueta_status} options={{ ok: "OK", desgastada: "Desgastada", substituir: "Substituir" }} onChange={e => setForm({...form, etiqueta_status: e.target.value})} />
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.etiqueta_legivel} onChange={e => setForm({...form, etiqueta_legivel: e.target.checked})} /> Legível</label>
                  <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.etiqueta_fixada} onChange={e => setForm({...form, etiqueta_fixada: e.target.checked})} /> Fixada</label>
                  <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.etiqueta_atualizada} onChange={e => setForm({...form, etiqueta_atualizada: e.target.checked})} /> Atualizada</label>
                </div>

                {/* Calibração */}
                <div className="pt-2 border-t border-slate-100"><h3 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5"><FileCheck className="w-3 h-3" /> Certificado de Calibração</h3></div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.calibracao_obrigatoria} onChange={e => setForm({...form, calibracao_obrigatoria: e.target.checked})} /> Calibração obrigatória</label>
                <InputField label="Nº Certificado" value={form.certificado_calibracao} onChange={e => setForm({...form, certificado_calibracao: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Última Calibração" value={form.data_ultima_calibracao} onChange={e => setForm({...form, data_ultima_calibracao: e.target.value})} type="date" />
                  <InputField label="Vencimento" value={form.data_vencimento_calibracao} onChange={e => setForm({...form, data_vencimento_calibracao: e.target.value})} type="date" />
                </div>
                <InputField label="Anexo (URL)" value={form.anexo_certificado} onChange={e => setForm({...form, anexo_certificado: e.target.value})} />
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

function InputField({ label, value, onChange, type = "text" }) {
  return <div><label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label><input type={type} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={value || ""} onChange={onChange} /></div>;
}
function SelectField({ label, value, options, onChange }) {
  return <div><label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label><select className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={value || ""} onChange={onChange}>
    {Object.entries(options).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
  </select></div>;
}