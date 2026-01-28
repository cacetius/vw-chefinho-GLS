import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileText, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function AuditoriaVDAList({ auditorias, onEdit, onDelete, currentUser }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "aprovada": return "bg-green-100 text-green-800";
      case "finalizada": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTipoAuditoriaLabel = (tipo) => {
    const labels = {
      "VDA_6.3": "VDA 6.3",
      "VDA_6.5": "VDA 6.5",
      "5S": "5S",
      "Layered_Process_Audit": "LPA",
      "Outro": "Outro"
    };
    return labels[tipo] || tipo;
  };

  const getConformidadeColor = (percentual) => {
    if (percentual >= 90) return "text-green-600";
    if (percentual >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (auditorias.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-12 pb-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-2">Nenhuma auditoria registrada</p>
          <p className="text-gray-400 text-sm">Clique em "Nova Auditoria" para começar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      {auditorias.map((auditoria, index) => (
        <motion.div
          key={auditoria.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-[#0066b1]">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">{auditoria.titulo}</h3>
                    <Badge className={getStatusColor(auditoria.status)}>
                      {auditoria.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
                    <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                      {getTipoAuditoriaLabel(auditoria.tipo_auditoria)}
                    </Badge>
                    <Badge variant="outline">
                      📍 {auditoria.area_auditada}
                    </Badge>
                    <Badge variant="outline">
                      📅 {new Date(auditoria.data_auditoria).toLocaleDateString('pt-BR')}
                    </Badge>
                    <Badge variant="outline">
                      🕐 {auditoria.turno}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-1">
                        <TrendingUp className={`w-4 h-4 md:w-5 md:h-5 ${getConformidadeColor(auditoria.percentual_conformidade || 0)}`} />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Conformidade</p>
                        <p className={`text-sm md:text-lg font-bold ${getConformidadeColor(auditoria.percentual_conformidade || 0)}`}>
                          {auditoria.percentual_conformidade || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Itens</p>
                        <p className="text-sm md:text-lg font-bold text-gray-900">
                          {auditoria.itens_checklist?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-1">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">NC</p>
                        <p className="text-sm md:text-lg font-bold text-red-600">
                          {auditoria.nao_conformidades?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {auditoria.pontos_fortes && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-1">✅ Pontos Fortes:</p>
                      <p className="text-sm text-green-700">{auditoria.pontos_fortes}</p>
                    </div>
                  )}

                  {auditoria.oportunidades_melhoria && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">💡 Oportunidades:</p>
                      <p className="text-sm text-yellow-700">{auditoria.oportunidades_melhoria}</p>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Auditor: <span className="font-semibold">{auditoria.auditor_nome}</span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(auditoria)}
                    className="hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(auditoria.id)}
                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}