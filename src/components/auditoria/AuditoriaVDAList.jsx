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
    <div className="space-y-3">
      {auditorias.map((auditoria, index) => (
        <motion.div key={auditoria.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <Card className="border-l-4 border-l-[#0066b1] border border-slate-200">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{auditoria.titulo}</h3>
                    <Badge className={`${getStatusColor(auditoria.status)} text-[9px] px-1.5 py-0`}>{auditoria.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 text-indigo-700 border-indigo-300">{getTipoAuditoriaLabel(auditoria.tipo_auditoria)}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">📍 {auditoria.area_auditada}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">📅 {new Date(auditoria.data_auditoria).toLocaleDateString('pt-BR')}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(auditoria)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#0066b1] active:scale-90 transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(auditoria.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-90 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className={`text-lg font-bold ${getConformidadeColor(auditoria.percentual_conformidade || 0)}`}>{auditoria.percentual_conformidade || 0}%</p>
                  <p className="text-[9px] text-gray-500">Conformidade</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">{auditoria.itens_checklist?.length || 0}</p>
                  <p className="text-[9px] text-gray-500">Itens</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">{auditoria.nao_conformidades?.length || 0}</p>
                  <p className="text-[9px] text-gray-500">NC</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-2">Auditor: {auditoria.auditor_nome}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}