import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Pin, User, Calendar, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function AvisosList({ avisos, onEdit, onDelete, onToggleFixar, currentUser, canEdit }) {
  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case "urgente": return "bg-red-100 text-red-800 border-red-300";
      case "importante": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      seguranca: "🛡️",
      logistica: "🚚",
      epi: "🦺",
      treinamento: "📚",
      geral: "📢",
      outro: "📌"
    };
    return icons[categoria] || "📌";
  };

  if (avisos.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="pt-16 pb-16 text-center">
          <Bell className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-xl mb-2">Nenhum aviso encontrado</p>
          <p className="text-gray-400 text-sm">Os avisos aparecerão aqui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {avisos.map((aviso, index) => (
        <motion.div
          key={aviso.id}
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
                    <div className="text-4xl">{getCategoriaIcon(aviso.categoria)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{aviso.titulo}</h3>
                        {aviso.fixado && (
                          <Pin className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPrioridadeColor(aviso.prioridade) + " border font-semibold"}>
                          {aviso.prioridade}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-300 text-indigo-700 font-semibold">
                          {aviso.categoria}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{aviso.conteudo}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">{aviso.autor}</span>
                          <Badge variant="outline" className="text-xs">
                            {aviso.cargo_autor === "lider" ? "Líder" : "Monitor"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{new Date(aviso.created_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {currentUser?.cargo === "lider" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onToggleFixar(aviso)}
                      className={`transition-all shadow-sm ${
                        aviso.fixado 
                          ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' 
                          : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                  )}
                  {canEdit(aviso) && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(aviso)}
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(aviso.id)}
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}