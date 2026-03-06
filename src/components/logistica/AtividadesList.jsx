import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, User, Truck } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  concluida: "bg-green-100 text-green-800",
  em_andamento: "bg-blue-100 text-blue-800",
  cancelada: "bg-gray-100 text-gray-700",
  pendente: "bg-amber-100 text-amber-800"
};
const PRIO_COLORS = {
  urgente: "bg-red-100 text-red-800",
  alta: "bg-orange-100 text-orange-800",
  media: "bg-yellow-100 text-yellow-800",
  baixa: "bg-blue-100 text-blue-800"
};

export default function AtividadesList({ atividades, onEdit, onDelete, currentUser }) {
  const canEdit = (a) => currentUser?.cargo === "lider" || a.created_by === currentUser?.email;

  if (atividades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Truck className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Nenhuma atividade encontrada</p>
        <p className="text-xs mt-1">Clique em "Nova Atividade" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {atividades.map((a, i) => (
        <motion.div key={a.id}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="border border-slate-200 hover:shadow-md transition-all active:scale-[0.99]">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{a.titulo}</h3>
                    {canEdit(a) && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => onEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge className={`text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[a.status] || STATUS_COLORS.pendente}`}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0.5 ${PRIO_COLORS[a.prioridade] || PRIO_COLORS.media}`}>
                      {a.prioridade}
                    </Badge>
                    {a.setor && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-slate-600">
                        {a.setor}
                      </Badge>
                    )}
                  </div>
                  {a.descricao && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{a.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.responsavel}</span>
                    {a.data_prevista && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{new Date(a.data_prevista).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}