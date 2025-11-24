import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CarroForm({ carro, onSubmit, currentUser, onCancel }) {
  const [formData, setFormData] = useState({
    chassi: "",
    modelo: "",
    cor: "#FFFFFF",
    posicao_linha: 1,
    estacao_atual: "entrada",
    status: "aguardando",
    turno: currentUser?.turno || "manha",
    problemas: [],
    observacoes: ""
  });

  const [novoProblema, setNovoProblema] = useState({
    tipo: "qualidade",
    descricao: "",
    severidade: "media",
    responsavel: currentUser?.nome_exibicao || currentUser?.full_name || ""
  });

  useEffect(() => {
    if (carro) {
      setFormData(carro);
    }
  }, [carro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const adicionarProblema = () => {
    if (!novoProblema.descricao) return;
    
    setFormData({
      ...formData,
      problemas: [...(formData.problemas || []), {
        ...novoProblema,
        data_deteccao: new Date().toISOString(),
        resolvido: false
      }],
      status: "erro"
    });

    setNovoProblema({
      tipo: "qualidade",
      descricao: "",
      severidade: "media",
      responsavel: currentUser?.nome_exibicao || currentUser?.full_name || ""
    });
  };

  const removerProblema = (index) => {
    const novosProblemas = formData.problemas.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      problemas: novosProblemas,
      status: novosProblemas.length === 0 ? "ok" : "erro"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-gray-900">
              {carro ? "Editar Carro" : "Adicionar Carro à Linha"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chassi">Chassi *</Label>
                <Input
                  id="chassi"
                  value={formData.chassi}
                  onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
                  placeholder="Ex: 9BWAA45U9ET123456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Select
                  value={formData.modelo}
                  onValueChange={(value) => setFormData({ ...formData, modelo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gol">Gol</SelectItem>
                    <SelectItem value="Polo">Polo</SelectItem>
                    <SelectItem value="Virtus">Virtus</SelectItem>
                    <SelectItem value="T-Cross">T-Cross</SelectItem>
                    <SelectItem value="Nivus">Nivus</SelectItem>
                    <SelectItem value="Taos">Taos</SelectItem>
                    <SelectItem value="Tiguan">Tiguan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="Nome da cor"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posicao_linha">Posição na Linha</Label>
                <Input
                  id="posicao_linha"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.posicao_linha}
                  onChange={(e) => setFormData({ ...formData, posicao_linha: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estacao_atual">Estação Atual</Label>
                <Select
                  value={formData.estacao_atual}
                  onValueChange={(value) => setFormData({ ...formData, estacao_atual: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[500px]">
                    <SelectItem value="entrada">🚪 Entrada</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-slate-600 to-slate-700">CHAPARIA</div>
                    <SelectItem value="chaparia_solda">⚡ Chaparia Solda</SelectItem>
                    <SelectItem value="chaparia_geometria">📐 Geometria</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700">MONTAGEM ZP</div>
                    <SelectItem value="zp1_piso">🔲 ZP1 - Piso</SelectItem>
                    <SelectItem value="zp2_lateral">🔳 ZP2 - Lateral</SelectItem>
                    <SelectItem value="zp3_teto">🏠 ZP3 - Teto</SelectItem>
                    <SelectItem value="zp4_portas">🚪 ZP4 - Portas</SelectItem>
                    <SelectItem value="zp5_suspensao_dianteira">🔧 ZP5 - Suspensão Dianteira</SelectItem>
                    <SelectItem value="zp6_motor_cambio">⚙️ ZP6 - Motor/Câmbio</SelectItem>
                    <SelectItem value="zp7_suspensao_traseira">🔩 ZP7 - Suspensão Traseira</SelectItem>
                    <SelectItem value="zp8_rodas_pneus">⭕ ZP8 - Rodas/Pneus</SelectItem>
                    <SelectItem value="zp9_parachoque_dianteiro">🛡️ ZP9 - Para-choque Diant.</SelectItem>
                    <SelectItem value="zp10_parachoque_traseiro">🛡️ ZP10 - Para-choque Tras.</SelectItem>
                    <SelectItem value="zp11_chicotes_eletricos">🔌 ZP11 - Chicotes Elétricos</SelectItem>
                    <SelectItem value="zp12_painel_instrumentos">📊 ZP12 - Painel</SelectItem>
                    <SelectItem value="zp13_bancos">💺 ZP13 - Bancos</SelectItem>
                    <SelectItem value="zp14_vidros">🪟 ZP14 - Vidros</SelectItem>
                    <SelectItem value="zp15_acabamento_interno">✨ ZP15 - Acabamento Interno</SelectItem>
                    <SelectItem value="zp16_capo_tampa">📦 ZP16 - Capô/Tampa</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-700">PINTURA</div>
                    <SelectItem value="pintura_fosfatizacao">🧪 Fosfatização</SelectItem>
                    <SelectItem value="pintura_ecoat">🔋 E-Coat</SelectItem>
                    <SelectItem value="pintura_primer">🖌️ Primer</SelectItem>
                    <SelectItem value="pintura_base">🎨 Base Coat</SelectItem>
                    <SelectItem value="pintura_verniz">✨ Verniz</SelectItem>
                    <SelectItem value="pintura_secagem">💨 Secagem</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700">PCP</div>
                    <SelectItem value="pcp_polimento">💎 PCP - Polimento</SelectItem>
                    <SelectItem value="pcp_retoque">🖊️ PCP - Retoque</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-700">QUALIDADE & TESTES</div>
                    <SelectItem value="qualidade_auditoria">🔍 Auditoria 100%</SelectItem>
                    <SelectItem value="qualidade_agua">💧 Teste Água</SelectItem>
                    <SelectItem value="teste_dinamometro">📈 Dinamômetro</SelectItem>
                    <SelectItem value="teste_alinhamento">🎯 Alinhamento</SelectItem>
                    <SelectItem value="teste_luz">💡 Teste Farol</SelectItem>
                    <SelectItem value="teste_road">🛣️ Road Test</SelectItem>
                    
                    <div className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-700">EXPEDIÇÃO</div>
                    <SelectItem value="expedicao_limpeza">🧽 Limpeza Final</SelectItem>
                    <SelectItem value="expedicao_final">📦 Expedição</SelectItem>
                    <SelectItem value="saida">🏁 Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="em_processo">Em Processo</SelectItem>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="alerta">Alerta</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Problemas */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Problemas / Não Conformidades</h3>
              
              {/* Form para adicionar problema */}
              <Card className="mb-4 bg-gradient-to-r from-red-50 to-pink-50">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Tipo de Problema</Label>
                      <Select
                        value={novoProblema.tipo}
                        onValueChange={(value) => setNovoProblema({ ...novoProblema, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qualidade">Qualidade</SelectItem>
                          <SelectItem value="montagem">Montagem</SelectItem>
                          <SelectItem value="pintura">Pintura</SelectItem>
                          <SelectItem value="eletrica">Elétrica</SelectItem>
                          <SelectItem value="mecanica">Mecânica</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Severidade</Label>
                      <Select
                        value={novoProblema.severidade}
                        onValueChange={(value) => setNovoProblema({ ...novoProblema, severidade: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Descrição do Problema</Label>
                      <Textarea
                        value={novoProblema.descricao}
                        onChange={(e) => setNovoProblema({ ...novoProblema, descricao: e.target.value })}
                        placeholder="Descreva o problema encontrado..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={adicionarProblema}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Problema
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de problemas */}
              {formData.problemas && formData.problemas.length > 0 && (
                <div className="space-y-2">
                  {formData.problemas.map((problema, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{problema.tipo}</Badge>
                              <Badge className={
                                problema.severidade === "critica" ? "bg-red-600" :
                                problema.severidade === "alta" ? "bg-orange-500" :
                                problema.severidade === "media" ? "bg-yellow-500" :
                                "bg-blue-500"
                              }>
                                {problema.severidade}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{problema.descricao}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Responsável: {problema.responsavel}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removerProblema(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre o veículo..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {carro ? "Atualizar" : "Adicionar à Linha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}