import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SugestaoForm({ onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "processo",
    autor_id: currentUser?.id || "",
    autor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "",
    anexos: []
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        anexos: [...formData.anexos, { url: file_url, nome: file.name }]
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-50 to-white border-b">
          <CardTitle>Nova Sugestão</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Sugestão *</Label>
              <Input
                id="titulo"
                placeholder="Resuma sua ideia em uma frase"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
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
                  <SelectItem value="processo">Processo</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="ambiente">Ambiente</SelectItem>
                  <SelectItem value="custos">Custos</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição Detalhada *</Label>
              <Textarea
                id="descricao"
                placeholder="Explique sua sugestão com detalhes. O que seria melhorado? Como implementar?"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anexo">Anexar Arquivo (opcional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="anexo"
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx"
                />
                {uploading && <span className="text-sm text-gray-500">Enviando...</span>}
              </div>
              {formData.anexos.length > 0 && (
                <div className="text-sm text-gray-600">
                  {formData.anexos.length} arquivo(s) anexado(s)
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-yellow-500">
                Enviar Sugestão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}