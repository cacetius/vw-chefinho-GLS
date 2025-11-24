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

export default function DocumentoForm({ onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "procedimento",
    arquivo_url: "",
    tipo_arquivo: "",
    versao: "1.0",
    tags: [],
    acesso: "publico",
    autor: currentUser?.nome_exibicao || currentUser?.full_name || "",
    data_validade: ""
  });
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        arquivo_url: file_url,
        tipo_arquivo: file.type
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-white border-b">
          <CardTitle>Adicionar Documento</CardTitle>
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
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="politica">Política</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="arquivo"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
                {uploading && <span className="text-sm text-gray-500">Enviando...</span>}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input
                  id="versao"
                  value={formData.versao}
                  onChange={(e) => setFormData({...formData, versao: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acesso">Nível de Acesso</Label>
                <Select
                  value={formData.acesso}
                  onValueChange={(value) => setFormData({...formData, acesso: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="monitor">Apenas Monitores</SelectItem>
                    <SelectItem value="lider">Apenas Líderes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_validade">Data de Validade</Label>
                <Input
                  id="data_validade"
                  type="date"
                  value={formData.data_validade}
                  onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Digite uma tag e pressione Enter"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.arquivo_url} className="bg-[#0066b1]">
                Adicionar Documento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}