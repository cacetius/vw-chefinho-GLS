import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const statusColors = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  esgotado: "bg-red-100 text-red-800 border-red-200",
  cancelado: "bg-gray-100 text-gray-800 border-gray-200"
};

const categoriaColors = {
  epi: "bg-blue-100 text-blue-800",
  ferramentas: "bg-purple-100 text-purple-800",
  manutencao: "bg-orange-100 text-orange-800",
  outros: "bg-gray-100 text-gray-800"
};

export default function OrcamentosList({ orcamentos, onEdit, onDelete, currentUser, pedidos }) {
  const hasLeaderAccess = currentUser?.cargo === "lider" || 
    (currentUser?.cargo_temporario === "lider" && 
     currentUser?.data_cargo_temporario && 
     new Date(currentUser.data_cargo_temporario) >= new Date());

  // Calcula o valor utilizado baseado nos pedidos aprovados
  const getValorUtilizado = (orcamento) => {
    const pedidosRelacionados = pedidos.filter(p => 
      (p.status === "aprovado" || p.status === "entregue") &&
      p.equipe === orcamento.equipe &&
      (orcamento.turno === "todos" || p.turno === orcamento.turno)
    );
    return pedidosRelacionados.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  };

  if (orcamentos.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12 text-center text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum orçamento cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <AnimatePresence>
        {orcamentos.map((orcamento) => {
          const valorUtilizado = getValorUtilizado(orcamento);
          const percentUsed = (valorUtilizado / orcamento.valor_total) * 100;
          
          return (
            <motion.div
              key={orcamento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{orcamento.titulo}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${statusColors[orcamento.status]} border`}>
                        {orcamento.status}
                      </Badge>
                      <Badge className={categoriaColors[orcamento.categoria]}>
                        {orcamento.categoria}
                      </Badge>
                      {orcamento.equipe && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {orcamento.equipe}
                        </Badge>
                      )}
                      {orcamento.turno && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {orcamento.turno}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {hasLeaderAccess && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(orcamento)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(orcamento.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {orcamento.descricao && (
                    <p className="text-gray-600 mb-4">{orcamento.descricao}</p>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Utilização do Orçamento</span>
                        <span className="text-gray-600">{percentUsed.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={percentUsed} 
                        className={`h-3 ${
                          percentUsed > 90 ? '[&>div]:bg-red-500' : 
                          percentUsed > 70 ? '[&>div]:bg-yellow-500' : 
                          '[&>div]:bg-green-500'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Usado: R$ {valorUtilizado.toFixed(2)}</span>
                        <span>Total: R$ {orcamento.valor_total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          <span className="font-medium">Referência:</span>{" "}
                          {format(new Date(orcamento.mes_referencia), "MM/yyyy")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium">Disponível:</span>{" "}
                          <span className="text-lg font-bold text-green-600">
                            R$ {(orcamento.valor_total - valorUtilizado).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}