import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Camera, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

export default function AuditoriaVDAForm({ auditoria, onSubmit, currentUser, onCancel }) {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo_auditoria: "VDA_6.3",
    area_auditada: "",
    auditor_id: currentUser?.id || "",
    auditor_nome: currentUser?.nome_exibicao || currentUser?.full_name || "",
    data_auditoria: new Date().toISOString().split('T')[0],
    turno: currentUser?.turno || "manha",
    itens_checklist: [],
    nao_conformidades: [],
    observacoes_gerais: "",
    pontos_fortes: "",
    oportunidades_melhoria: "",
    status: "rascunho"
  });

  const [novoItem, setNovoItem] = useState({
    numero: "",
    descricao: "",
    categoria: "processo",
    status: "conforme",
    pontuacao: 10,
    comentario: "",
    evidencia_foto: ""
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (auditoria) {
      setFormData(auditoria);
    }
  }, [auditoria]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNovoItem({ ...novoItem, evidencia_foto: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const adicionarItem = () => {
    if (!novoItem.numero || !novoItem.descricao) return;

    setFormData({
      ...formData,
      itens_checklist: [...formData.itens_checklist, { ...novoItem }]
    });

    // Reseta o formulário de novo item
    setNovoItem({
      numero: "",
      descricao: "",
      categoria: "processo",
      status: "conforme",
      pontuacao: 10,
      comentario: "",
      evidencia_foto: ""
    });
  };

  const removerItem = (index) => {
    const novosItens = formData.itens_checklist.filter((_, i) => i !== index);
    setFormData({ ...formData, itens_checklist: novosItens });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "conforme": return "bg-green-100 text-green-800";
      case "nao_conforme": return "bg-red-100 text-red-800";
      case "observacao": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "conforme": return <CheckCircle className="w-4 h-4" />;
      case "nao_conforme": return <XCircle className="w-4 h-4" />;
      case "observacao": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
    >
      <Card className="w-full max-w-2xl shadow-2xl border-0 rounded-t-2xl rounded-b-none" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <CardHeader className="border-b bg-slate-50 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base text-slate-900">
              {auditoria ? "Editar Auditoria VDA" : "Nova Auditoria VDA"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Informações Gerais */}
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Auditoria *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Auditoria de Processo P1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_auditoria">Tipo de Auditoria *</Label>
                <Select
                  value={formData.tipo_auditoria}
                  onValueChange={(value) => setFormData({ ...formData, tipo_auditoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VDA_6.3">VDA 6.3 - Auditoria de Processo</SelectItem>
                    <SelectItem value="VDA_6.5">VDA 6.5 - Auditoria de Produto</SelectItem>
                    <SelectItem value="5S">5S - Housekeeping</SelectItem>
                    <SelectItem value="Layered_Process_Audit">LPA - Auditoria em Camadas</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_auditada">Área/Processo Auditado *</Label>
                <Input
                  id="area_auditada"
                  value={formData.area_auditada}
                  onChange={(e) => setFormData({ ...formData, area_auditada: e.target.value })}
                  placeholder="Ex: Linha de Montagem 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_auditoria">Data da Auditoria *</Label>
                <Input
                  id="data_auditoria"
                  type="date"
                  value={formData.data_auditoria}
                  onChange={(e) => setFormData({ ...formData, data_auditoria: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={formData.turno}
                  onValueChange={(value) => setFormData({ ...formData, turno: value })}
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
            </div>

            {/* Checklist */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#0066b1]" />
                Itens do Checklist
              </h3>

              {/* Form para adicionar novo item */}
              <Card className="mb-4 bg-gradient-to-r from-blue-50 to-white border border-slate-200">
                <CardContent className="pt-4 md:pt-6">
                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Número do Item *</Label>
                      <Input
                        value={novoItem.numero}
                        onChange={(e) => setNovoItem({ ...novoItem, numero: e.target.value })}
                        placeholder="Ex: P1, P2, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={novoItem.categoria}
                        onValueChange={(value) => setNovoItem({ ...novoItem, categoria: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processo">Processo</SelectItem>
                          <SelectItem value="produto">Produto</SelectItem>
                          <SelectItem value="documentacao">Documentação</SelectItem>
                          <SelectItem value="pessoal">Pessoal</SelectItem>
                          <SelectItem value="ambiente">Ambiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Descrição do Item *</Label>
                      <Textarea
                        value={novoItem.descricao}
                        onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                        placeholder="Descreva o item a ser auditado..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={novoItem.status}
                        onValueChange={(value) => setNovoItem({ ...novoItem, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conforme">Conforme</SelectItem>
                          <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                          <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                          <SelectItem value="observacao">Observação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Pontuação (0-10)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={novoItem.pontuacao}
                        onChange={(e) => setNovoItem({ ...novoItem, pontuacao: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Comentário/Observação</Label>
                      <Textarea
                        value={novoItem.comentario}
                        onChange={(e) => setNovoItem({ ...novoItem, comentario: e.target.value })}
                        placeholder="Adicione observações sobre este item..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Evidência Fotográfica</Label>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {uploading ? "Enviando..." : novoItem.evidencia_foto ? "Trocar Foto" : "Adicionar Foto"}
                        </Button>
                        {novoItem.evidencia_foto && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(novoItem.evidencia_foto, '_blank')}
                          >
                            Ver Foto
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={adicionarItem}
                    className="w-full bg-gradient-to-r from-[#001e50] to-[#0066b1] hover:from-[#001e50] hover:to-[#004d82]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item ao Checklist
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de itens adicionados */}
              <div className="space-y-2">
                {formData.itens_checklist.map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-[#0066b1]">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono">{item.numero}</Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline">{item.categoria}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {item.pontuacao}/10
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{item.descricao}</p>
                          {item.comentario && (
                            <p className="text-sm text-gray-600">{item.comentario}</p>
                          )}
                          {item.evidencia_foto && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={() => window.open(item.evidencia_foto, '_blank')}
                              className="p-0 h-auto text-indigo-600"
                            >
                              <Camera className="w-3 h-3 mr-1" />
                              Ver Evidência
                            </Button>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {formData.itens_checklist.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum item adicionado ainda. Use o formulário acima para adicionar itens.
                  </p>
                )}
              </div>
            </div>

            {/* Observações Finais */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Observações Finais</h3>

              <div className="space-y-2">
                <Label>Pontos Fortes Identificados</Label>
                <Textarea
                  value={formData.pontos_fortes}
                  onChange={(e) => setFormData({ ...formData, pontos_fortes: e.target.value })}
                  placeholder="Descreva os pontos positivos encontrados..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Oportunidades de Melhoria</Label>
                <Textarea
                  value={formData.oportunidades_melhoria}
                  onChange={(e) => setFormData({ ...formData, oportunidades_melhoria: e.target.value })}
                  placeholder="Sugestões de melhorias..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações Gerais</Label>
                <Textarea
                  value={formData.observacoes_gerais}
                  onChange={(e) => setFormData({ ...formData, observacoes_gerais: e.target.value })}
                  placeholder="Adicione observações gerais sobre a auditoria..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Status da Auditoria</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-9 text-sm">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 h-9 text-sm bg-[#0066b1] hover:bg-[#004d82]">
                {auditoria ? "Atualizar" : "Salvar Auditoria"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}