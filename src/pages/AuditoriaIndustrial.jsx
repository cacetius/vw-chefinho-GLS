import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Plus, Camera, X, Search, CheckCircle2, AlertTriangle, CircleX } from "lucide-react";
import { format } from "date-fns";

const RESULTADOS = [
  { value: "conforme", label: "Conforme", icone: "🟢", cor: "border-emerald-500 bg-emerald-50 text-emerald-700" },
  { value: "atencao", label: "Atenção", icone: "🟡", cor: "border-amber-500 bg-amber-50 text-amber-700" },
  { value: "nao_conforme", label: "Não Conforme", icone: "🔴", cor: "border-red-500 bg-red-50 text-red-700" },
];

const RESULT_ICONS = { conforme: "🟢", atencao: "🟡", nao_conforme: "🔴" };

export default function AuditoriaIndustrial() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [passo, setPasso] = useState(1);
  const [ferramentas, setFerramentas] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    ferramenta_id: "", ferramenta_nome: "", ferramenta_tipo: "",
    resultado: "conforme", foto: "", observacao: ""
  });
  const [fazendoFoto, setFazendoFoto] = useState(false);

  const queryClient = useQueryClient();
  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  // Buscar ferramentas para lista de seleção
  useEffect(() => {
    base44.entities.Ferramenta.list().then(fs => setFerramentas(fs));
  }, []);

  const { data: auditorias = [] } = useQuery({
    queryKey: ["auditorias-processo"], queryFn: () => base44.entities.AuditoriaProcesso.list("-data", 100)
  });

  const filtradas = auditorias.filter(a =>
    !search || (a.ferramenta_nome || a.area || "").toLowerCase().includes(search.toLowerCase())
  );

  const ferramentasFiltradas = ferramentas.filter(f =>
    !search || f.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const abrirForm = () => {
    setPasso(1);
    setForm({ ferramenta_id: "", ferramenta_nome: "", ferramenta_tipo: "", resultado: "conforme", foto: "", observacao: "" });
    setSearch("");
    setMostrarForm(true);
  };

  const selecionarFerramenta = (f) => {
    setForm(p => ({ ...p, ferramenta_id: f.id, ferramenta_nome: f.nome, ferramenta_tipo: f.tipo || "" }));
    setPasso(2);
  };

  const selecionarResultado = (r) => {
    setForm(p => ({ ...p, resultado: r }));
    setPasso(3);
  };

  const tirarFoto = async () => {
    setFazendoFoto(true);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) { setFazendoFoto(false); return; }
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        setForm(p => ({ ...p, foto: file_url }));
      } catch (e) { /* ignora */ }
      setFazendoFoto(false);
    };
    input.click();
  };

  const salvar = async () => {
    await base44.entities.AuditoriaProcesso.create({
      data: format(new Date(), "yyyy-MM-dd"),
      hora: format(new Date(), "HH:mm"),
      ferramenta: form.ferramenta_nome,
      ferramenta_id: form.ferramenta_id,
      area: form.ferramenta_tipo,
      conformidade: form.resultado,
      condicao_encontrada: form.observacao,
      foto: form.foto || null,
      auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "",
      celula: currentUser?.celula || "",
      equipe: currentUser?.equipe || "",
    });
    queryClient.invalidateQueries({ queryKey: ["auditorias-processo"] });
    setMostrarForm(false);
  };

  const excluir = async (id) => {
    await base44.entities.AuditoriaProcesso.delete(id);
    queryClient.invalidateQueries({ queryKey: ["auditorias-processo"] });
  };

  const resLabel = RESULTADOS.find(r => r.value === form.resultado);

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-3 pb-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#001e50]">📋 Auditorias</h1>
          <p className="text-[10px] text-slate-400">{auditorias.length} registros</p>
        </div>
        <button onClick={abrirForm} className="w-11 h-11 bg-[#0066b1] rounded-2xl flex items-center justify-center active:opacity-80">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Conforme", val: auditorias.filter(a => a.conformidade === "conforme").length, cor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
          { label: "Atenção", val: auditorias.filter(a => a.conformidade === "atencao").length, cor: "bg-amber-100 text-amber-700 border-amber-200" },
          { label: "Não Conforme", val: auditorias.filter(a => a.conformidade === "nao_conforme").length, cor: "bg-red-100 text-red-700 border-red-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-3 py-2 text-center ${s.cor}`}>
            <p className="text-xl font-extrabold">{s.val}</p>
            <p className="text-[9px] font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar auditoria..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {filtradas.map(a => (
          <div key={a.id} className={`flex items-center gap-3 bg-white border-2 rounded-xl px-3 py-3 ${
            a.conformidade === "nao_conforme" ? "border-red-200" : a.conformidade === "atencao" ? "border-amber-200" : "border-slate-100"
          }`}>
            <span className="text-lg">{RESULT_ICONS[a.conformidade] || "⚪"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{a.ferramenta || a.area}</p>
              <p className="text-[10px] text-slate-400">{a.data && format(new Date(a.data + "T00:00:00"), "dd/MM")} • {a.hora || ""} {a.auditor_nome ? `• ${a.auditor_nome}` : ""}</p>
            </div>
            <button onClick={() => excluir(a.id)} className="text-[10px] text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 active:bg-red-100">
              ×
            </button>
          </div>
        ))}
        {filtradas.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Nenhuma auditoria encontrada</p>}
      </div>

      {/* Modal de Auditoria Rápida */}
      <AnimatePresence>
        {mostrarForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setMostrarForm(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#001e50]">
                    {passo === 1 ? "1. Selecione a ferramenta" : passo === 2 ? "2. Resultado" : "3. Foto e salvar"}
                  </h2>
                  <button onClick={() => setMostrarForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* PASSO 1: Selecionar ferramenta */}
                {passo === 1 && (
                  <div className="space-y-2">
                    <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
                      placeholder="Digite o nome da ferramenta..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {ferramentasFiltradas.slice(0, 20).map(f => (
                        <button key={f.id} onClick={() => selecionarFerramenta(f)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 hover:border-[#0066b1] active:bg-blue-50 transition-all text-left">
                          <span className="text-lg">🔧</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{f.nome}</p>
                            <p className="text-[10px] text-slate-400">{f.tipo || f.modelo}</p>
                          </div>
                        </button>
                      ))}
                      {ferramentasFiltradas.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-400">Nenhuma ferramenta encontrada</p>
                          <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Ou digite um nome livre..."
                            className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                          <button onClick={() => setPasso(2)}
                            disabled={!search} className="mt-2 w-full py-2.5 bg-[#0066b1] text-white text-sm font-bold rounded-xl disabled:opacity-50">
                            Usar "{search}" como referência
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PASSO 2: Resultado */}
                {passo === 2 && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-lg">🔧</span>
                      <p className="text-sm font-bold text-slate-700">{form.ferramenta_nome || "Ferramenta selecionada"}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-500">Selecione o resultado:</p>
                    {RESULTADOS.map(r => (
                      <button key={r.value} onClick={() => selecionarResultado(r.value)}
                        className={`w-full flex items-center gap-3 px-4 py-5 rounded-2xl border-2 ${r.cor} active:opacity-80 transition-all text-left text-lg font-bold`}>
                        <span className="text-2xl">{r.icone}</span> {r.label}
                      </button>
                    ))}
                    <button onClick={() => setPasso(1)} className="w-full py-2 text-xs text-slate-400">← Voltar</button>
                  </div>
                )}

                {/* PASSO 3: Foto + Salvar */}
                {passo === 3 && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔧</span>
                        <span className="text-sm font-bold text-slate-700">{form.ferramenta_nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{resLabel?.icone}</span>
                        <span className="text-sm font-bold text-slate-700">{resLabel?.label}</span>
                      </div>
                    </div>

                    {/* Foto */}
                    <button onClick={tirarFoto} disabled={fazendoFoto}
                      className={`w-full py-5 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${
                        form.foto ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-[#0066b1]"
                      }`}>
                      <Camera className={`w-8 h-8 ${form.foto ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-xs font-medium text-slate-500">
                        {fazendoFoto ? "Tirando foto..." : form.foto ? "Foto adicionada ✓" : "Tirar foto (obrigatório)"}
                      </span>
                    </button>

                    {/* Observação */}
                    <input value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                      placeholder="Observação (opcional)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />

                    <div className="flex gap-2">
                      <button onClick={() => setPasso(2)} className="flex-1 py-3 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl">← Voltar</button>
                      <button onClick={salvar} className="flex-1 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl active:opacity-80">
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}