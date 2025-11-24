import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";

const prioridadeColors = {
  baixa: "bg-gray-100 text-gray-800",
  media: "bg-blue-100 text-blue-800",
  alta: "bg-orange-100 text-orange-800",
  urgente: "bg-red-100 text-red-800"
};

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
  concluida: "bg-green-100 text-green-800 border-green-200"
};

export default function TarefasList({ tarefas, onEdit, onDelete, onUpdateStatus, monitores = [] }) {
  const getMonitorName = (monitorId) => {
    const monitor = monitores.find(m => m.id === monitorId);
    return monitor ? (monitor.nome_exibicao || monitor.full_name) : null;
  };

  if (tarefas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhuma tarefa cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tarefas.map((tarefa) => (
          <motion.div
            key={tarefa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tarefa.titulo}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${statusColors[tarefa.status]} border`}>
                      {tarefa.status === "pendente" && "Pendente"}
                      {tarefa.status === "em_andamento" && "Em Andamento"}
                      {tarefa.status === "concluida" && "Concluída"}
                    </Badge>
                    <Badge className={prioridadeColors[tarefa.prioridade]}>
                      {tarefa.prioridade}
                    </Badge>
                    {tarefa.data_limite && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(tarefa.data_limite), "dd/MM/yyyy")}
                      </Badge>
                    )}
                    {tarefa.monitor_atribuido && (
                      <Badge variant="outline" className="bg-purple-50">
                        <User className="w-3 h-3 mr-1" />
                        {getMonitorName(tarefa.monitor_atribuido)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {tarefa.status !== "concluida" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateStatus(tarefa.id, "concluida")}
                      className="text-green-600 hover:text-green-700"
                      title="Marcar como concluída"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => onEdit(tarefa)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(tarefa.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              {tarefa.descricao && (
                <CardContent>
                  <p className="text-gray-600 text-sm">{tarefa.descricao}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Responsável:</span> {tarefa.responsavel}
                  </p>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}