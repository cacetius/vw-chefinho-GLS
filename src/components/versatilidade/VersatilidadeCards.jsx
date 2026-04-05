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

export default function VersatilidadeCards({ colaboradores = [], onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-3">
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
              <Card className="border border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {colaborador.colaborador?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{colaborador.colaborador}</h3>
                      <p className="text-[11px] text-gray-500">Chapa: {colaborador.chapa}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => onEdit(colaborador)} className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 active:scale-90 transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(colaborador.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Badge className={`${disponibilidadeColors[colaborador.disponibilidade]} border text-[10px] px-1.5 py-0`}>
                      {colaborador.disponibilidade}
                    </Badge>
                    {colaborador.equipe && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{colaborador.equipe}</Badge>}
                    {colaborador.turno && <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{colaborador.turno}</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-600">{treinadas}</p>
                      <p className="text-[9px] text-green-700">Treinadas</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">{instrutor}</p>
                      <p className="text-[9px] text-blue-700">Instrutor</p>
                    </div>
                  </div>

                  {colaborador.habilidades && colaborador.habilidades.length > 0 && (
                    <div className="space-y-1">
                      {colaborador.habilidades.slice(0, 3).map((hab, index) => (
                        <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded gap-2">
                          <span className="text-gray-700 truncate flex-1">{hab.numero}. {hab.descricao}</span>
                          <Badge className={`${nivelColors[hab.nivel]} text-[9px] px-1 py-0 flex-shrink-0`}>
                            {nivelLabels[hab.nivel]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
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