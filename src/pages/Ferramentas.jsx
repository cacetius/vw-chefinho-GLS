import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, ChevronRight, Search, X, Calendar, Upload, Camera } from "lucide-react";
import { format } from "date-fns";

const TIPOS = [
  { value: "maquina", label: "Máquina", icone: "⚙️" },
  { value: "torque", label: "Torque", icone: "🔩" },
  { value: "ferramenta", label: "Ferramenta", icone: "🔧" },
  { value: "equipamento", label: "Equipamento", icone: "🖥️" },
];

export default function Ferramentas() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState({ tipo: "", nome: "", modelo: "", foto: "", tem_calibracao: false, data_calibracao: "", proxima_calibracao: "" });
  const [busca, setBusca] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)); }, []);

  const { data: ferramentas = [], refetch } = useQuery({
    queryKey: ["ferramentas-list"], queryFn: () => base44.entities.Ferramenta.list("-created_date", 100)
  });

  const filtradas = ferramentas.filter(f => !busca || f.nome?.toLowerCase().includes(busca.toLowerCase()) || f.tipo?.toLowerCase().includes(busca.toLowerCase()));

  const salvar = async () => {
    await base44.entities.Ferramenta.create({
      nome: form.nome, modelo: form.modelo, tipo: form.tipo,
      foto: form.foto || null,
      calibracao: form.tem_calibracao,
      data_ultima_calibracao: form.data_calibracao || null,
      data_proxima_calibracao: form.proxima_calibracao || null,
      status: "ativo",
      celula: currentUser?.celula || "", equipe: currentUser?.equipe || "",
    });
    setMostrarForm(false); setPasso(1);
    setForm({ tipo: "", nome: "", modelo: "", foto: "", tem_calibracao: false, data_calibracao: "", proxima_calibracao: "" });
    refetch();
  };

  const abrirForm = () => { setMostrarForm(true); setPasso(1); };

  const tipoLabel = TIPOS.find(t => t.value === form.tipo);

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-3 pb-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#001e50]">🔧 Ferramentas</h1>
          <p className="text-[10px] text-slate-400">{ferramentas.length} cadastradas</p>
        </div>
        <button onClick={abrirForm} className="w-11 h-11 bg-[#0066b1] rounded-2xl flex items-center justify-center active:opacity-80">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar ferramenta..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {filtradas.map(f => (
          <div key={f.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
              {TIPOS.find(t => t.value === f.tipo)?.icone || "🔧"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{f.nome}</p>
              <p className="text-[10px] text-slate-400">{f.modelo || f.tipo}</p>
            </div>
            {f.calibracao && f.data_proxima_calibracao && (
              <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                📅 {format(new Date(f.data_proxima_calibracao + "T00:00:00"), "dd/MM")}
              </span>
            )}
          </div>
        ))}
        {filtradas.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Nenhuma ferramenta encontrada</p>}
      </div>

      {/* Modal de Cadastro Simplificado */}
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
                    {passo === 1 ? "Nova Ferramenta" : passo === 2 ? "Dados" : "Calibração"}
                  </h2>
                  <button onClick={() => setMostrarForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Barra de passos */}
                <div className="flex gap-1">
                  {[1, 2, 3].map(p => (
                    <div key={p} className={`flex-1 h-1 rounded-full ${passo >= p ? "bg-[#0066b1]" : "bg-slate-200"}`} />
                  ))}
                </div>

                {/* PASSO 1: Tipo */}
                {passo === 1 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-3">Passo 1 — Tipo</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TIPOS.map(t => (
                        <button key={t.value} onClick={() => { setForm(f => ({ ...f, tipo: t.value })); setPasso(2); }}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0066b1] active:bg-blue-50 transition-all">
                          <span className="text-2xl">{t.icone}</span>
                          <span className="text-xs font-bold text-slate-700">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASSO 2: Dados */}
                {passo === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500">
                      Passo 2 — Dados{tipoLabel && <> • {tipoLabel.icone} {tipoLabel.label}</>}
                    </p>
                    <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome da ferramenta" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                    <input value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                      placeholder="Modelo" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                        input.onchange = async (e) => {
                          const f = e.target.files[0]; if (!f) return;
                          const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
                          setForm(fo => ({ ...fo, foto: file_url }));
                        }; input.click();
                      }} className="flex-1 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> {form.foto ? "Foto adicionada ✓" : "Adicionar foto (opcional)"}
                      </button>
                    </div>
                    <button onClick={() => setPasso(3)}
                      disabled={!form.nome} className="w-full py-3 bg-[#0066b1] text-white text-sm font-bold rounded-xl disabled:opacity-50 active:opacity-80">
                      Continuar
                    </button>
                  </div>
                )}

                {/* PASSO 3: Calibração */}
                {passo === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500">Passo 3 — Calibração</p>
                    <p className="text-sm font-medium text-slate-700">Possui calibração?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(f => ({ ...f, tem_calibracao: true }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.tem_calibracao ? "border-[#0066b1] bg-blue-50 text-[#0066b1]" : "border-slate-200 text-slate-500"}`}>
                        Sim
                      </button>
                      <button onClick={() => setForm(f => ({ ...f, tem_calibracao: false, data_calibracao: "", proxima_calibracao: "" }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.tem_calibracao === false ? "border-[#0066b1] bg-blue-50 text-[#0066b1]" : "border-slate-200 text-slate-500"}`}>
                        Não
                      </button>
                    </div>

                    {form.tem_calibracao && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1">Data da calibração</p>
                          <input type="date" value={form.data_calibracao} onChange={e => setForm(f => ({ ...f, data_calibracao: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1">Próxima calibração</p>
                          <input type="date" value={form.proxima_calibracao} onChange={e => setForm(f => ({ ...f, proxima_calibracao: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0066b1]" />
                        </div>
                      </div>
                    )}

                    <button onClick={salvar} disabled={!form.nome}
                      className="w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 active:opacity-80 mt-4">
                      Salvar
                    </button>
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