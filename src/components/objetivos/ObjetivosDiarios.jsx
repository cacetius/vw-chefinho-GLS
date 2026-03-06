import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, CheckCircle2, Circle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CAT_COLORS = {
  seguranca: "bg-red-100 text-red-800",
  qualidade: "bg-blue-100 text-blue-800",
  producao: "bg-green-100 text-green-800",
  processo: "bg-purple-100 text-purple-800"
};
const TURNO_COLORS = {
  todos: "bg-gray-100 text-gray-700",
  manha: "bg-yellow-100 text-yellow-800",
  tarde: "bg-orange-100 text-orange-800",
  noite: "bg-indigo-100 text-indigo-800"
};

function ObjetivoCard({ objetivo, onEdit, onDelete, onToggleConcluido, isHoje }) {
  const progresso = (() => {
    if (!objetivo.meta_numerica) return 0;
    if (objetivo.categoria === "seguranca" && objetivo.unidade === "acidentes") return objetivo.valor_atual === 0 ? 100 : 0;
    return Math.min(100, (objetivo.valor_atual / objetivo.meta_numerica) * 100);
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card className={`border border-slate-200 transition-all hover:shadow-md ${objetivo.concluido ? "border-l-4 border-l-green-500" : isHoje ? "border-l-4 border-l-blue-400" : ""}`}>
        <CardContent className="p-3">
          <div className="flex gap-2.5">
            <button onClick={() => onToggleConcluido(objetivo)}
              className={`flex-shrink-0 mt-0.5 p-0.5 active:scale-90 transition-all ${objetivo.concluido ? "text-green-500" : "text-slate-300 hover:text-slate-400"}`}>
              {objetivo.concluido ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-semibold text-sm leading-tight ${objetivo.concluido ? "line-through text-slate-400" : "text-slate-900"}`}>
                  {objetivo.titulo}
                </h3>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(objetivo)}
                    className="p-1 rounded-lg hover:bg-blue-50 text-slate-300 hover:text-blue-600 active:scale-90 transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(objetivo.id)}
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-600 active:scale-90 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {objetivo.descricao && <p className="text-xs text-slate-500 mt-1">{objetivo.descricao}</p>}

              <div className="flex flex-wrap gap-1 mt-1.5">
                <Badge className={`text-[10px] px-1.5 py-0.5 ${CAT_COLORS[objetivo.categoria]}`}>{objetivo.categoria}</Badge>
                <Badge className={`text-[10px] px-1.5 py-0.5 ${TURNO_COLORS[objetivo.turno]}`}>{objetivo.turno}</Badge>
                {isHoje && <Badge className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800"><Clock className="w-2.5 h-2.5 mr-0.5" />Hoje</Badge>}
              </div>

              {objetivo.meta_numerica > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progresso</span>
                    <span className="font-bold">{objetivo.valor_atual || 0} / {objetivo.meta_numerica} {objetivo.unidade}</span>
                  </div>
                  <Progress value={progresso} className="h-1.5" />
                </div>
              )}

              {objetivo.observacoes && (
                <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded-lg px-2 py-1">{objetivo.observacoes}</p>
              )}

              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(objetivo.data_referencia), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ObjetivosDiarios({ objetivos, onEdit, onDelete, onToggleConcluido }) {
  const hoje = new Date().toISOString().split('T')[0];
  const objetivosHoje = objetivos.filter(o => o.data_referencia === hoje);
  const objetivosAnteriores = objetivos.filter(o => o.data_referencia !== hoje);

  if (objetivos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Circle className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">Nenhum objetivo diário cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {objetivosHoje.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hoje</p>
          <div className="space-y-2">
            <AnimatePresence>
              {objetivosHoje.map(o => <ObjetivoCard key={o.id} objetivo={o} onEdit={onEdit} onDelete={onDelete} onToggleConcluido={onToggleConcluido} isHoje />)}
            </AnimatePresence>
          </div>
        </div>
      )}
      {objetivosAnteriores.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anteriores</p>
          <div className="space-y-2">
            <AnimatePresence>
              {objetivosAnteriores.map(o => <ObjetivoCard key={o.id} objetivo={o} onEdit={onEdit} onDelete={onDelete} onToggleConcluido={onToggleConcluido} isHoje={false} />)}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}