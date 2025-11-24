import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, CheckCircle2, Circle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoriaColors = {
  seguranca: "bg-red-100 text-red-800 border-red-200",
  qualidade: "bg-blue-100 text-blue-800 border-blue-200",
  producao: "bg-green-100 text-green-800 border-green-200",
  processo: "bg-purple-100 text-purple-800 border-purple-200"
};

const turnoColors = {
  todos: "bg-gray-100 text-gray-800",
  manha: "bg-yellow-100 text-yellow-800",
  tarde: "bg-orange-100 text-orange-800",
  noite: "bg-indigo-100 text-indigo-800"
};

export default function ObjetivosDiarios({ objetivos, onEdit, onDelete, onToggleConcluido }) {
  const hoje = new Date().toISOString().split('T')[0];
  const objetivosHoje = objetivos.filter(o => o.data_referencia === hoje);
  const objetivosAnteriores = objetivos.filter(o => o.data_referencia !== hoje);

  const calcularProgresso = (objetivo) => {
    if (!objetivo.meta_numerica) return 0;
    
    if (objetivo.categoria === "seguranca" && objetivo.unidade === "acidentes") {
      return objetivo.valor_atual === 0 ? 100 : 0;
    }
    
    return Math.min(100, (objetivo.valor_atual / objetivo.meta_numerica) * 100);
  };

  const ObjetivoCard = ({ objetivo }) => {
    const progresso = calcularProgresso(objetivo);
    const isHoje = objetivo.data_referencia === hoje;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className={`shadow-lg hover:shadow-xl transition-all ${
          objetivo.concluido ? 'border-2 border-green-500' : ''
        } ${isHoje ? 'bg-gradient-to-br from-white to-green-50' : ''}`}>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleConcluido(objetivo)}
                  className={objetivo.concluido ? "text-green-600" : "text-gray-400"}
                >
                  {objetivo.concluido ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </Button>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${
                    objetivo.concluido ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {objetivo.titulo}
                  </h3>
                  {objetivo.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{objetivo.descricao}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${categoriaColors[objetivo.categoria]} border`}>
                  {objetivo.categoria}
                </Badge>
                <Badge className={turnoColors[objetivo.turno]}>
                  Turno: {objetivo.turno}
                </Badge>
                {isHoje && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Hoje
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(objetivo)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(objetivo.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {objetivo.meta_numerica > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso</span>
                  <span className="text-sm font-bold">
                    {objetivo.valor_atual} / {objetivo.meta_numerica} {objetivo.unidade}
                  </span>
                </div>
                <Progress value={progresso} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-right">{progresso.toFixed(0)}%</p>
              </div>
            )}

            {objetivo.observacoes && (
              <div className="p-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-sm text-gray-700">{objetivo.observacoes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(objetivo.data_referencia), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {objetivosHoje.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Objetivos de Hoje</h3>
          <div className="grid gap-4">
            <AnimatePresence>
              {objetivosHoje.map((objetivo) => (
                <ObjetivoCard key={objetivo.id} objetivo={objetivo} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {objetivosAnteriores.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Objetivos Anteriores</h3>
          <div className="grid gap-4">
            <AnimatePresence>
              {objetivosAnteriores.map((objetivo) => (
                <ObjetivoCard key={objetivo.id} objetivo={objetivo} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {objetivos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum objetivo diário cadastrado</p>
        </div>
      )}
    </div>
  );
}