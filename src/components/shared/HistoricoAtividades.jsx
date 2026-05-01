import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

const TIPO_CONFIG = {
  logistica: { icon: "🚚", label: "Logística", badge: "bg-slate-100 text-slate-700" },
  pedido:    { icon: "🛒", label: "EPI",        badge: "bg-blue-100 text-blue-700" },
  objetivo:  { icon: "🎯", label: "Objetivo",   badge: "bg-purple-100 text-purple-700" },
  aviso:     { icon: "📢", label: "Aviso",      badge: "bg-orange-100 text-orange-700" },
};

function getActivityText(item) {
  switch (item.tipo) {
    case "logistica": return item.titulo || item.descricao || "Atividade de logística";
    case "pedido":    return item.item || "Pedido EPI";
    case "objetivo":  return item.titulo || "Objetivo";
    case "aviso":     return item.titulo || "Aviso";
    default:          return "Atividade";
  }
}

function getStatusBadge(item) {
  if (item.status === "pendente")                      return <Badge className="bg-amber-100 text-amber-800 border-0 text-[9px] px-1.5 py-0">Pendente</Badge>;
  if (item.status === "concluida" || item.concluido)   return <Badge className="bg-green-100 text-green-800 border-0 text-[9px] px-1.5 py-0">Concluído</Badge>;
  if (item.prioridade === "urgente")                   return <Badge className="bg-red-100 text-red-800 border-0 text-[9px] px-1.5 py-0">Urgente</Badge>;
  if (item.prioridade === "importante")                return <Badge className="bg-orange-100 text-orange-800 border-0 text-[9px] px-1.5 py-0">Importante</Badge>;
  return null;
}

export default function HistoricoAtividades({ currentUser }) {
  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades-recentes", currentUser?.id],
    queryFn: async () => {
      const [logistica, pedidos, objetivos, avisos] = await Promise.all([
        base44.entities.AtividadeLogistica.list("-created_date", 5),
        base44.entities.PedidoEPI.list("-created_date", 5),
        base44.entities.Objetivo.list("-updated_date", 5),
        base44.entities.Aviso.list("-created_date", 5),
      ]);
      return [
        ...logistica.map(a => ({ ...a, tipo: "logistica" })),
        ...pedidos.map(p => ({ ...p, tipo: "pedido" })),
        ...objetivos.map(o => ({ ...o, tipo: "objetivo" })),
        ...avisos.map(av => ({ ...av, tipo: "aviso" })),
      ]
        .sort((a, b) => new Date(b.created_date || b.updated_date) - new Date(a.created_date || a.updated_date))
        .slice(0, 8);
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
  });

  return (
    <Card className="border border-slate-200 overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
        <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#0066b1]" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
          </div>
        ) : atividades.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {atividades.map((item, i) => {
              const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.aviso;
              return (
                <motion.div
                  key={`${item.tipo}-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 active:bg-slate-50 touch-manipulation"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
                      {getActivityText(item)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="text-[10px] text-slate-400">
                        {moment(item.created_date || item.updated_date).fromNow()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge className={`${cfg.badge} border-0 text-[9px] px-1.5 py-0`}>{cfg.label}</Badge>
                    {getStatusBadge(item)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}