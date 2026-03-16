import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react";

const EPI_SUGESTOES = [
  "Luvas de proteção", "Capacete de segurança", "Óculos de proteção",
  "Protetor auricular", "Bota de segurança", "Colete refletivo",
  "Máscara respiratória", "Avental", "Cinto de segurança", "Luvas de borracha"
];

export default function PedidoForm({ pedido, onSubmit, currentUser, onCancel, orcamentosAtivos = [] }) {
  const [formData, setFormData] = useState(pedido || {
    solicitante: currentUser?.nome_exibicao || currentUser?.full_name || "",
    item: "",
    quantidade: 1,
    valor_unitario: 0,
    valor_total: 0,
    justificativa: "",
    status: "pendente",
    urgencia: "normal",
    data_solicitacao: new Date().toISOString().split('T')[0]
  });
  const [showSugestoes, setShowSugestoes] = useState(false);

  const updateTotal = (quantidade, valor_unitario) => {
    setFormData(f => ({ ...f, quantidade, valor_unitario, valor_total: quantidade * valor_unitario }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, valor_total: formData.quantidade * formData.valor_unitario });
  };

  // Saldo disponível nos orçamentos ativos de EPI para a equipe do usuário
  const orcEPI = orcamentosAtivos.filter(o =>
    o.status === "ativo" && o.categoria === "epi" &&
    (!currentUser?.equipe || o.equipe === currentUser.equipe || !o.equipe)
  );
  const saldoDisponivel = orcEPI.reduce((s, o) => s + (o.valor_total - (o._utilizado || 0)), 0);
  const valorPedido = formData.quantidade * formData.valor_unitario;
  const excedeBudget = saldoDisponivel > 0 && valorPedido > saldoDisponivel;

  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mb-4">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#0066b1]" />
            {pedido ? "Editar Pedido" : "Novo Pedido de EPI"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="w-7 h-7"><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-4">
          {/* Saldo de orçamento disponível */}
          {orcEPI.length > 0 && (
            <div className={`mb-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              excedeBudget ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
            }`}>
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span>
                Saldo disponível nos orçamentos EPI:&nbsp;
                <strong>R$ {saldoDisponivel.toFixed(2)}</strong>
                {excedeBudget && " — ⚠️ Este pedido excede o saldo disponível!"}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Solicitante *</Label>
                <Input value={formData.solicitante}
                  onChange={e => setFormData(f => ({ ...f, solicitante: e.target.value }))} required className="h-9 text-sm" />
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs">Item de EPI *</Label>
                <Input
                  placeholder="Ex: Luvas, Capacete..."
                  value={formData.item}
                  onChange={e => { setFormData(f => ({ ...f, item: e.target.value })); setShowSugestoes(e.target.value.length > 0); }}
                  onFocus={() => setShowSugestoes(true)}
                  onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
                  required className="h-9 text-sm"
                />
                {showSugestoes && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {EPI_SUGESTOES.filter(s => s.toLowerCase().includes(formData.item.toLowerCase())).map(s => (
                      <button key={s} type="button" onMouseDown={() => { setFormData(f => ({ ...f, item: s })); setShowSugestoes(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Quantidade *</Label>
                <Input type="number" min="1" value={formData.quantidade}
                  onChange={e => updateTotal(parseInt(e.target.value) || 1, formData.valor_unitario)} required className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor Unitário (R$)</Label>
                <Input type="number" step="0.01" min="0" value={formData.valor_unitario}
                  onChange={e => updateTotal(formData.quantidade, parseFloat(e.target.value) || 0)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Total</Label>
                <div className={`h-9 px-3 flex items-center rounded-md border text-sm font-bold ${
                  excedeBudget ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  R$ {valorPedido.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Justificativa *</Label>
              <Textarea placeholder="Por que você precisa deste EPI?"
                value={formData.justificativa}
                onChange={e => setFormData(f => ({ ...f, justificativa: e.target.value }))}
                className="h-20 text-sm resize-none" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Urgência</Label>
                <Select value={formData.urgencia} onValueChange={v => setFormData(f => ({ ...f, urgencia: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data da Solicitação</Label>
                <Input type="date" value={formData.data_solicitacao}
                  onChange={e => setFormData(f => ({ ...f, data_solicitacao: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>

            {excedeBudget && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>O valor deste pedido (R$ {valorPedido.toFixed(2)}) excede o saldo de orçamento disponível (R$ {saldoDisponivel.toFixed(2)}). O líder precisará analisar antes de aprovar.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onCancel} className="h-9 text-sm">Cancelar</Button>
              <Button type="submit" className="h-9 text-sm bg-[#0066b1] hover:bg-[#004d82]">
                {pedido ? "Atualizar" : "Solicitar EPI"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}