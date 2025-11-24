import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PlanoAcaoForm({ auditorias, currentUser, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    auditoria_id: "",
    nao_conformidade: "",
    causa_raiz: "",
    acao_imediata: "",
    acao_corretiva: "",
    acao_preventiva: "",
    responsavel_id: currentUser?.id || "",
    responsavel_nome: currentUser?.nome_exibicao || currentUser?.full_name || "",
    prazo_conclusao: "",
    status: "aberto"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.PlanoAcaoVDA.create(formData);
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Novo Plano de Ação</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Auditoria Relacionada *</Label>
              <Select
                value={formData.auditoria_id}
                onValueChange={(value) => setFormData({ ...formData, auditoria_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma auditoria" />
                </SelectTrigger>
                <SelectContent>
                  {auditorias.map((aud) => (
                    <SelectItem key={aud.id} value={aud.id}>
                      {aud.titulo} - {new Date(aud.data_auditoria).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Não Conformidade *</Label>
              <Textarea
                value={formData.nao_conformidade}
                onChange={(e) => setFormData({ ...formData, nao_conformidade: e.target.value })}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Causa Raiz (5 Porquês)</Label>
              <Textarea
                value={formData.causa_raiz}
                onChange={(e) => setFormData({ ...formData, causa_raiz: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Ação Imediata (Contenção)</Label>
              <Textarea
                value={formData.acao_imediata}
                onChange={(e) => setFormData({ ...formData, acao_imediata: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Ação Corretiva *</Label>
              <Textarea
                value={formData.acao_corretiva}
                onChange={(e) => setFormData({ ...formData, acao_corretiva: e.target.value })}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Ação Preventiva</Label>
              <Textarea
                value={formData.acao_preventiva}
                onChange={(e) => setFormData({ ...formData, acao_preventiva: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Prazo de Conclusão *</Label>
              <Input
                type="date"
                value={formData.prazo_conclusao}
                onChange={(e) => setFormData({ ...formData, prazo_conclusao: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Criar Plano de Ação
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}