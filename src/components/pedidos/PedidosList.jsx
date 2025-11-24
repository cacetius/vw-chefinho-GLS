
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Check, X, Download, Users, Clock } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  reprovado: "bg-red-100 text-red-800 border-red-200",
  entregue: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function PedidosList({ pedidos, onEdit, onDelete, onUpdateStatus, currentUser }) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [orcamentoAprovado, setOrcamentoAprovado] = useState("");
  const [observacoesOrcamento, setObservacoesOrcamento] = useState("");
  const [showOrcamentoDialog, setShowOrcamentoDialog] = useState(false);

  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  const handleAprovarComOrcamento = (pedido) => {
    setSelectedPedido(pedido);
    setOrcamentoAprovado(pedido.valor_total?.toString() || "");
    setObservacoesOrcamento(pedido.observacoes_orcamento || "");
    setShowOrcamentoDialog(true);
  };

  const confirmAprovar = () => {
    if (selectedPedido) {
      onUpdateStatus(
        selectedPedido.id, 
        "aprovado", 
        parseFloat(orcamentoAprovado) || 0,
        observacoesOrcamento
      );
      setShowOrcamentoDialog(false);
      setSelectedPedido(null);
    }
  };

  const exportarParaExcel = () => {
    const dados = pedidos.map(p => ({
      'Solicitante': p.solicitante || p.solicitante_full_name,
      'Item': p.item,
      'Quantidade': p.quantidade,
      'Valor Unitário': `R$ ${p.valor_unitario?.toFixed(2) || '0.00'}`,
      'Valor Total': `R$ ${p.valor_total?.toFixed(2) || '0.00'}`,
      'Status': p.status,
      'Urgência': p.urgencia,
      'Equipe': p.equipe || '-',
      'Turno': p.turno || '-',
      'Orçamento Aprovado': p.orcamento_aprovado ? `R$ ${p.orcamento_aprovado.toFixed(2)}` : '-',
      'Observações Orçamento': p.observacoes_orcamento || '-',
      'Data Solicitação': p.data_solicitacao ? format(new Date(p.data_solicitacao), "dd/MM/yyyy") : '-',
      'Justificativa': p.justificativa || '-'
    }));

    // Handle case where there's no data to export
    if (dados.length === 0) {
      alert("Não há pedidos para exportar.");
      return;
    }

    // Convert data to CSV format
    const header = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => 
      Object.values(row).map(val => {
        // Enclose values with double quotes and escape existing double quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_epi_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.csv`;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(link.href); // Release object URL
  };

  return (
    <>
      {/* Dialog para aprovar com orçamento */}
      {showOrcamentoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Aprovar Pedido com Orçamento</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orcamento">Valor do Orçamento Aprovado (R$) *</Label>
                <Input
                  id="orcamento"
                  type="number"
                  step="0.01"
                  value={orcamentoAprovado}
                  onChange={(e) => setOrcamentoAprovado(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoesOrcamento}
                  onChange={(e) => setObservacoesOrcamento(e.target.value)}
                  placeholder="Observações sobre o orçamento aprovado..."
                  className="h-24"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrcamentoDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmAprovar}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprovar Pedido
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Button 
            onClick={exportarParaExcel}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar para Excel
          </Button>
        </div>

        <AnimatePresence>
          {pedidos.map((pedido) => (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{pedido.item}</h3>
                      {pedido.urgencia === "urgente" && (
                        <Badge className="bg-red-500 text-white">Urgente</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${statusColors[pedido.status]} border`}>
                        {pedido.status}
                      </Badge>
                      <Badge variant="outline">
                        Qtd: {pedido.quantidade}
                      </Badge>
                      {pedido.equipe && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {pedido.equipe}
                        </Badge>
                      )}
                      {pedido.turno && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {pedido.turno}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasLeaderAccess && pedido.status === "pendente" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAprovarComOrcamento(pedido)}
                          className="text-green-600 hover:text-green-700"
                          title="Aprovar com orçamento"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onUpdateStatus(pedido.id, "reprovado")}
                          className="text-red-600 hover:text-red-700"
                          title="Reprovar pedido"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {hasLeaderAccess && pedido.status === "aprovado" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onUpdateStatus(pedido.id, "entregue")}
                        className="text-blue-600 hover:text-blue-700"
                        title="Confirmar entrega"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(pedido)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(pedido.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Solicitante</p>
                      <p className="font-medium">{pedido.solicitante || pedido.solicitante_full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data da Solicitação</p>
                      <p className="font-medium">
                        {pedido.data_solicitacao ? format(new Date(pedido.data_solicitacao), "dd/MM/yyyy") : "-"}
                      </p>
                    </div>
                  </div>
                  {pedido.justificativa && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Justificativa</p>
                      <p className="text-gray-700">{pedido.justificativa}</p>
                    </div>
                  )}
                  {pedido.orcamento_aprovado && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">
                        Orçamento Aprovado: R$ {pedido.orcamento_aprovado.toFixed(2)}
                      </p>
                      {pedido.observacoes_orcamento && (
                        <p className="text-xs text-green-700 mt-1">{pedido.observacoes_orcamento}</p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-500">Valor Unitário: </span>
                      <span className="font-semibold">R$ {pedido.valor_unitario?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Valor Total: </span>
                      <span className="text-xl font-bold text-green-600">
                        R$ {pedido.valor_total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
