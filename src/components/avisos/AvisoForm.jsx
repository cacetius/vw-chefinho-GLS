import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function AvisoForm({ aviso, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(aviso || {
    titulo: "",
    conteudo: "",
    prioridade: "normal",
    categoria: "geral",
    fixado: false
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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-50 to-white border-b">
          <CardTitle>{aviso ? "Editar Aviso" : "Novo Aviso"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Aviso *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Mudança no horário de almoço"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo *</Label>
              <Textarea
                id="conteudo"
                placeholder="Descreva o aviso com detalhes..."
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                className="h-32"
                required
              />
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
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="importante">Importante</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="epi">EPI</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fixado"
                checked={formData.fixado}
                onChange={(e) => setFormData({...formData, fixado: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="fixado" className="cursor-pointer">
                Fixar este aviso no topo
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                {aviso ? "Atualizar" : "Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}