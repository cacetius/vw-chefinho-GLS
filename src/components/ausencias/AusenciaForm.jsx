import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AusenciaForm({ ausencia, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(ausencia || {
    tipo: "ferias",
    data_inicio: "",
    data_fim: "",
    motivo: "",
    anexo: ""
  });
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({...formData, anexo: file_url});
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
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white border-b">
          <CardTitle>{ausencia ? "Editar Solicitação" : "Nova Solicitação de Ausência"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Ausência *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({...formData, tipo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="folga">Folga</SelectItem>
                  <SelectItem value="atestado">Atestado Médico</SelectItem>
                  <SelectItem value="licenca">Licença</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                <Label htmlFor="data_fim">Data de Término *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo/Justificativa *</Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo da ausência"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                className="h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Anexar Documento (Atestado, etc)</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Enviando..." : formData.anexo ? "Alterar Documento" : "Selecionar Documento"}
                </Button>
                {formData.anexo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(formData.anexo, '_blank')}
                  >
                    Ver Documento
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {ausencia ? "Atualizar" : "Solicitar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}