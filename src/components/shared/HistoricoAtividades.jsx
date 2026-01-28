import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function HistoricoAtividades({ currentUser }) {
  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades-recentes", currentUser?.id],
    queryFn: async () => {
      const [logistica, pedidos, objetivos, avisos] = await Promise.all([
        base44.entities.AtividadeLogistica.list("-created_date", 5),
        base44.entities.PedidoEPI.list("-created_date", 5),
        base44.entities.Objetivo.list("-updated_date", 5),
        base44.entities.Aviso.list("-created_date", 5)
      ]);

      const combined = [
        ...logistica.map(a => ({ ...a, tipo: "logistica", icon: "🚚" })),
        ...pedidos.map(p => ({ ...p, tipo: "pedido", icon: "🛒" })),
        ...objetivos.map(o => ({ ...o, tipo: "objetivo", icon: "🎯" })),
        ...avisos.map(av => ({ ...av, tipo: "aviso", icon: "📢" }))
      ];

      return combined
        .sort((a, b) => new Date(b.created_date || b.updated_date) - new Date(a.created_date || a.updated_date))
        .slice(0, 8);
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  const getActivityText = (item) => {
    switch (item.tipo) {
      case "logistica":
        return `Atividade de logística: ${item.descricao || "Nova entrada"}`;
      case "pedido":
        return `Pedido EPI: ${item.item || "Novo pedido"}`;
      case "objetivo":
        return `Objetivo: ${item.titulo || "Atualizado"}`;
      case "aviso":
        return `Aviso: ${item.titulo || "Novo comunicado"}`;
      default:
        return "Atividade registrada";
    }
  };

  const getStatusBadge = (item) => {
    if (item.status === "pendente") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">Pendente</Badge>;
    if (item.status === "concluido" || item.concluido) return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Concluído</Badge>;
    if (item.prioridade === "urgente") return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Urgente</Badge>;
    if (item.prioridade === "importante") return <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">Importante</Badge>;
    return null;
  };

  if (isLoading) {
    return (
      <Card className="shadow-2xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0066b1] border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#0066b1]" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {atividades.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          ) : (
            atividades.map((item, index) => (
              <motion.div
                key={`${item.tipo}-${item.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-1">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug mb-1">
                      {getActivityText(item)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {moment(item.created_date || item.updated_date).fromNow()}
                      </div>
                      {getStatusBadge(item)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}