import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

const HABILIDADES_PADRAO = [
  { numero: 1, descricao: "Pintura P/C Parachoque" },
  { numero: 2, descricao: "Fixar Lateral Esq no P/C" },
  { numero: 3, descricao: "Fixar Lateral Dir no P/C" },
  { numero: 4, descricao: "Fixar Defletor no P/C" },
  { numero: 5, descricao: "Fixar Grade Sup no P/C" },
  { numero: 6, descricao: "Fixar Grade Inf no P/C" },
  { numero: 7, descricao: "Fixar Limitador de Capô" }
];

export default function VersatilidadeForm({ colaborador, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(colaborador || {
    colaborador: "",
    chapa: "",
    equipe: "",
    turno: "manha",
    habilidades: HABILIDADES_PADRAO.map(h => ({ ...h, nivel: "nao_treinado" })),
    disponibilidade: "disponivel",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateHabilidade = (index, field, value) => {
    const novasHabilidades = [...formData.habilidades];
    novasHabilidades[index] = { ...novasHabilidades[index], [field]: value };
    setFormData({ ...formData, habilidades: novasHabilidades });
  };

  const addHabilidade = () => {
    const novoNumero = Math.max(...formData.habilidades.map(h => h.numero), 0) + 1;
    setFormData({
      ...formData,
      habilidades: [
        ...formData.habilidades,
        { numero: novoNumero, descricao: "", nivel: "nao_treinado" }
      ]
    });
  };

  const removeHabilidade = (index) => {
    const novasHabilidades = formData.habilidades.filter((_, i) => i !== index);
    setFormData({ ...formData, habilidades: novasHabilidades });
  };

  const getNivelColor = (nivel) => {
    switch(nivel) {
      case "nao_treinado": return "bg-gray-100";
      case "em_treinamento": return "bg-yellow-100";
      case "treinado": return "bg-green-100";
      case "instrutor": return "bg-blue-100";
      default: return "bg-white";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-white border-b">
          <CardTitle className="text-lg md:text-xl">{colaborador ? "Editar Colaborador" : "Novo Colaborador"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colaborador">Nome do Colaborador *</Label>
                <Input
                  id="colaborador"
                  placeholder="Nome completo"
                  value={formData.colaborador}
                  onChange={(e) => setFormData({...formData, colaborador: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapa">Chapa *</Label>
                <Input
                  id="chapa"
                  placeholder="Número de chapa"
                  value={formData.chapa}
                  onChange={(e) => setFormData({...formData, chapa: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe</Label>
                <Input
                  id="equipe"
                  placeholder="Nome da equipe"
                  value={formData.equipe}
                  onChange={(e) => setFormData({...formData, equipe: e.target.value})}
                />
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
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disponibilidade">Disponibilidade</Label>
                <Select
                  value={formData.disponibilidade}
                  onValueChange={(value) => setFormData({...formData, disponibilidade: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="indisponivel">Indisponível</SelectItem>
                    <SelectItem value="licenca">Licença</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Matriz de Habilidades</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHabilidade}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Habilidade
                </Button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {formData.habilidades.map((habilidade, index) => (
                  <div key={index} className={`flex gap-2 p-3 rounded-lg items-center ${getNivelColor(habilidade.nivel)}`}>
                    <div className="w-12 text-center">
                      <span className="font-bold text-gray-700">{habilidade.numero}</span>
                    </div>
                    <Input
                      placeholder="Descrição da habilidade"
                      value={habilidade.descricao}
                      onChange={(e) => updateHabilidade(index, "descricao", e.target.value)}
                      className="flex-1 bg-white"
                    />
                    <Select
                      value={habilidade.nivel}
                      onValueChange={(value) => updateHabilidade(index, "nivel", value)}
                    >
                      <SelectTrigger className="w-48 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_treinado">Não Treinado</SelectItem>
                        <SelectItem value="em_treinamento">Em Treinamento</SelectItem>
                        <SelectItem value="treinado">Treinado</SelectItem>
                        <SelectItem value="instrutor">Instrutor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHabilidade(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {colaborador ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}