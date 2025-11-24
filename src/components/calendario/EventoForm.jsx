import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function EventoForm({ onSubmit, onCancel, dataInicial }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "outro",
    data_inicio: dataInicial ? dataInicial.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    data_fim: dataInicial ? dataInicial.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    local: "",
    cor: "#0066b1",
    lembrete: 30
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      data_inicio: new Date(formData.data_inicio + 'T00:00:00').toISOString(),
      data_fim: new Date(formData.data_fim + 'T23:59:59').toISOString()
    });
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
          <CardTitle>Novo Evento</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
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
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="ausencia">Ausência</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lembrete">Lembrete (minutos antes)</Label>
                <Select
                  value={formData.lembrete.toString()}
                  onValueChange={(value) => setFormData({...formData, lembrete: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem lembrete</SelectItem>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                    <SelectItem value="60">1 hora antes</SelectItem>
                    <SelectItem value="1440">1 dia antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600">
                Criar Evento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}