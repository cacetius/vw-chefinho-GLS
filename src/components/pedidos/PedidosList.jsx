import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, X, Download, Users, ShoppingCart, ChevronDown, ChevronUp, AlertTriangle, Filter } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pendente:  { label: "Pendente",  className: "bg-amber-100 text-amber-800" },
  aprovado:  { label: "Aprovado",  className: "bg-green-100 text-green-800" },
  reprovado: { label: "Reprovado", className: "bg-red-100 text-red-800" },
  entregue:  { label: "Entregue",  className: "bg-blue-100 text-blue-800" },
};

function PedidoCard({ pedido, hasLeaderAccess, onEdit, onDelete, onUpdateStatus, onAprovar, orcamentosAtivos }) {
  const [expanded, setExpanded] = useState(false);

  // Mostra o saldo disponível no orçamento vinculado
  const orcVinculado = orcamentosAtivos?.find(o =>
    o.status === "ativo" && o.categoria === "epi" &&
    (!pedido.equipe || o.equipe === pedido.equipe || !o.equipe)
  );
  const saldoOrc = orcVinculado ? (orcVinculado.valor_total - (orcVinculado._utilizado || 0)) : null;
  const excede = saldoOrc !== null && pedido.valor_total > saldoOrc;

  return (
    <Card className={`border transition-all active:scale-[0.99] ${pedido.urgencia === "urgente" ? "border-red-200 bg-red-50/20" : "border-slate-200"}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
            pedido.status === "entregue" ? "bg-blue-500" :
            pedido.status === "aprovado" ? "bg-green-500" :
            pedido.status === "reprovado" ? "bg-red-400" : "bg-[#0066b1]"
          }`}>
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">{pedido.item}</h3>
                <p className="text-[11px] text-slate-500">{pedido.solicitante || pedido.solicitante_full_name}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {hasLeaderAccess && pedido.status === "pendente" && (
                  <>
                    <button onClick={() => onAprovar(pedido)}
                      className="w-9 h-9 rounded-xl bg-green-50 text-green-600 active:bg-green-200 flex items-center justify-center touch-manipulation" title="Aprovar">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => onUpdateStatus(pedido.id, "reprovado")}
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-600 active:bg-red-200 flex items-center justify-center touch-manipulation" title="Reprovar">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {hasLeaderAccess && pedido.status === "aprovado" && (
                  <button onClick={() => onUpdateStatus(pedido.id, "entregue")}
                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 active:bg-blue-200 flex items-center justify-center touch-manipulation" title="Marcar como entregue">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => onEdit(pedido)}
                  className="w-9 h-9 rounded-xl text-slate-400 active:bg-blue-50 active:text-blue-600 flex items-center justify-center touch-manipulation">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(pedido.id)}
                  className="w-9 h-9 rounded-xl text-slate-400 active:bg-red-50 active:text-red-600 flex items-center justify-center touch-manipulation">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_CONFIG[pedido.status]?.className}`}>
                {STATUS_CONFIG[pedido.status]?.label || pedido.status}
              </Badge>
              {pedido.urgencia === "urgente" && (
                <Badge className="text-[10px] px-1.5 py-0 bg-red-500 text-white flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> Urgente
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Qtd: {pedido.quantidade}</Badge>
              {pedido.equipe && <Badge variant="outline" className="text-[10px] px-1.5 py-0"><Users className="w-2.5 h-2.5 mr-0.5" />{pedido.equipe}</Badge>}
              {excede && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800">Excede orçamento</Badge>}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="text-sm font-bold text-green-700">R$ {(pedido.valor_total || 0).toFixed(2)}</span>
                {saldoOrc !== null && (
                  <span className={`text-[10px] ml-2 ${excede ? "text-red-500" : "text-slate-400"}`}>
                    (saldo orç: R${saldoOrc.toFixed(0)})
                  </span>
                )}
              </div>
              <button onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Menos" : "Detalhes"}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {pedido.data_solicitacao && (
                      <p><span className="text-slate-400">Data:</span> {format(new Date(pedido.data_solicitacao), "dd/MM/yyyy")}</p>
                    )}
                    {pedido.valor_unitario > 0 && (
                      <p><span className="text-slate-400">Valor unitário:</span> R$ {pedido.valor_unitario.toFixed(2)} × {pedido.quantidade}</p>
                    )}
                    {pedido.justificativa && (
                      <p><span className="text-slate-400">Justificativa:</span> {pedido.justificativa}</p>
                    )}
                    {orcVinculado && (
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-semibold text-slate-700">📦 Orçamento vinculado: {orcVinculado.titulo}</p>
                        <p className="text-slate-500 mt-0.5">
                          Total: R${orcVinculado.valor_total.toFixed(2)} |
                          Utilizado: R${(orcVinculado._utilizado || 0).toFixed(2)} |
                          <span className={excede ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                            &nbsp;Saldo: R${saldoOrc.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                    {pedido.orcamento_aprovado > 0 && (
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-semibold text-green-800">✅ Orç. aprovado pelo líder: R$ {pedido.orcamento_aprovado.toFixed(2)}</p>
                        {pedido.observacoes_orcamento && <p className="text-green-700 mt-0.5">{pedido.observacoes_orcamento}</p>}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PedidosList({ pedidos, onEdit, onDelete, onUpdateStatus, currentUser, orcamentosAtivos = [] }) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [orcamentoAprovado, setOrcamentoAprovado] = useState("");
  const [observacoesOrcamento, setObservacoesOrcamento] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const hasLeaderAccess = currentUser?.cargo === "lider" ||
    (currentUser?.cargo_temporario === "lider" && currentUser?.data_cargo_temporario &&
      new Date(currentUser.data_cargo_temporario) >= new Date());

  const handleAprovar = (pedido) => {
    setSelectedPedido(pedido);
    setOrcamentoAprovado(pedido.valor_total?.toString() || "");
    setObservacoesOrcamento(pedido.observacoes_orcamento || "");
    setShowDialog(true);
  };

  const confirmAprovar = () => {
    if (selectedPedido) {
      onUpdateStatus(selectedPedido.id, "aprovado", parseFloat(orcamentoAprovado) || 0, observacoesOrcamento);
      setShowDialog(false);
      setSelectedPedido(null);
    }
  };

  const exportarCSV = () => {
    if (pedidos.length === 0) return;
    const dados = pedidos.map(p => ({
      'Solicitante': p.solicitante || p.solicitante_full_name,
      'Item': p.item, 'Quantidade': p.quantidade,
      'Valor Unitário': `R$ ${p.valor_unitario?.toFixed(2) || '0.00'}`,
      'Valor Total': `R$ ${p.valor_total?.toFixed(2) || '0.00'}`,
      'Status': p.status, 'Urgência': p.urgencia,
      'Equipe': p.equipe || '-', 'Turno': p.turno || '-',
      'Data': p.data_solicitacao ? format(new Date(p.data_solicitacao), "dd/MM/yyyy") : '-',
      'Justificativa': p.justificativa || '-',
    }));
    const header = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_epi_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };

  const pedidosFiltrados = filtroStatus === "todos" ? pedidos : pedidos.filter(p => p.status === filtroStatus);
  const contagens = { todos: pedidos.length, pendente: 0, aprovado: 0, reprovado: 0, entregue: 0 };
  pedidos.forEach(p => { if (contagens[p.status] !== undefined) contagens[p.status]++; });

  // Calcula saldo real de cada orçamento baseado nos pedidos aprovados/entregues
  const orcamentosComSaldo = orcamentosAtivos.map(o => {
    const utilizado = pedidos
      .filter(p => (p.status === "aprovado" || p.status === "entregue") &&
        (!o.equipe || p.equipe === o.equipe) && (o.turno === "todos" || p.turno === o.turno))
      .reduce((s, p) => s + (p.valor_total || 0), 0);
    return { ...o, _utilizado: utilizado };
  });

  return (
    <>
      {/* Modal de aprovação */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-base font-bold mb-1">Aprovar Pedido</h3>
            <p className="text-xs text-slate-500 mb-4">
              Item: <strong>{selectedPedido?.item}</strong> — Qtd: {selectedPedido?.quantidade} — Solicitado: R$ {selectedPedido?.valor_total?.toFixed(2)}
            </p>
            {/* Saldo disponível */}
            {(() => {
              const orc = orcamentosComSaldo.find(o =>
                o.status === "ativo" && o.categoria === "epi" &&
                (!selectedPedido?.equipe || o.equipe === selectedPedido?.equipe || !o.equipe)
              );
              if (!orc) return null;
              const saldo = orc.valor_total - orc._utilizado;
              return (
                <div className={`mb-3 p-2.5 rounded-lg text-xs border ${saldo >= (selectedPedido?.valor_total || 0) ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                  📦 <strong>{orc.titulo}</strong> — Saldo disponível: <strong>R$ {saldo.toFixed(2)}</strong>
                  {saldo < (selectedPedido?.valor_total || 0) && " ⚠️ Saldo insuficiente"}
                </div>
              );
            })()}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Valor Aprovado (R$) *</Label>
                <Input type="number" step="0.01" value={orcamentoAprovado}
                  onChange={e => setOrcamentoAprovado(e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Textarea value={observacoesOrcamento} onChange={e => setObservacoesOrcamento(e.target.value)}
                  placeholder="Observações sobre a aprovação..." className="mt-1 h-16 text-sm resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9" onClick={() => setShowDialog(false)}>Cancelar</Button>
                <Button className="flex-1 h-9 bg-green-600 hover:bg-green-700" onClick={confirmAprovar}>✓ Aprovar</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-3">
        {/* Filtros + export */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {Object.entries({ todos: "Todos", pendente: "Pend.", aprovado: "Aprov.", reprovado: "Reprov.", entregue: "Entreg." }).map(([key, label]) => (
            <button key={key} onClick={() => setFiltroStatus(key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all font-medium touch-manipulation min-h-[32px] ${
                filtroStatus === key ? "bg-[#0066b1] text-white border-[#0066b1]" : "border-slate-200 text-slate-600 bg-white"
              }`}>
              {label} <span className="opacity-70">({contagens[key] ?? 0})</span>
            </button>
          ))}
          <Button onClick={exportarCSV} variant="outline" size="sm"
            className="h-7 text-[11px] bg-green-50 hover:bg-green-100 text-green-700 border-green-200 ml-auto">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Nenhum pedido {filtroStatus !== "todos" ? `com status "${filtroStatus}"` : "encontrado"}</p>
          </div>
        ) : (
          <AnimatePresence>
            {pedidosFiltrados.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}>
                <PedidoCard pedido={p} hasLeaderAccess={hasLeaderAccess}
                  onEdit={onEdit} onDelete={onDelete} onUpdateStatus={onUpdateStatus}
                  onAprovar={handleAprovar} orcamentosAtivos={orcamentosComSaldo} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}