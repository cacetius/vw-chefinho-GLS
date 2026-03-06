import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Check, X, Download, Users, Clock, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  pendente: "bg-amber-100 text-amber-800",
  aprovado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-800",
  entregue: "bg-blue-100 text-blue-800"
};

function PedidoCard({ pedido, hasLeaderAccess, onEdit, onDelete, onUpdateStatus, onAprovar }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border border-slate-200 hover:shadow-md transition-all active:scale-[0.99]">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{pedido.item}</h3>
                <p className="text-xs text-slate-500 truncate">{pedido.solicitante || pedido.solicitante_full_name}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {hasLeaderAccess && pedido.status === "pendente" && (
                  <>
                    <button onClick={() => onAprovar(pedido)}
                      className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 active:scale-90 transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onUpdateStatus(pedido.id, "reprovado")}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-90 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {hasLeaderAccess && pedido.status === "aprovado" && (
                  <button onClick={() => onUpdateStatus(pedido.id, "entregue")}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-90 transition-all">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => onEdit(pedido)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(pedido.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={`text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[pedido.status]}`}>{pedido.status}</Badge>
              {pedido.urgencia === "urgente" && <Badge className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white">Urgente</Badge>}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Qtd: {pedido.quantidade}</Badge>
              {pedido.equipe && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><Users className="w-2.5 h-2.5 mr-0.5" />{pedido.equipe}</Badge>}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-green-700">R$ {pedido.valor_total?.toFixed(2) || "0.00"}</span>
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
                    {pedido.justificativa && (
                      <p><span className="text-slate-400">Justificativa:</span> {pedido.justificativa}</p>
                    )}
                    {pedido.orcamento_aprovado && (
                      <div className="p-2 bg-green-50 rounded-lg">
                        <p className="font-semibold text-green-800">Orç. Aprovado: R$ {pedido.orcamento_aprovado.toFixed(2)}</p>
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

export default function PedidosList({ pedidos, onEdit, onDelete, onUpdateStatus, currentUser }) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [orcamentoAprovado, setOrcamentoAprovado] = useState("");
  const [observacoesOrcamento, setObservacoesOrcamento] = useState("");
  const [showDialog, setShowDialog] = useState(false);

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
    if (pedidos.length === 0) return alert("Não há pedidos para exportar.");
    const dados = pedidos.map(p => ({
      'Solicitante': p.solicitante || p.solicitante_full_name,
      'Item': p.item, 'Quantidade': p.quantidade,
      'Valor Total': `R$ ${p.valor_total?.toFixed(2) || '0.00'}`,
      'Status': p.status, 'Urgência': p.urgencia,
      'Equipe': p.equipe || '-', 'Turno': p.turno || '-',
      'Data': p.data_solicitacao ? format(new Date(p.data_solicitacao), "dd/MM/yyyy") : '-',
    }));
    const header = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_epi_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-base font-bold mb-4">Aprovar Pedido com Orçamento</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Valor Aprovado (R$) *</Label>
                <Input type="number" step="0.01" value={orcamentoAprovado}
                  onChange={e => setOrcamentoAprovado(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Textarea value={observacoesOrcamento} onChange={e => setObservacoesOrcamento(e.target.value)}
                  placeholder="Observações sobre o orçamento..." className="mt-1 h-20 text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Cancelar</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={confirmAprovar}>Aprovar</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-end">
          <Button onClick={exportarCSV} variant="outline" size="sm"
            className="h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
          </Button>
        </div>
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <AnimatePresence>
            {pedidos.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ delay: i * 0.03 }}>
                <PedidoCard pedido={p} hasLeaderAccess={hasLeaderAccess}
                  onEdit={onEdit} onDelete={onDelete} onUpdateStatus={onUpdateStatus} onAprovar={handleAprovar} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}