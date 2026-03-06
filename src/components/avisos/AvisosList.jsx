import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Pin, User, Bell } from "lucide-react";
import { motion } from "framer-motion";

const PRIO_COLORS = {
  urgente: "bg-red-100 text-red-800",
  importante: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800"
};
const CAT_ICONS = {
  seguranca: "🛡️", logistica: "🚚", epi: "🦺",
  treinamento: "📚", geral: "📢", outro: "📌"
};
const PRIO_BORDER = {
  urgente: "border-l-red-500", importante: "border-l-orange-500", normal: "border-l-blue-400"
};

export default function AvisosList({ avisos, onEdit, onDelete, onToggleFixar, currentUser, canEdit }) {
  const isLider = currentUser?.cargo === "lider";

  if (avisos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Bell className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">Nenhum aviso aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {avisos.map((aviso, i) => (
        <motion.div key={aviso.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className={`border border-slate-200 border-l-4 ${PRIO_BORDER[aviso.prioridade] || PRIO_BORDER.normal} hover:shadow-md transition-all ${aviso.concluido ? 'opacity-70' : ''}`}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{CAT_ICONS[aviso.categoria] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{aviso.titulo}</h3>
                      {aviso.fixado && <Pin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {isLider && (
                        <button onClick={() => onToggleFixar(aviso)}
                          className={`p-1.5 rounded-lg active:scale-90 transition-all ${aviso.fixado ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-400"}`}>
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canEdit(aviso) && (
                        <>
                          <button onClick={() => onEdit(aviso)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(aviso.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge className={`text-[10px] px-1.5 py-0.5 ${PRIO_COLORS[aviso.prioridade]}`}>{aviso.prioridade}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{aviso.categoria}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap line-clamp-3">{aviso.conteudo}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                    <User className="w-3 h-3" />
                    <span>{aviso.autor}</span>
                    <span>•</span>
                    <span>{new Date(aviso.created_date).toLocaleDateString('pt-BR')}</span>
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