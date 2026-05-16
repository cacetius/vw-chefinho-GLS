import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp, User, CalendarDays } from "lucide-react";
import { format } from "date-fns";

const COLUNAS = [
  {
    key: "pendente",
    label: "Pendente",
    icon: Clock,
    headerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-400",
    nextStatus: "em_andamento",
    nextLabel: "▶ Iniciar",
    nextClass: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    key: "em_andamento",
    label: "Em Andamento",
    icon: AlertTriangle,
    headerClass: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-400",
    nextStatus: "concluida",
    nextLabel: "✅ Concluir",
    nextClass: "bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    key: "concluida",
    label: "Concluído",
    icon: CheckCircle2,
    headerClass: "bg-green-50 border-green-200",
    iconClass: "text-green-500",
    badgeClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-400",
    nextStatus: null,
    nextLabel: null,
    nextClass: "",
  },
];

const PRIO_COLORS = {
  baixa: "bg-gray-100 text-gray-600",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

function KanbanCard({ atividade, coluna, onAdvance, advancing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        atividade.status === "concluida" ? "opacity-70" : ""
      }`}
    >
      {/* Faixa colorida topo */}
      <div className={`h-1 w-full ${coluna.dotClass}`} />

      <div className="p-3">
        {/* Título + expand */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-semibold leading-snug ${atividade.status === "concluida" ? "line-through text-slate-400" : "text-slate-800"}`}>
              {atividade.titulo}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={`text-[9px] px-1.5 py-0 ${PRIO_COLORS[atividade.prioridade] || PRIO_COLORS.media}`}>
                {atividade.prioridade}
              </Badge>
              {atividade.setor && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {atividade.setor}
                </Badge>
              )}
              {atividade.data_prevista && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                  <CalendarDays className="w-2.5 h-2.5" />
                  {format(new Date(atividade.data_prevista), "dd/MM")}
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex-shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 touch-manipulation"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expansão */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 space-y-2">
                {atividade.descricao && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">{atividade.descricao}</p>
                )}
                {atividade.responsavel && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {atividade.responsavel}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão avançar */}
        {coluna.nextStatus && (
          <button
            onClick={() => onAdvance(atividade.id, coluna.nextStatus)}
            disabled={advancing === atividade.id}
            className={`w-full mt-2.5 min-h-[36px] text-[11px] font-semibold rounded-lg px-3 py-2 transition-colors touch-manipulation flex items-center justify-center gap-1.5 ${coluna.nextClass} disabled:opacity-50`}
          >
            {advancing === atividade.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : coluna.nextLabel
            }
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function KanbanLogistica({ atividades, onUpdateStatus }) {
  const [advancing, setAdvancing] = useState(null);

  const handleAdvance = async (id, newStatus) => {
    setAdvancing(id);
    await onUpdateStatus(id, newStatus);
    setAdvancing(null);
  };

  const total = atividades.length;

  return (
    <div className="space-y-3">
      {/* Mini header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Quadro Kanban — Logística</p>
        <span className="text-[10px] text-slate-400">{total} atividade{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-3 gap-2">
        {COLUNAS.map((col) => {
          const items = atividades.filter((a) => a.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex flex-col gap-2 min-h-[120px]">
              {/* Cabeçalho coluna */}
              <div className={`rounded-xl border px-2.5 py-2 flex items-center gap-1.5 ${col.headerClass}`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col.iconClass}`} />
                <span className="text-[10px] font-bold text-slate-700 leading-none flex-1 truncate">{col.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badgeClass}`}>{items.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-6 text-slate-300 rounded-xl border border-dashed border-slate-200"
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <p className="text-[9px]">Vazio</p>
                    </motion.div>
                  ) : (
                    items.map((a) => (
                      <KanbanCard
                        key={a.id}
                        atividade={a}
                        coluna={col}
                        onAdvance={handleAdvance}
                        advancing={advancing}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}