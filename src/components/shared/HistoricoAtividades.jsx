import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HistoricoAtividades({ currentUser }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadAtividades();
    }
  }, [currentUser]);

  const loadAtividades = async () => {
    try {
      // Busca as últimas atividades do usuário em diferentes entidades
      const [tarefas, pedidos, objetivos] = await Promise.all([
        base44.entities.TarefaMonitor.list("-updated_date", 5),
        base44.entities.PedidoEPI.filter({ solicitante_id: currentUser.id }, "-updated_date", 5),
        base44.entities.Objetivo.list("-updated_date", 5)
      ]);

      const historico = [];

      tarefas.forEach(t => {
        historico.push({
          tipo: "tarefa",
          titulo: t.titulo,
          status: t.status,
          data: t.updated_date,
          icon: CheckCircle,
          color: t.status === "concluida" ? "text-green-600" : t.status === "em_andamento" ? "text-blue-600" : "text-yellow-600"
        });
      });

      pedidos.forEach(p => {
        historico.push({
          tipo: "pedido",
          titulo: `Pedido de ${p.item}`,
          status: p.status,
          data: p.updated_date,
          icon: CheckCircle,
          color: p.status === "aprovado" ? "text-green-600" : p.status === "reprovado" ? "text-red-600" : "text-yellow-600"
        });
      });

      objetivos.forEach(o => {
        historico.push({
          tipo: "objetivo",
          titulo: o.titulo,
          status: o.concluido ? "concluido" : "em_andamento",
          data: o.updated_date,
          icon: CheckCircle,
          color: o.concluido ? "text-green-600" : "text-blue-600"
        });
      });

      // Ordena por data
      historico.sort((a, b) => new Date(b.data) - new Date(a.data));
      setAtividades(historico.slice(0, 10));
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066b1] mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {atividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {atividades.map((ativ, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`mt-1 ${ativ.color}`}>
                  <ativ.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{ativ.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {ativ.tipo}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(ativ.data).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}