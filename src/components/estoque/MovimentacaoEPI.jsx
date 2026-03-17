import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, X } from "lucide-react";

export default function MovimentacaoEPI({ item, onConfirm, onCancel }) {
  const [tipo, setTipo] = useState("saida");
  const [quantidade, setQuantidade] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantidade || quantidade <= 0) return;
    onConfirm({
      tipo,
      quantidade: parseInt(quantidade),
      motivo,
      responsavel,
      data: new Date().toISOString(),
    });
  };

  const novaQtd = tipo === "entrada"
    ? (item.quantidade_atual || 0) + parseInt(quantidade || 0)
    : (item.quantidade_atual || 0) - parseInt(quantidade || 0);

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card className="border border-slate-200 shadow-sm mb-3">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-slate-50">
          <CardTitle className="text-sm font-semibold">Movimentação: {item.item}</CardTitle>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Tipo */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTipo("entrada")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  tipo === "entrada" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"
                }`}>
                <ArrowDown className="w-4 h-4" /> Entrada
              </button>
              <button type="button" onClick={() => setTipo("saida")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  tipo === "saida" ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 text-slate-600"
                }`}>
                <ArrowUp className="w-4 h-4" /> Saída
              </button>
            </div>

            {/* Quantidade */}
            <div className="space-y-1">
              <Label className="text-xs">Quantidade *</Label>
              <Input type="number" min="1" max={tipo === "saida" ? item.quantidade_atual : 9999}
                value={quantidade} onChange={e => setQuantidade(e.target.value)}
                className="h-9 text-sm" required />
              <div className={`text-xs font-medium ${novaQtd < 0 ? "text-red-600" : novaQtd <= item.quantidade_minima ? "text-amber-600" : "text-emerald-600"}`}>
                Estoque após: <strong>{novaQtd} {item.unidade}</strong>
                {novaQtd < 0 && " ⚠️ Insuficiente!"}
                {novaQtd >= 0 && novaQtd <= item.quantidade_minima && " ⚠️ Abaixo do mínimo"}
              </div>
            </div>

            {/* Responsável + Motivo */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Responsável</Label>
                <Input value={responsavel} onChange={e => setResponsavel(e.target.value)}
                  placeholder="Nome" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Motivo</Label>
                <Input value={motivo} onChange={e => setMotivo(e.target.value)}
                  placeholder="Ex: uso turno A" className="h-9 text-sm" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-9 text-sm">Cancelar</Button>
              <Button type="submit"
                className={`flex-1 h-9 text-sm ${tipo === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                disabled={novaQtd < 0}>
                {tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}