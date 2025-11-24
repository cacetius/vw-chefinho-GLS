import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, CheckCircle2, Circle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoriaColors = {
  seguranca: "bg-red-100 text-red-800 border-red-200",
  qualidade: "bg-blue-100 text-blue-800 border-blue-200",
  producao: "bg-green-100 text-green-800 border-green-200",
  processo: "bg-purple-100 text-purple-800 border-purple-200"
};

export default function ObjetivosMensais({ objetivos, onEdit, onDelete, onToggleConcluido }) {
  const calcularProgresso = (objetivo) => {
    if (!objetivo.meta_numerica) return 0;
    return Math.min(100, (objetivo.valor_atual / objetivo.meta_numerica) * 100);
  };

  return (
    <div className="grid gap-4">
      <AnimatePresence>
        {objetivos.map((objetivo) => {
          const progresso = calcularProgresso(objetivo);

          return (
            <motion.div
              key={objetivo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`shadow-lg hover:shadow-xl transition-all ${
                objetivo.concluido ? 'border-2 border-green-500' : ''
              }`}>
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleConcluido(objetivo)}
                        className={objetivo.concluido ? "text-green-600" : "text-gray-400"}
                      >
                        {objetivo.concluido ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold ${
                          objetivo.concluido ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {objetivo.titulo}
                        </h3>
                        {objetivo.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{objetivo.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${categoriaColors[objetivo.categoria]} border`}>
                        {objetivo.categoria}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(objetivo)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(objetivo.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {objetivo.meta_numerica > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progresso do Mês</span>
                        <span className="text-sm font-bold">
                          {objetivo.valor_atual} / {objetivo.meta_numerica} {objetivo.unidade}
                        </span>
                      </div>
                      <Progress value={progresso} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1 text-right">{progresso.toFixed(1)}%</p>
                    </div>
                  )}

                  {objetivo.observacoes && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">{objetivo.observacoes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Referência: {format(new Date(objetivo.data_referencia), "MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {objetivos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum objetivo mensal cadastrado</p>
        </div>
      )}
    </div>
  );
}