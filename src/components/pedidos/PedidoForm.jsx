import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function PedidoForm({ pedido, onSubmit, currentUser, onCancel }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = formData.quantidade * formData.valor_unitario;
    onSubmit({ ...formData, valor_total: total });
  };

  const updateTotal = (quantidade, valor_unitario) => {
    const total = quantidade * valor_unitario;
    setFormData({ ...formData, quantidade, valor_unitario, valor_total: total });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-white border-b">
          <CardTitle>{pedido ? "Editar Pedido" : "Novo Pedido de EPI"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solicitante">Solicitante *</Label>
                <Input
                  id="solicitante"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({...formData, solicitante: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item">Item de EPI *</Label>
                <Input
                  id="item"
                  placeholder="Ex: Luvas, Capacete, Óculos"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => updateTotal(parseInt(e.target.value), formData.valor_unitario)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                <Input
                  id="valor_unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_unitario}
                  onChange={(e) => updateTotal(formData.quantidade, parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_total">Valor Total (R$)</Label>
                <Input
                  id="valor_total"
                  type="number"
                  value={formData.valor_total.toFixed(2)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                placeholder="Por que você precisa deste EPI?"
                value={formData.justificativa}
                onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                className="h-24"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgencia">Urgência</Label>
                <Select
                  value={formData.urgencia}
                  onValueChange={(value) => setFormData({...formData, urgencia: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_solicitacao">Data da Solicitação</Label>
                <Input
                  id="data_solicitacao"
                  type="date"
                  value={formData.data_solicitacao}
                  onChange={(e) => setFormData({...formData, data_solicitacao: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {pedido ? "Atualizar" : "Solicitar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}