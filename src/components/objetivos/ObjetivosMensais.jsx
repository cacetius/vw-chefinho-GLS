import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, CheckCircle2, Circle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CAT_COLORS = {
  seguranca: "bg-red-100 text-red-800",
  qualidade: "bg-blue-100 text-blue-800",
  producao: "bg-green-100 text-green-800",
  processo: "bg-purple-100 text-purple-800"
};

export default function ObjetivosMensais({ objetivos, onEdit, onDelete, onToggleConcluido }) {
  if (objetivos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Circle className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">Nenhum objetivo mensal cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {objetivos.map((o, i) => {
          const progresso = o.meta_numerica ? Math.min(100, (o.valor_atual / o.meta_numerica) * 100) : 0;
          return (
            <motion.div key={o.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`border border-slate-200 hover:shadow-md transition-all ${o.concluido ? "border-l-4 border-l-green-500" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex gap-2.5">
                    <button onClick={() => onToggleConcluido(o)}
                      className={`flex-shrink-0 mt-0.5 p-0.5 active:scale-90 transition-all ${o.concluido ? "text-green-500" : "text-slate-300 hover:text-slate-400"}`}>
                      {o.concluido ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm leading-tight ${o.concluido ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {o.titulo}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => onEdit(o)}
                            className="p-1 rounded-lg hover:bg-blue-50 text-slate-300 hover:text-blue-600 active:scale-90 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(o.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-600 active:scale-90 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {o.descricao && <p className="text-xs text-slate-500 mt-1">{o.descricao}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${CAT_COLORS[o.categoria]}`}>{o.categoria}</Badge>
                      </div>
                      {o.meta_numerica > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progresso do mês</span>
                            <span className="font-bold">{o.valor_atual || 0} / {o.meta_numerica} {o.unidade}</span>
                          </div>
                          <Progress value={progresso} className="h-1.5" />
                        </div>
                      )}
                      {o.observacoes && <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded px-2 py-1">{o.observacoes}</p>}
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(o.data_referencia), "MMMM 'de' yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}