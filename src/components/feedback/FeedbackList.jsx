import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FeedbackList({ feedbacks }) {
  const calcularMediaCriterios = (criterios) => {
    if (!criterios || criterios.length === 0) return 0;
    const soma = criterios.reduce((acc, c) => acc + c.nota, 0);
    return (soma / criterios.length).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Feedbacks Recebidos</h2>
      <AnimatePresence>
        {feedbacks.map((feedback) => {
          const media = calcularMediaCriterios(feedback.criterios);
          
          return (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                        {feedback.anonimo ? (
                          <User className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {feedback.avaliador_nome?.charAt(0) || 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {feedback.anonimo ? 'Feedback Anônimo' : feedback.avaliador_nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(feedback.periodo), "MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-600">{media}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {feedback.criterios && feedback.criterios.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-3">
                        {feedback.criterios.map((criterio, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{criterio.nome}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((nota) => (
                                <Star
                                  key={nota}
                                  className={`w-4 h-4 ${
                                    nota <= criterio.nota
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {feedback.pontos_fortes && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-2">✅ Pontos Fortes</p>
                        <p className="text-sm text-green-800">{feedback.pontos_fortes}</p>
                      </div>
                    )}

                    {feedback.pontos_melhoria && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-semibold text-orange-900 mb-2">🎯 Pontos de Melhoria</p>
                        <p className="text-sm text-orange-800">{feedback.pontos_melhoria}</p>
                      </div>
                    )}

                    {feedback.comentario_geral && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-2">💭 Comentário Geral</p>
                        <p className="text-sm text-blue-800">{feedback.comentario_geral}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {feedbacks.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum feedback recebido ainda</p>
              <p className="text-sm mt-2">Peça para seus colegas te avaliarem!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}