import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, Award } from "lucide-react";

const disponibilidadeColors = {
  disponivel: "bg-green-100 text-green-800 border-green-200",
  indisponivel: "bg-red-100 text-red-800 border-red-200",
  licenca: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const nivelColors = {
  basico: "bg-blue-100 text-blue-800",
  intermediario: "bg-purple-100 text-purple-800",
  avancado: "bg-orange-100 text-orange-800"
};

export default function VersatilidadeGrid({ colaboradores, onEdit, onDelete }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {colaboradores.map((colaborador) => (
          <motion.div
            key={colaborador.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-all h-full">
              <CardHeader className="pb-3 border-b">
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
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Função Principal</span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {colaborador.funcao_principal}
                  </Badge>
                </div>

                {colaborador.funcoes_secundarias && colaborador.funcoes_secundarias.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Funções Secundárias</span>
                    </div>
                    <div className="space-y-2">
                      {colaborador.funcoes_secundarias.map((funcao, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm">{funcao.funcao}</span>
                          <Badge className={nivelColors[funcao.nivel]}>
                            {funcao.nivel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <Badge className={`${disponibilidadeColors[colaborador.disponibilidade]} border w-full justify-center`}>
                    {colaborador.disponibilidade}
                  </Badge>
                </div>

                {colaborador.observacoes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {colaborador.observacoes}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}