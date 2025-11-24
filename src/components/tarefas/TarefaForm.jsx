import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function TarefaForm({ tarefa, onSubmit, onCancel, isLider, monitores = [] }) {
  const [formData, setFormData] = useState(tarefa || {
    titulo: "",
    descricao: "",
    responsavel: "",
    monitor_atribuido: "",
    prioridade: "media",
    status: "pendente",
    data_limite: ""
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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white border-b">
          <CardTitle>{tarefa ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Título da tarefa"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os detalhes da tarefa"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Input
                  id="responsavel"
                  placeholder="Nome do responsável"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                  required
                />
              </div>

              {isLider && monitores && monitores.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="monitor_atribuido">Atribuir a Monitor Específico</Label>
                  <Select
                    value={formData.monitor_atribuido || ""}
                    onValueChange={(value) => setFormData({...formData, monitor_atribuido: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um monitor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhum (Todos)</SelectItem>
                      {monitores.map((monitor) => (
                        <SelectItem key={monitor.id} value={monitor.id}>
                          {monitor.nome_exibicao || monitor.full_name} - {monitor.equipe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({...formData, prioridade: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_limite">Data Limite</Label>
                <Input
                  id="data_limite"
                  type="date"
                  value={formData.data_limite}
                  onChange={(e) => setFormData({...formData, data_limite: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {tarefa ? "Atualizar" : "Criar Tarefa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}