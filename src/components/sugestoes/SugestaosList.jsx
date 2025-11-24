import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Lightbulb, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  pendente: "bg-gray-100 text-gray-800",
  em_analise: "bg-blue-100 text-blue-800",
  aprovada: "bg-purple-100 text-purple-800",
  implementada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800"
};

const categoriaColors = {
  processo: "bg-blue-100 text-blue-800",
  seguranca: "bg-red-100 text-red-800",
  qualidade: "bg-green-100 text-green-800",
  ambiente: "bg-teal-100 text-teal-800",
  custos: "bg-yellow-100 text-yellow-800",
  outro: "bg-gray-100 text-gray-800"
};

export default function SugestaosList({ sugestoes, currentUser, onVotar }) {
  const jaVotou = (sugestao, tipo) => {
    return sugestao.votos?.some(v => v.usuario_id === currentUser?.id && v.tipo === tipo);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sugestoes.map((sugestao) => (
          <motion.div
            key={sugestao.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{sugestao.titulo}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Por {sugestao.autor_nome} • {format(new Date(sugestao.created_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[sugestao.status]}>
                      {sugestao.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={categoriaColors[sugestao.categoria]}>
                      {sugestao.categoria}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">{sugestao.descricao}</p>

                {sugestao.anexos && sugestao.anexos.length > 0 && (
                  <div className="mb-4">
                    {sugestao.anexos.map((anexo, idx) => (
                      <a
                        key={idx}
                        href={anexo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        <Paperclip className="w-4 h-4" />
                        {anexo.nome}
                      </a>
                    ))}
                  </div>
                )}

                {sugestao.resposta_lider && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📝 Resposta do Líder:</p>
                    <p className="text-sm text-blue-800">{sugestao.resposta_lider}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={jaVotou(sugestao, "positivo") ? "default" : "outline"}
                      size="sm"
                      onClick={() => onVotar(sugestao, "positivo")}
                      className={jaVotou(sugestao, "positivo") ? "bg-green-600" : ""}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {sugestao.votos?.filter(v => v.tipo === "positivo").length || 0}
                    </Button>
                    <Button
                      variant={jaVotou(sugestao, "negativo") ? "default" : "outline"}
                      size="sm"
                      onClick={() => onVotar(sugestao, "negativo")}
                      className={jaVotou(sugestao, "negativo") ? "bg-red-600" : ""}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {sugestao.votos?.filter(v => v.tipo === "negativo").length || 0}
                    </Button>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    Pontuação Total: {sugestao.total_votos || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {sugestoes.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma sugestão ainda</p>
              <p className="text-sm mt-2">Seja o primeiro a compartilhar uma ideia!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}