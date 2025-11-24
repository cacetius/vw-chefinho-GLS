import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, X } from "lucide-react";

const criteriosPadrao = [
  { nome: "Comunicação", nota: 3 },
  { nome: "Trabalho em Equipe", nota: 3 },
  { nome: "Proatividade", nota: 3 },
  { nome: "Qualidade do Trabalho", nota: 3 },
  { nome: "Cumprimento de Prazos", nota: 3 }
];

export default function FeedbackForm({ onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    avaliado_id: "",
    avaliado_nome: "",
    avaliador_id: currentUser?.id || "",
    avaliador_nome: currentUser?.nome_exibicao || currentUser?.full_name || "",
    anonimo: false,
    periodo: new Date().toISOString().split('T')[0],
    criterios: criteriosPadrao,
    pontos_fortes: "",
    pontos_melhoria: "",
    comentario_geral: ""
  });

  const handleCriterioChange = (index, nota) => {
    const novosCriterios = [...formData.criterios];
    novosCriterios[index].nota = nota;
    setFormData({ ...formData, criterios: novosCriterios });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.avaliado_id || !formData.avaliado_nome) {
      alert("Por favor, preencha o ID e nome do colaborador a avaliar");
      return;
    }
    
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
          <CardTitle>Dar Feedback</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Atenção:</strong> Preencha o ID e nome do colaborador que deseja avaliar. 
                Você pode encontrar essas informações na página de Versatilidade.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avaliado_id">ID do Colaborador *</Label>
                <Input
                  id="avaliado_id"
                  placeholder="ID do colaborador"
                  value={formData.avaliado_id}
                  onChange={(e) => setFormData({...formData, avaliado_id: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avaliado_nome">Nome do Colaborador *</Label>
                <Input
                  id="avaliado_nome"
                  placeholder="Nome do colaborador"
                  value={formData.avaliado_nome}
                  onChange={(e) => setFormData({...formData, avaliado_nome: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo">Período de Referência *</Label>
              <Input
                id="periodo"
                type="date"
                value={formData.periodo}
                onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonimo"
                checked={formData.anonimo}
                onChange={(e) => setFormData({...formData, anonimo: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="anonimo" className="cursor-pointer">
                Feedback anônimo
              </Label>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Critérios de Avaliação</Label>
              {formData.criterios.map((criterio, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{criterio.nome}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <button
                        key={nota}
                        type="button"
                        onClick={() => handleCriterioChange(index, nota)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            nota <= criterio.nota
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontos_fortes">Pontos Fortes</Label>
              <Textarea
                id="pontos_fortes"
                value={formData.pontos_fortes}
                onChange={(e) => setFormData({...formData, pontos_fortes: e.target.value})}
                placeholder="O que o colaborador faz bem?"
                className="h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontos_melhoria">Pontos de Melhoria</Label>
              <Textarea
                id="pontos_melhoria"
                value={formData.pontos_melhoria}
                onChange={(e) => setFormData({...formData, pontos_melhoria: e.target.value})}
                placeholder="O que pode ser melhorado?"
                className="h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentario_geral">Comentário Geral</Label>
              <Textarea
                id="comentario_geral"
                value={formData.comentario_geral}
                onChange={(e) => setFormData({...formData, comentario_geral: e.target.value})}
                placeholder="Comentários adicionais..."
                className="h-32"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
                Enviar Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}