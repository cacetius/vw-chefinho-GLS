import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  planejado: "bg-blue-100 text-blue-800 border-blue-200",
  em_andamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200"
};

export default function TreinamentosList({ treinamentos, onEdit, onDelete, currentUser }) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {treinamentos.map((treinamento) => (
          <motion.div
            key={treinamento.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{treinamento.titulo}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${statusColors[treinamento.status]} border`}>
                      {treinamento.status === "planejado" && "Planejado"}
                      {treinamento.status === "em_andamento" && "Em Andamento"}
                      {treinamento.status === "concluido" && "Concluído"}
                      {treinamento.status === "cancelado" && "Cancelado"}
                    </Badge>
                    {treinamento.habilidade_relacionada && (
                      <Badge variant="outline">
                        Habilidade #{treinamento.habilidade_relacionada}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(treinamento)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(treinamento.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {treinamento.descricao && (
                  <p className="text-gray-600 mb-4">{treinamento.descricao}</p>
                )}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Instrutor: <strong>{treinamento.instrutor}</strong></span>
                  </div>
                  {treinamento.local && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{treinamento.local}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Início: {treinamento.data_inicio ? format(new Date(treinamento.data_inicio), "dd/MM/yyyy") : "-"}
                    </span>
                  </div>
                  {treinamento.carga_horaria > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{treinamento.carga_horaria}h</span>
                    </div>
                  )}
                </div>
                {treinamento.participantes && treinamento.participantes.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Participantes ({treinamento.participantes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {treinamento.participantes.map((part, idx) => (
                        <Badge key={idx} variant="outline">
                          {part.nome}
                          {part.status === "concluido" && " ✓"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      {treinamentos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Nenhum treinamento cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}