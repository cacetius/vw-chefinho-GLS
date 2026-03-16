import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Car, AlertTriangle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  aguardando:  { label: "Aguardando",  className: "bg-slate-100 text-slate-700" },
  em_processo: { label: "Em Processo", className: "bg-blue-100 text-blue-800" },
  ok:          { label: "OK",          className: "bg-green-100 text-green-800" },
  alerta:      { label: "Alerta",      className: "bg-yellow-100 text-yellow-800" },
  erro:        { label: "Erro",        className: "bg-red-100 text-red-800" },
  concluido:   { label: "Concluído",   className: "bg-emerald-100 text-emerald-800" },
};

const BORDER_STATUS = {
  aguardando: "border-l-slate-400",
  em_processo: "border-l-blue-500",
  ok: "border-l-green-500",
  alerta: "border-l-yellow-500",
  erro: "border-l-red-500",
  concluido: "border-l-emerald-500",
};

function CarroCard({ carro, onEdit, onDelete, canEdit }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_CONFIG[carro.status] || STATUS_CONFIG.aguardando;
  const border = BORDER_STATUS[carro.status] || "border-l-slate-300";

  return (
    <Card className={`border-l-4 ${border} transition-all hover:shadow-md active:scale-[0.99]`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Indicador de cor */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white"
            style={{ backgroundColor: carro.cor || "#ccc" }}>
            <Car className="w-4 h-4 text-white drop-shadow" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{carro.modelo || "Sem modelo"}</h3>
                <p className="text-[11px] text-slate-500 font-mono truncate">{carro.chassi}</p>
              </div>
              {canEdit && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(carro)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(carro.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all active:scale-90">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={`text-[10px] px-1.5 py-0 ${st.className}`}>{st.label}</Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">#{carro.posicao_linha}</Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 truncate max-w-[120px]">{carro.estacao_atual?.replace(/_/g, " ")}</Badge>
              {carro.problemas?.length > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-800 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> {carro.problemas.length}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-slate-400">
                {carro.operador_responsavel} · T.{carro.turno}
              </span>
              <button onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Menos" : "Ver mais"}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                    {carro.cor_nome && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: carro.cor }} />
                        <span className="text-xs text-slate-600">{carro.cor_nome}</span>
                      </div>
                    )}
                    {carro.tempo_entrada && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Entrada: {format(new Date(carro.tempo_entrada), "dd/MM HH:mm", { locale: ptBR })}
                      </div>
                    )}
                    {carro.problemas?.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-2 space-y-1">
                        {carro.problemas.map((p, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Badge className={`text-[9px] px-1 py-0 flex-shrink-0 ${
                              p.severidade === "critica" ? "bg-red-600" :
                              p.severidade === "alta" ? "bg-orange-500" :
                              p.severidade === "media" ? "bg-yellow-500" : "bg-blue-400"
                            }`}>{p.severidade}</Badge>
                            <span className="text-xs text-red-700 leading-tight">{p.descricao}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {carro.observacoes && (
                      <p className="text-xs text-slate-500 italic">{carro.observacoes}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CarrosList({ carros, onEdit, onDelete, currentUser }) {
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const canEdit = (carro) => currentUser?.cargo === "lider" || carro.created_by === currentUser?.email;

  const filtrados = filtroStatus === "todos" ? carros : carros.filter(c => c.status === filtroStatus);
  const comErro = carros.filter(c => c.status === "erro").length;

  if (carros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Car className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhum carro na linha</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros rápidos */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "todos", label: `Todos (${carros.length})` },
          { key: "em_processo", label: "Em Processo" },
          { key: "erro", label: `Erros${comErro > 0 ? ` (${comErro})` : ""}` },
          { key: "concluido", label: "Concluídos" },
          { key: "aguardando", label: "Aguardando" },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroStatus(f.key)}
            className={`whitespace-nowrap text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all flex-shrink-0 ${
              filtroStatus === f.key
                ? "bg-[#0066b1] text-white border-[#0066b1]"
                : `border-slate-200 text-slate-600 hover:bg-slate-50 ${f.key === "erro" && comErro > 0 ? "border-red-200 text-red-700 bg-red-50" : ""}`
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Nenhum carro com esse filtro</p>
        ) : (
          filtrados.map((carro, i) => (
            <motion.div key={carro.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <CarroCard carro={carro} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit(carro)} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}