import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Car, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CarrosList({ carros, onEdit, onDelete, currentUser }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "erro": return "bg-red-100 text-red-800 border-red-300";
      case "concluido": return "bg-green-100 text-green-800 border-green-300";
      case "em_processo": return "bg-blue-100 text-blue-800 border-blue-300";
      case "alerta": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const canEdit = (carro) => {
    return currentUser?.cargo === "lider" || carro.created_by === currentUser?.email;
  };

  if (carros.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-16 pb-16 text-center">
          <Car className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-xl mb-2">Nenhum carro na linha</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {carros.map((carro, index) => (
        <motion.div
          key={carro.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-xl transition-all border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{carro.modelo}</h3>
                      <p className="text-sm text-gray-600">Chassi: {carro.chassi}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStatusColor(carro.status) + " border"}>
                      {carro.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      Estação: {carro.estacao_atual}
                    </Badge>
                    <Badge variant="outline">
                      Posição: {carro.posicao_linha}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: carro.cor }}
                      ></div>
                      <span className="text-sm text-gray-600">{carro.cor}</span>
                    </div>
                  </div>

                  {carro.problemas && carro.problemas.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800 text-sm">
                          {carro.problemas.length} {carro.problemas.length === 1 ? 'Problema' : 'Problemas'}
                        </span>
                      </div>
                      {carro.problemas.map((problema, idx) => (
                        <div key={idx} className="text-sm text-red-700 ml-6">
                          • {problema.descricao}
                        </div>
                      ))}
                    </div>
                  )}

                  {carro.observacoes && (
                    <p className="text-sm text-gray-600 italic">{carro.observacoes}</p>
                  )}

                  <div className="flex gap-4 mt-3 text-xs text-gray-600">
                    <span>Operador: {carro.operador_responsavel}</span>
                    <span>Turno: {carro.turno}</span>
                    {carro.tempo_entrada && (
                      <span>Entrada: {new Date(carro.tempo_entrada).toLocaleString('pt-BR')}</span>
                    )}
                  </div>
                </div>

                {canEdit(carro) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(carro)}
                      className="hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(carro.id)}
                      className="hover:bg-red-50 hover:text-red-700"
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