import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Play, Pencil, Trash2, FileText, Calendar, Users, Loader2, AlertCircle } from "lucide-react";
import DialogoForm from "@/components/dialogo/DialogoForm";
import DialogoApresentacao from "@/components/dialogo/DialogoApresentacao";

const TIPO_LABELS = {
  dds: "DDS", reuniao_seguranca: "Reunião Seg.", treinamento: "Treinamento",
  procedimento: "Procedimento", outro: "Outro"
};
const STATUS_COLORS = {
  rascunho: "bg-amber-100 text-amber-800",
  processado: "bg-blue-100 text-blue-800",
  apresentado: "bg-green-100 text-green-800"
};
const TIPO_COLORS = {
  dds: "bg-red-100 text-red-700", reuniao_seguranca: "bg-purple-100 text-purple-700",
  treinamento: "bg-blue-100 text-blue-700", procedimento: "bg-green-100 text-green-700", outro: "bg-gray-100 text-gray-700"
};

export default function DialogoSeguranca() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [presenting, setPresenting] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [aiError, setAiError] = useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser); }, []);

  const { data: dialogos = [], isLoading } = useQuery({
    queryKey: ["dialogos"],
    queryFn: () => base44.entities.DialogoSeguranca.list("-created_date", 50),
  });

  const createMut = useMutation({
    mutationFn: d => base44.entities.DialogoSeguranca.create(d),
    onSuccess: () => { qc.invalidateQueries(["dialogos"]); setShowForm(false); }
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DialogoSeguranca.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["dialogos"]); setEditing(null); }
  });
  const deleteMut = useMutation({
    mutationFn: id => base44.entities.DialogoSeguranca.delete(id),
    onSuccess: () => qc.invalidateQueries(["dialogos"])
  });

  const processarComIA = async (dialogo) => {
    setProcessingId(dialogo.id);
    setAiError(null);
    const conteudo = dialogo.conteudo || dialogo.titulo;
    let textoBase = conteudo;

    // Se tem arquivo, extrai conteúdo
    if (dialogo.arquivo_url && dialogo.arquivo_nome) {
      try {
        const resultado = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: dialogo.arquivo_url,
          json_schema: { type: "object", properties: { texto: { type: "string", description: "Todo o texto do documento" } } }
        });
        if (resultado.status === "success" && resultado.output?.texto) {
          textoBase = resultado.output.texto;
        }
      } catch (e) { /* usa conteudo do campo */ }
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em segurança do trabalho industrial. Analise o seguinte diálogo/documento e crie uma apresentação didática em 5 a 7 slides para ser apresentada aos trabalhadores.

Documento: "${textoBase}"

Responda com um JSON com:
- resumo: string (resumo executivo em 2-3 frases)
- slides: array de objetos com: titulo (string, máx 8 palavras), texto (string, máx 40 palavras, claro e direto para operadores), emoji (1 emoji representativo)

O primeiro slide deve ser uma introdução e o último deve ser uma conclusão/chamada para ação. Linguagem simples e direta.`,
      response_json_schema: {
        type: "object",
        properties: {
          resumo: { type: "string" },
          slides: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, texto: { type: "string" }, emoji: { type: "string" } } } }
        }
      }
    });

    await updateMut.mutateAsync({
      id: dialogo.id,
      data: { resumo_ia: result.resumo, slides_ia: result.slides, status: "processado" }
    });
    setProcessingId(null);
  };

  const handleSave = async (form) => {
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: form });
    else await createMut.mutateAsync(form);
  };

  const handlePresent = (d) => {
    setPresenting(d);
    updateMut.mutate({ id: d.id, data: { status: "apresentado" } });
  };

  if (presenting) {
    return <DialogoApresentacao dialogo={presenting} onClose={() => { setPresenting(null); qc.invalidateQueries(["dialogos"]); }} />;
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Diálogos de Segurança</h2>
          <p className="text-xs text-slate-500">Adicione documentos, resuma com IA e apresente com voz</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); }}
          className="h-9 text-sm bg-[#0066b1] hover:bg-[#0055a0] shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {(showForm || editing) && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <DialogoForm
              dialogo={editing}
              currentUser={currentUser}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI error */}
      {aiError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {aiError}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : dialogos.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum diálogo cadastrado</p>
          <p className="text-xs mt-1">Clique em "Novo" para adicionar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dialogos.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border border-slate-200 hover:shadow-md transition-all">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0066b1] to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">{d.titulo}</h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEditing(d); setShowForm(false); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteMut.mutate(d.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${TIPO_COLORS[d.tipo]}`}>{TIPO_LABELS[d.tipo]}</Badge>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[d.status]}`}>{d.status}</Badge>
                        {d.equipe && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><Users className="w-2.5 h-2.5 mr-0.5" />{d.equipe}</Badge>}
                        {d.data_dialogo && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5"><Calendar className="w-2.5 h-2.5 mr-0.5" />{new Date(d.data_dialogo).toLocaleDateString("pt-BR")}</Badge>}
                      </div>

                      {d.resumo_ia && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 bg-blue-50 rounded-lg px-2 py-1">
                          <Sparkles className="w-3 h-3 inline mr-1 text-blue-500" />{d.resumo_ia}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2.5">
                        {d.status === "rascunho" || !d.slides_ia?.length ? (
                          <Button size="sm" variant="outline"
                            disabled={processingId === d.id}
                            onClick={() => processarComIA(d)}
                            className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 flex-1">
                            {processingId === d.id
                              ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processando IA...</>
                              : <><Sparkles className="w-3 h-3 mr-1" />Resumir com IA</>}
                          </Button>
                        ) : (
                          <Button size="sm"
                            onClick={() => handlePresent(d)}
                            className="h-7 text-xs bg-gradient-to-r from-[#0066b1] to-purple-600 hover:from-[#0055a0] hover:to-purple-700 text-white flex-1 shadow-sm">
                            <Play className="w-3 h-3 mr-1" />Apresentar com Voz
                          </Button>
                        )}
                        {d.slides_ia?.length > 0 && (
                          <Button size="sm" variant="outline"
                            disabled={processingId === d.id}
                            onClick={() => processarComIA(d)}
                            className="h-7 text-xs border-slate-200 text-slate-500 hover:bg-slate-50">
                            {processingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}