import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle, Clock, User, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const PRIO_COLORS = {
  baixa: "bg-gray-100 text-gray-700",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

const STATUS_CONFIG = {
  pendente:     { label: "Pendente",     className: "bg-yellow-100 text-yellow-800" },
  em_andamento: { label: "Em Andamento", className: "bg-blue-100 text-blue-800" },
  concluida:    { label: "Concluída",    className: "bg-green-100 text-green-800" },
};

export default function TarefasList({ tarefas, onEdit, onDelete, onUpdateStatus, monitores = [], currentUser }) {
  const [expandedId, setExpandedId] = useState(null);
  const [validando, setValidando] = useState(null);

  const isLiderOuAdmin =
    currentUser?.role === "admin" ||
    currentUser?.cargo === "supervisor" ||
    currentUser?.cargo === "lider";

  const getMonitorName = (id) => {
    const m = monitores.find(m => m.id === id);
    return m ? (m.nome_exibicao || m.full_name) : id;
  };

  const handleValidarPlano = async (tarefa) => {
    setValidando(tarefa.id);
    // Busca plano de ação vinculado à tarefa (por título similar) e valida
    const planos = await base44.entities.PlanoAcaoVDA.list();
    const planoVinculado = planos.find(p =>
      p.nao_conformidade?.toLowerCase().includes(tarefa.titulo?.toLowerCase()) ||
      tarefa.descricao?.toLowerCase().includes(p.nao_conformidade?.toLowerCase())
    );

    if (planoVinculado) {
      await base44.entities.PlanoAcaoVDA.update(planoVinculado.id, {
        status: "concluido",
        eficacia_verificada: true,
        data_verificacao: new Date().toISOString().split("T")[0],
        verificado_por: currentUser?.nome_exibicao || currentUser?.full_name,
      });
    }

    // Conclui a tarefa também
    await onUpdateStatus(tarefa.id, "concluida");
    setValidando(null);
  };

  if (tarefas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <CheckCircle className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm">Nenhuma tarefa cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tarefas.map((tarefa, i) => {
          const isExpanded = expandedId === tarefa.id;
          const cfg = STATUS_CONFIG[tarefa.status] || STATUS_CONFIG.pendente;

          return (
            <motion.div
              key={tarefa.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`border transition-all ${tarefa.status === "concluida" ? "border-green-200 opacity-75" : "border-slate-200"}`}>
                <CardContent className="p-3">
                  {/* Linha principal */}
                  <div className="flex items-start gap-2">
                    {/* Botão concluir */}
                    {tarefa.status !== "concluida" && (
                      <button
                        onClick={() => onUpdateStatus(tarefa.id, "concluida")}
                        className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-full border-2 border-slate-200 hover:border-green-400 text-slate-300 hover:text-green-500 transition-all touch-manipulation flex-shrink-0"
                        title="Marcar concluída"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {tarefa.status === "concluida" && (
                      <div className="mt-0.5 w-7 h-7 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug ${tarefa.status === "concluida" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {tarefa.titulo}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge className={`text-[9px] px-1.5 py-0 ${cfg.className}`}>{cfg.label}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${PRIO_COLORS[tarefa.prioridade] || PRIO_COLORS.media}`}>
                          {tarefa.prioridade}
                        </Badge>
                        {tarefa.data_limite && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(tarefa.data_limite), "dd/MM")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : tarefa.id)}
                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center touch-manipulation"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onEdit(tarefa)}
                        className="w-8 h-8 rounded-xl text-slate-400 active:bg-blue-50 active:text-blue-600 flex items-center justify-center touch-manipulation"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tarefa.id)}
                        className="w-8 h-8 rounded-xl text-slate-400 active:bg-red-50 active:text-red-600 flex items-center justify-center touch-manipulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expansão */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 space-y-2">
                          {tarefa.descricao && (
                            <p className="text-xs text-slate-500 leading-relaxed">{tarefa.descricao}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                            {tarefa.responsavel && (
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{tarefa.responsavel}</span>
                            )}
                            {tarefa.monitor_atribuido && (
                              <span className="flex items-center gap-1"><User className="w-3 h-3 text-purple-400" />{getMonitorName(tarefa.monitor_atribuido)}</span>
                            )}
                          </div>

                          {/* Mudar status */}
                          {tarefa.status !== "concluida" && (
                            <div className="flex flex-col gap-2 pt-1 w-full">
                              {tarefa.status === "pendente" && (
                                <button
                                  onClick={() => onUpdateStatus(tarefa.id, "em_andamento")}
                                  className="w-full min-h-[44px] text-sm px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold touch-manipulation flex items-center justify-center gap-2 active:bg-blue-100"
                                >
                                  ▶ Iniciar Tarefa
                                </button>
                              )}
                              {tarefa.status === "em_andamento" && isLiderOuAdmin && (
                                <button
                                  onClick={() => handleValidarPlano(tarefa)}
                                  disabled={validando === tarefa.id}
                                  className="w-full min-h-[44px] text-sm px-4 py-2.5 rounded-xl bg-green-500 text-white font-bold touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50 active:bg-green-600"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  {validando === tarefa.id ? "Validando..." : "✅ Validar & Concluir"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}