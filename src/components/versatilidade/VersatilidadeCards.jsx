import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, Award } from "lucide-react";

const disponibilidadeColors = {
  disponivel: "bg-green-100 text-green-800 border-green-200",
  indisponivel: "bg-red-100 text-red-800 border-red-200",
  licenca: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ferias: "bg-blue-100 text-blue-800 border-blue-200"
};

const nivelColors = {
  nao_treinado: "bg-gray-100 text-gray-800",
  em_treinamento: "bg-yellow-100 text-yellow-800",
  treinado: "bg-green-100 text-green-800",
  instrutor: "bg-blue-100 text-blue-800"
};

const nivelLabels = {
  nao_treinado: "Não Treinado",
  em_treinamento: "Em Treinamento",
  treinado: "Treinado",
  instrutor: "Instrutor"
};

export default function VersatilidadeCards({ colaboradores, onEdit, onDelete }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {colaboradores.map((colaborador) => {
          const treinadas = colaborador.habilidades?.filter(h => h.nivel === "treinado" || h.nivel === "instrutor").length || 0;
          const instrutor = colaborador.habilidades?.filter(h => h.nivel === "instrutor").length || 0;
          
          return (
            <motion.div
              key={colaborador.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {colaborador.colaborador?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {colaborador.colaborador}
                        </h3>
                        <p className="text-sm text-gray-500">Chapa: {colaborador.chapa}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(colaborador)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(colaborador.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {colaborador.equipe && (
                      <div>
                        <p className="text-xs text-gray-500">Equipe</p>
                        <p className="font-medium text-sm">{colaborador.equipe}</p>
                      </div>
                    )}
                    {colaborador.turno && (
                      <div>
                        <p className="text-xs text-gray-500">Turno</p>
                        <p className="font-medium text-sm capitalize">{colaborador.turno}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <Badge className={`${disponibilidadeColors[colaborador.disponibilidade]} border w-full justify-center mb-3`}>
                      {colaborador.disponibilidade}
                    </Badge>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{treinadas}</p>
                        <p className="text-xs text-green-700">Habilidades Treinadas</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{instrutor}</p>
                        <p className="text-xs text-blue-700">Instrutor</p>
                      </div>
                    </div>
                  </div>

                  {colaborador.habilidades && colaborador.habilidades.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Principais Habilidades</span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {colaborador.habilidades.slice(0, 5).map((hab, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{hab.numero}. {hab.descricao}</span>
                            <Badge className={`${nivelColors[hab.nivel]} text-xs`}>
                              {nivelLabels[hab.nivel]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {colaborador.observacoes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {colaborador.observacoes}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}