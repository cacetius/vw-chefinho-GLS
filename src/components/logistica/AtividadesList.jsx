import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, User, AlertCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function AtividadesList({ atividades, onEdit, onDelete, currentUser }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "concluida": return "bg-green-100 text-green-800 border-green-300";
      case "em_andamento": return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelada": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case "urgente": return "bg-red-100 text-red-800 border-red-300";
      case "alta": return "bg-orange-100 text-orange-800 border-orange-300";
      case "media": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  // Usuário pode editar/excluir se for líder OU se for o criador da atividade
  const canEdit = (atividade) => {
    return currentUser?.cargo === "lider" || atividade.created_by === currentUser?.email;
  };

  if (atividades.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="pt-16 pb-16 text-center">
          <Truck className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-xl mb-2">Nenhuma atividade encontrada</p>
          <p className="text-gray-400 text-sm">Clique em "Nova Atividade" para começar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {atividades.map((atividade, index) => (
        <motion.div
          key={atividade.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.01, y: -5 }}
        >
          <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{atividade.titulo}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getStatusColor(atividade.status) + " border font-semibold"}>
                          {atividade.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPrioridadeColor(atividade.prioridade) + " border font-semibold"}>
                          {atividade.prioridade}
                        </Badge>
                        {atividade.setor && (
                          <Badge variant="outline" className="border-indigo-300 text-indigo-700 font-semibold">
                            📍 {atividade.setor}
                          </Badge>
                        )}
                      </div>
                      {atividade.descricao && (
                        <p className="text-gray-700 mb-4 leading-relaxed">{atividade.descricao}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">{atividade.responsavel}</span>
                        </div>
                        {atividade.data_prevista && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{new Date(atividade.data_prevista).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {canEdit(atividade) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(atividade)}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(atividade.id)}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}