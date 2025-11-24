import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function EstoqueForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(item || {
    item: "",
    categoria: "outro",
    quantidade_atual: 0,
    quantidade_minima: 0,
    unidade: "unidade",
    localizacao: "",
    fornecedor: "",
    preco_atual: 0,
    validade: ""
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
          <CardTitle>{item ? "Editar Item" : "Adicionar Item ao Estoque"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item">Nome do Item *</Label>
                <Input
                  id="item"
                  placeholder="Ex: Luvas de Segurança"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                  required
                />
              </div>
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
                    <SelectItem value="protecao_cabeca">Proteção de Cabeça</SelectItem>
                    <SelectItem value="protecao_olhos">Proteção de Olhos</SelectItem>
                    <SelectItem value="protecao_maos">Proteção de Mãos</SelectItem>
                    <SelectItem value="protecao_pes">Proteção de Pés</SelectItem>
                    <SelectItem value="protecao_corpo">Proteção de Corpo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade_atual">Quantidade Atual *</Label>
                <Input
                  id="quantidade_atual"
                  type="number"
                  min="0"
                  value={formData.quantidade_atual}
                  onChange={(e) => setFormData({...formData, quantidade_atual: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade_minima">Estoque Mínimo *</Label>
                <Input
                  id="quantidade_minima"
                  type="number"
                  min="0"
                  value={formData.quantidade_minima}
                  onChange={(e) => setFormData({...formData, quantidade_minima: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Select
                  value={formData.unidade}
                  onValueChange={(value) => setFormData({...formData, unidade: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  placeholder="Nome do fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_atual">Preço Unitário (R$)</Label>
                <Input
                  id="preco_atual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_atual}
                  onChange={(e) => setFormData({...formData, preco_atual: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização no Almoxarifado</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: Prateleira A3"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade">Data de Validade (se aplicável)</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({...formData, validade: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {item ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}