import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function ObjetivoForm({ objetivo, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(objetivo || {
    titulo: "",
    descricao: "",
    tipo: "diario",
    categoria: "seguranca",
    meta_numerica: 0,
    valor_atual: 0,
    unidade: "",
    data_referencia: new Date().toISOString().split('T')[0],
    turno: "todos",
    concluido: false,
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
          <CardTitle>{objetivo ? "Editar Objetivo" : "Novo Objetivo"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Objetivo *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: 0 Acidentes"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({...formData, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o objetivo..."
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={formData.turno}
                  onValueChange={(value) => setFormData({...formData, turno: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_numerica">Meta Numérica</Label>
                <Input
                  id="meta_numerica"
                  type="number"
                  step="0.01"
                  value={formData.meta_numerica}
                  onChange={(e) => setFormData({...formData, meta_numerica: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_atual">Valor Atual</Label>
                <Input
                  id="valor_atual"
                  type="number"
                  step="0.01"
                  value={formData.valor_atual}
                  onChange={(e) => setFormData({...formData, valor_atual: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Input
                  id="unidade"
                  placeholder="Ex: acidentes, D/1000, %"
                  value={formData.unidade}
                  onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_referencia">Data de Referência *</Label>
              <Input
                id="data_referencia"
                type="date"
                value={formData.data_referencia}
                onChange={(e) => setFormData({...formData, data_referencia: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                className="h-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="concluido"
                checked={formData.concluido}
                onChange={(e) => setFormData({...formData, concluido: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="concluido" className="cursor-pointer">
                Marcar como concluído
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {objetivo ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}