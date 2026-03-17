import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Car, AlertTriangle } from "lucide-react";

// Modelos disponíveis na linha
const MODELOS = {
  Polo: {
    label: "Polo",
    emoji: "🚗",
    versoes: ["Track", "Highline", "Comfortline", "GTS", "Black", "Turbo 200", "Polo"]
  },
  Tera: {
    label: "T-Tera",
    emoji: "🚙",
    versoes: ["Comfort", "Comfortline", "R-Line", "Highline", "VW Play"]
  }
};

const CORES_RAPIDAS = [
  { nome: "Branco Puro", hex: "#F5F5F5" },
  { nome: "Prata Tungstênio", hex: "#9E9E9E" },
  { nome: "Preto Ninja", hex: "#1C1C1C" },
  { nome: "Cinza Platinum", hex: "#707070" },
  { nome: "Vermelho Flash", hex: "#C62828" },
  { nome: "Azul Biarritz", hex: "#1565C0" },
  { nome: "Bege Savanna", hex: "#C8B89A" },
];

export default function CarroForm({ carro, onSubmit, currentUser, onCancel }) {
  const [formData, setFormData] = useState({
    chassi: "",
    plataforma: "Polo",
    modelo: "",
    cor: "#F5F5F5",
    cor_nome: "Branco Puro",
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
      setFormData({
        ...carro,
        plataforma: carro.plataforma || (carro.modelo?.includes("Tera") ? "Tera" : "Polo")
      });
    }
  }, [carro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const adicionarProblema = () => {
    if (!novoProblema.descricao) return;
    setFormData(f => ({
      ...f,
      problemas: [...(f.problemas || []), { ...novoProblema, data_deteccao: new Date().toISOString(), resolvido: false }],
      status: "erro"
    }));
    setNovoProblema({ tipo: "qualidade", descricao: "", severidade: "media", responsavel: currentUser?.nome_exibicao || currentUser?.full_name || "" });
  };

  const removerProblema = (index) => {
    const novos = formData.problemas.filter((_, i) => i !== index);
    setFormData(f => ({ ...f, problemas: novos, status: novos.length === 0 ? "ok" : "erro" }));
  };

  const plataformaAtual = MODELOS[formData.plataforma] || MODELOS.Polo;

  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <Card className="border border-slate-200 shadow-sm mb-4">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0066b1]" />
            {carro ? "Editar Veículo" : "Adicionar à Linha"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="w-7 h-7"><X className="w-4 h-4" /></Button>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Plataforma (Polo ou Tera) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Plataforma *</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MODELOS).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, plataforma: key, modelo: "" }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      formData.plataforma === key
                        ? "border-[#0066b1] bg-[#0066b1]/10 text-[#0066b1]"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Versão */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Versão *</Label>
              <div className="flex flex-wrap gap-1.5">
                {plataformaAtual.versoes.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, modelo: `${f.plataforma} ${v}` }))}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      formData.modelo === `${formData.plataforma} ${v}`
                        ? "bg-[#0066b1] text-white border-[#0066b1]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {formData.modelo && (
                <p className="text-[11px] text-slate-400">Selecionado: <strong className="text-[#0066b1]">{formData.modelo}</strong></p>
              )}
            </div>

            {/* Chassi + Posição */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Chassi *</Label>
                <Input value={formData.chassi}
                  onChange={e => setFormData(f => ({ ...f, chassi: e.target.value }))}
                  placeholder="Ex: 9BWAA45U..." required className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Posição na Linha</Label>
                <Input type="number" min="1" max="999" value={formData.posicao_linha}
                  onChange={e => setFormData(f => ({ ...f, posicao_linha: parseInt(e.target.value) || 1 }))}
                  className="h-9 text-sm" />
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {CORES_RAPIDAS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, cor: c.hex, cor_nome: c.nome }))}
                    title={c.nome}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                      formData.cor === c.hex ? "border-[#0066b1] scale-110 ring-2 ring-[#0066b1]/30" : "border-white shadow"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-1">
                  <input type="color" value={formData.cor}
                    onChange={e => setFormData(f => ({ ...f, cor: e.target.value, cor_nome: e.target.value }))}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" />
                  <span className="text-xs text-slate-500">{formData.cor_nome}</span>
                </div>
              </div>
            </div>

            {/* Estação + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Estação Atual</Label>
                <Select value={formData.estacao_atual} onValueChange={v => setFormData(f => ({ ...f, estacao_atual: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="entrada">🚪 Entrada</SelectItem>
                    <SelectItem value="chaparia_solda">⚡ Solda</SelectItem>
                    <SelectItem value="chaparia_geometria">📐 Geometria</SelectItem>
                    <SelectItem value="zp1">ZP1</SelectItem>
                    <SelectItem value="zp2">ZP2</SelectItem>
                    <SelectItem value="zp3">ZP3</SelectItem>
                    <SelectItem value="zp4">ZP4</SelectItem>
                    <SelectItem value="zp5">ZP5</SelectItem>
                    <SelectItem value="zp6">ZP6</SelectItem>
                    <SelectItem value="zp7">ZP7</SelectItem>
                    <SelectItem value="zp8">ZP8</SelectItem>
                    <SelectItem value="celula_parachoque">🛡️ Parachoque</SelectItem>
                    <SelectItem value="dress_up">👔 Dress Up</SelectItem>
                    <SelectItem value="chicotes">🔌 Chicotes</SelectItem>
                    <SelectItem value="vidros">🪟 Vidros</SelectItem>
                    <SelectItem value="doorless">🚗 Doorless</SelectItem>
                    <SelectItem value="bancos">💺 Bancos</SelectItem>
                    <SelectItem value="acabamento_interno">✨ Acabamento</SelectItem>
                    <SelectItem value="capo_tampa">📦 Capô/Tampa</SelectItem>
                    <SelectItem value="pintura_fosfatizacao">🧪 Fosfatização</SelectItem>
                    <SelectItem value="pintura_ecoat">🔋 E-Coat</SelectItem>
                    <SelectItem value="pintura_primer">🖌️ Primer</SelectItem>
                    <SelectItem value="pintura_base">🎨 Base Coat</SelectItem>
                    <SelectItem value="pintura_verniz">✨ Verniz</SelectItem>
                    <SelectItem value="pintura_secagem">💨 Secagem</SelectItem>
                    <SelectItem value="pcp_polimento">💎 Polimento</SelectItem>
                    <SelectItem value="pcp_retoque">🖊️ Retoque</SelectItem>
                    <SelectItem value="qualidade_auditoria">🔍 Auditoria</SelectItem>
                    <SelectItem value="qualidade_agua">💧 Teste Água</SelectItem>
                    <SelectItem value="teste_dinamometro">📈 Dinamômetro</SelectItem>
                    <SelectItem value="teste_alinhamento">🎯 Alinhamento</SelectItem>
                    <SelectItem value="teste_luz">💡 Teste Farol</SelectItem>
                    <SelectItem value="teste_road">🛣️ Road Test</SelectItem>
                    <SelectItem value="expedicao_limpeza">🧽 Limpeza Final</SelectItem>
                    <SelectItem value="expedicao_final">📦 Expedição</SelectItem>
                    <SelectItem value="saida">🏁 Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">⏳ Aguardando</SelectItem>
                    <SelectItem value="em_processo">⚙️ Em Processo</SelectItem>
                    <SelectItem value="ok">✅ OK</SelectItem>
                    <SelectItem value="alerta">⚠️ Alerta</SelectItem>
                    <SelectItem value="erro">🔴 Erro</SelectItem>
                    <SelectItem value="concluido">🏁 Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Problemas */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-slate-700">Problemas / Não Conformidades</span>
                {formData.problemas?.length > 0 && (
                  <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5">{formData.problemas.length}</Badge>
                )}
              </div>

              <div className="bg-red-50 rounded-xl p-3 space-y-2 mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={novoProblema.tipo} onValueChange={v => setNovoProblema(p => ({ ...p, tipo: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualidade">Qualidade</SelectItem>
                      <SelectItem value="montagem">Montagem</SelectItem>
                      <SelectItem value="pintura">Pintura</SelectItem>
                      <SelectItem value="eletrica">Elétrica</SelectItem>
                      <SelectItem value="mecanica">Mecânica</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={novoProblema.severidade} onValueChange={v => setNovoProblema(p => ({ ...p, severidade: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica 🔴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input value={novoProblema.descricao}
                  onChange={e => setNovoProblema(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descreva o problema..." className="h-8 text-xs" />
                <Button type="button" onClick={adicionarProblema} size="sm"
                  className="w-full h-8 text-xs bg-red-600 hover:bg-red-700">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Problema
                </Button>
              </div>

              {formData.problemas?.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white border-l-4 border-l-red-400 rounded-lg mb-1.5 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1 mb-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{p.tipo}</Badge>
                      <Badge className={`text-[9px] px-1 py-0 ${p.severidade === "critica" ? "bg-red-600" : p.severidade === "alta" ? "bg-orange-500" : p.severidade === "media" ? "bg-yellow-500" : "bg-blue-400"}`}>{p.severidade}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-tight">{p.descricao}</p>
                  </div>
                  <button type="button" onClick={() => removerProblema(i)}
                    className="p-1 text-red-400 hover:text-red-600 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <Label className="text-xs">Observações</Label>
              <Textarea value={formData.observacoes}
                onChange={e => setFormData(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Observações adicionais..." className="h-16 text-sm resize-none" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-9 text-sm">Cancelar</Button>
              <Button type="submit" className="flex-1 h-9 text-sm bg-[#0066b1] hover:bg-[#004d82]">
                {carro ? "Atualizar" : "Adicionar à Linha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}