import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TreinamentoForm({ treinamento, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(treinamento || {
    titulo: "",
    descricao: "",
    habilidade_relacionada: "",
    instrutor: "",
    instrutor_id: "",
    data_inicio: "",
    data_fim: "",
    carga_horaria: 0,
    local: "",
    status: "planejado"
  });
  
  const [instrutores, setInstrutores] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    
    // Carregar instrutores (usuários com cargo líder ou colaboradores com nível instrutor)
    const usuarios = await base44.entities.User.list();
    const versatilidade = await base44.entities.Versatilidade.list();
    
    const listaInstrutores = [
      ...usuarios.filter(u => u.cargo === "lider"),
      ...versatilidade.filter(v => 
        v.habilidades?.some(h => h.nivel === "instrutor")
      ).map(v => ({
        id: v.id,
        full_name: v.colaborador
      }))
    ];
    
    setInstrutores(listaInstrutores);
    
    if (!treinamento) {
      setFormData({
        ...formData,
        instrutor: user.nome_exibicao || user.full_name,
        instrutor_id: user.id
      });
    }
  };

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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-white border-b">
          <CardTitle>{treinamento ? "Editar Treinamento" : "Novo Treinamento"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Treinamento *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Treinamento de Fixação de Grade"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habilidade">Habilidade Relacionada</Label>
                <Input
                  id="habilidade"
                  type="number"
                  placeholder="Número da habilidade"
                  value={formData.habilidade_relacionada}
                  onChange={(e) => setFormData({...formData, habilidade_relacionada: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o conteúdo do treinamento"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instrutor">Instrutor *</Label>
                <Select
                  value={formData.instrutor_id}
                  onValueChange={(value) => {
                    const instrutor = instrutores.find(i => i.id === value);
                    setFormData({
                      ...formData,
                      instrutor_id: value,
                      instrutor: instrutor?.full_name || instrutor?.colaborador || ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o instrutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instrutores.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.full_name || inst.colaborador}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  placeholder="Sala de treinamento, Linha de produção, etc"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Término</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carga_horaria">Carga Horária (horas)</Label>
                <Input
                  id="carga_horaria"
                  type="number"
                  min="0"
                  value={formData.carga_horaria}
                  onChange={(e) => setFormData({...formData, carga_horaria: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {treinamento ? "Atualizar" : "Criar Treinamento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}