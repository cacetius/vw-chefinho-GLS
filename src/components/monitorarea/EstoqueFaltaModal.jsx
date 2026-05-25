import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { PackageX, X, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EstoqueFaltaModal({ tarefa, onClose }) {
  const [itens, setItens] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    base44.entities.EstoqueEPI.list().then(data => {
      setItens(data);
      // Tenta pré-selecionar pelo título da tarefa
      const match = data.find(i =>
        i.item?.toLowerCase().includes(tarefa?.titulo?.toLowerCase()) ||
        tarefa?.titulo?.toLowerCase().includes(i.item?.toLowerCase())
      );
      if (match) setSelectedId(match.id);
      setLoading(false);
    });
  }, []);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    const item = itens.find(i => i.id === selectedId);
    await base44.entities.EstoqueEPI.update(selectedId, {
      ...item,
      quantidade_atual: 0,
    });
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-white rounded-t-2xl p-5 pb-8 shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <PackageX className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Item em Falta</p>
                <p className="text-[10px] text-slate-400">Atualizar estoque como zerado</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center py-6 gap-2 text-green-600">
              <CheckCircle2 className="w-10 h-10" />
              <p className="text-sm font-bold">Estoque atualizado!</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Selecionar item do estoque
                </label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0066b1]/30 focus:border-[#0066b1]"
                  >
                    <option value="">— Escolha um item —</option>
                    {itens.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.item} (atual: {i.quantidade_atual ?? 0} {i.unidade || "un"})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {selectedId && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    O estoque de <strong>{itens.find(i => i.id === selectedId)?.item}</strong> será marcado como <strong>zerado (0)</strong>. O responsável poderá ser notificado para reposição.
                  </p>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!selectedId || saving}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl"
              >
                {saving ? "Atualizando..." : "⚠️ Confirmar Item em Falta"}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}