import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle, MapPin, ArrowUpDown, ChevronDown, ChevronUp, Package } from "lucide-react";
import MovimentacaoEPI from "./MovimentacaoEPI";

const CAT_COLORS = {
  protecao_cabeca: "bg-blue-100 text-blue-700",
  protecao_olhos: "bg-cyan-100 text-cyan-700",
  protecao_maos: "bg-orange-100 text-orange-700",
  protecao_pes: "bg-brown-100 text-amber-700",
  protecao_corpo: "bg-green-100 text-green-700",
  outro: "bg-slate-100 text-slate-700",
};

const CAT_LABEL = {
  protecao_cabeca: "Cabeça",
  protecao_olhos: "Olhos",
  protecao_maos: "Mãos",
  protecao_pes: "Pés",
  protecao_corpo: "Corpo",
  outro: "Outro",
};

export default function EstoqueList({ itens, onEdit, onDelete, onMovimentar, hasLeaderAccess }) {
  const [movItem, setMovItem] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const filtrados = filtro === "criticos"
    ? itens.filter(i => i.quantidade_atual <= i.quantidade_minima)
    : itens;

  const criticos = itens.filter(i => i.quantidade_atual <= i.quantidade_minima).length;

  const handleMovimentar = async (item, mov) => {
    await onMovimentar(item, mov);
    setMovItem(null);
  };

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Package className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhum item no estoque</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtro */}
      <div className="flex gap-1.5">
        {[
          { key: "todos", label: `Todos (${itens.length})` },
          { key: "criticos", label: `Críticos${criticos > 0 ? ` (${criticos})` : ""}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
              filtro === f.key
                ? f.key === "criticos" ? "bg-red-500 text-white border-red-500" : "bg-[#0066b1] text-white border-[#0066b1]"
                : `border-slate-200 text-slate-600 ${f.key === "criticos" && criticos > 0 ? "border-red-200 text-red-600 bg-red-50" : ""}`
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {/* Form de movimentação */}
        {movItem && (
          <MovimentacaoEPI
            key="mov"
            item={movItem}
            onConfirm={(mov) => handleMovimentar(movItem, mov)}
            onCancel={() => setMovItem(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {filtrados.map((item, i) => {
          const critico = item.quantidade_atual <= item.quantidade_minima;
          const pct = item.quantidade_minima > 0
            ? Math.min(100, Math.round((item.quantidade_atual / (item.quantidade_minima * 2)) * 100))
            : 100;
          const isExpanded = expanded === item.id;

          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`border ${critico ? "border-red-300 bg-red-50/20" : "border-slate-200"}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${critico ? "bg-red-100" : "bg-slate-100"}`}>
                      <Package className={`w-4 h-4 ${critico ? "text-red-500" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.item}</h3>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            <Badge className={`text-[9px] px-1.5 py-0 ${CAT_COLORS[item.categoria] || "bg-slate-100 text-slate-600"}`}>
                              {CAT_LABEL[item.categoria] || item.categoria}
                            </Badge>
                            {critico && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-800 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Repor
                              </Badge>
                            )}
                          </div>
                        </div>
                        {hasLeaderAccess && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => setMovItem(item)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90" title="Movimentar">
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all active:scale-90">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDelete(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all active:scale-90">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Barra de estoque */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-slate-500">Atual: <strong className={critico ? "text-red-600" : "text-slate-800"}>{item.quantidade_atual} {item.unidade}</strong></span>
                          <span className="text-slate-400">Mín: {item.quantidade_minima}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${critico ? "bg-red-500" : pct < 60 ? "bg-amber-400" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Botão expandir */}
                      <button onClick={() => setExpanded(isExpanded ? null : item.id)}
                        className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600 mt-1">
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? "Menos" : "Detalhes"}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <div className="pt-2 mt-1 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                              {item.localizacao && <p><span className="text-slate-400">Local:</span> {item.localizacao}</p>}
                              {item.fornecedor && <p><span className="text-slate-400">Fornecedor:</span> {item.fornecedor}</p>}
                              {item.preco_atual > 0 && (
                                <p><span className="text-slate-400">Preço unit.:</span> R$ {item.preco_atual?.toFixed(2)} · Total: R$ {(item.quantidade_atual * item.preco_atual).toFixed(2)}</p>
                              )}
                              {item.validade && (
                                <p><span className="text-slate-400">Validade:</span> {new Date(item.validade).toLocaleDateString("pt-BR")}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}