import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Lightbulb, Paperclip, CheckCircle2, XCircle, Clock, Search, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const STATUS_CONFIG = {
  pendente:       { label: "Pendente",    bg: "bg-slate-100 text-slate-700",    icon: Clock },
  em_analise:     { label: "Em Análise",  bg: "bg-blue-100 text-blue-800",      icon: Search },
  aprovada:       { label: "Aprovada",    bg: "bg-purple-100 text-purple-800",  icon: CheckCircle2 },
  implementada:   { label: "Implementada",bg: "bg-green-100 text-green-800",    icon: CheckCircle2 },
  rejeitada:      { label: "Rejeitada",   bg: "bg-red-100 text-red-800",        icon: XCircle },
};

const CAT_COLORS = {
  processo: "bg-blue-100 text-blue-800",
  seguranca: "bg-red-100 text-red-800",
  qualidade: "bg-green-100 text-green-800",
  ambiente: "bg-teal-100 text-teal-800",
  custos: "bg-yellow-100 text-yellow-800",
  outro: "bg-gray-100 text-gray-800"
};

const STATUS_ORDER = ["pendente", "em_analise", "aprovada", "implementada", "rejeitada"];

function RespostaLider({ sugestao, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [resposta, setResposta] = useState(sugestao.resposta_lider || "");
  const [status, setStatus] = useState(sugestao.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Sugestao.update(sugestao.id, {
      ...sugestao,
      resposta_lider: resposta,
      status,
      data_implementacao: status === "implementada" ? new Date().toISOString().split("T")[0] : sugestao.data_implementacao
    });
    setSaving(false);
    setOpen(false);
    onUpdate();
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs h-7 border-[#0066b1] text-[#0066b1] hover:bg-blue-50">
        <MessageSquare className="w-3 h-3 mr-1" /> Responder / Atualizar Status
      </Button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 border border-[#0066b1]/30 bg-blue-50/40 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-slate-700">Resposta do Líder</p>
      <Textarea
        value={resposta}
        onChange={e => setResposta(e.target.value)}
        placeholder="Escreva uma resposta para o colaborador..."
        className="text-sm h-20 resize-none"
      />
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_ORDER.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all font-medium ${
              status === s ? STATUS_CONFIG[s].bg + " border-transparent" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs bg-[#0066b1] hover:bg-[#004d82]">
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 text-xs">Cancelar</Button>
      </div>
    </motion.div>
  );
}

export default function SugestaosList({ sugestoes, currentUser, onVotar, onUpdate }) {
  const [filtro, setFiltro] = useState("todas");
  const isLider = currentUser?.cargo === "lider";

  const filtradas = filtro === "todas" ? sugestoes : sugestoes.filter(s => s.status === filtro);

  const jaVotou = (s, tipo) => s.votos?.some(v => v.usuario_id === currentUser?.id && v.tipo === tipo);

  if (sugestoes.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="py-12 text-center text-slate-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma sugestão ainda.</p>
          <p className="text-xs mt-1">Seja o primeiro a compartilhar uma ideia!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros de status */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ key: "todas", label: `Todas (${sugestoes.length})` },
          ...STATUS_ORDER.map(s => ({
            key: s,
            label: `${STATUS_CONFIG[s].label} (${sugestoes.filter(x => x.status === s).length})`
          }))
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
              filtro === f.key
                ? "bg-[#0066b1] text-white border-[#0066b1]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtradas.map((sugestao) => {
          const cfg = STATUS_CONFIG[sugestao.status] || STATUS_CONFIG.pendente;
          const StatusIcon = cfg.icon;
          const isImplementada = sugestao.status === "implementada";
          const isRejeitada = sugestao.status === "rejeitada";

          return (
            <motion.div
              key={sugestao.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              layout
            >
              <Card className={`border transition-all ${isImplementada ? "border-green-200 bg-green-50/20" : isRejeitada ? "border-red-100 bg-red-50/10 opacity-70" : "border-slate-200"}`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isImplementada ? "bg-green-100" : "bg-amber-100"}`}>
                      {isImplementada
                        ? <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                        : <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{sugestao.titulo}</h3>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Badge className={`text-[10px] px-2 py-0 flex items-center gap-1 ${cfg.bg}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {cfg.label}
                          </Badge>
                          <Badge className={`text-[10px] px-2 py-0 ${CAT_COLORS[sugestao.categoria]}`}>
                            {sugestao.categoria}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Por {sugestao.autor_nome} • {format(new Date(sugestao.created_date), "dd/MM/yyyy", { locale: ptBR })}
                        {sugestao.data_implementacao && ` • Implementada em ${format(new Date(sugestao.data_implementacao), "dd/MM/yyyy", { locale: ptBR })}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-1">
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{sugestao.descricao}</p>

                  {sugestao.anexos?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {sugestao.anexos.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                          <Paperclip className="w-3 h-3" /> {a.nome}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Resposta do líder */}
                  {sugestao.resposta_lider && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg mb-3 text-xs">
                      <p className="font-semibold text-blue-900 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Resposta do Líder</p>
                      <p className="text-blue-800 leading-relaxed">{sugestao.resposta_lider}</p>
                    </div>
                  )}

                  {/* Destaque implementada */}
                  {isImplementada && (
                    <div className="p-2.5 bg-green-100 border border-green-300 rounded-lg mb-3 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                      <span className="font-semibold text-green-800">✅ Esta sugestão foi implementada!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={jaVotou(sugestao, "positivo") ? "default" : "outline"}
                        size="sm"
                        onClick={() => onVotar(sugestao, "positivo")}
                        className={`h-7 text-xs px-2.5 ${jaVotou(sugestao, "positivo") ? "bg-green-600 hover:bg-green-700" : ""}`}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {sugestao.votos?.filter(v => v.tipo === "positivo").length || 0}
                      </Button>
                      <Button
                        variant={jaVotou(sugestao, "negativo") ? "default" : "outline"}
                        size="sm"
                        onClick={() => onVotar(sugestao, "negativo")}
                        className={`h-7 text-xs px-2.5 ${jaVotou(sugestao, "negativo") ? "bg-red-600 hover:bg-red-700" : ""}`}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        {sugestao.votos?.filter(v => v.tipo === "negativo").length || 0}
                      </Button>
                      <span className="text-[10px] text-slate-500 ml-1">Pontos: {sugestao.total_votos || 0}</span>
                    </div>

                    {isLider && <RespostaLider sugestao={sugestao} onUpdate={onUpdate} />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {filtradas.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">Nenhuma sugestão nesta categoria.</div>
      )}
    </div>
  );
}