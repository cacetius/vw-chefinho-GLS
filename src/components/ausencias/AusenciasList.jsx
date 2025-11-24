import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  reprovado: "bg-red-100 text-red-800 border-red-200"
};

const tipoLabels = {
  ferias: "Férias",
  folga: "Folga",
  atestado: "Atestado Médico",
  licenca: "Licença",
  outro: "Outro"
};

export default function AusenciasList({ ausencias, onEdit, onDelete, onAprovar, onReprovar, currentUser, hasLeaderAccess }) {
  const [showReprovarDialog, setShowReprovarDialog] = useState(false);
  const [ausenciaSelecionada, setAusenciaSelecionada] = useState(null);
  const [observacoes, setObservacoes] = useState("");

  const handleReprovar = () => {
    if (ausenciaSelecionada) {
      onReprovar(ausenciaSelecionada, observacoes);
      setShowReprovarDialog(false);
      setAusenciaSelecionada(null);
      setObservacoes("");
    }
  };

  return (
    <>
      <Dialog open={showReprovarDialog} onOpenChange={setShowReprovarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Motivo da Reprovação</Label>
              <Textarea
                placeholder="Explique o motivo da reprovação"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="h-24"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowReprovarDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReprovar} variant="destructive">
                Confirmar Reprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <AnimatePresence>
          {ausencias.map((ausencia) => (
            <motion.div
              key={ausencia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{ausencia.colaborador_nome}</h3>
                      <Badge className={`${statusColors[ausencia.status]} border`}>
                        {ausencia.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {tipoLabels[ausencia.tipo]}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(ausencia.data_inicio), "dd/MM/yyyy")} - {format(new Date(ausencia.data_fim), "dd/MM/yyyy")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasLeaderAccess && ausencia.status === "pendente" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onAprovar(ausencia)}
                          className="text-green-600 hover:text-green-700"
                          title="Aprovar"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setAusenciaSelecionada(ausencia);
                            setShowReprovarDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Reprovar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {ausencia.status === "pendente" && ausencia.colaborador_id === currentUser?.id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(ausencia)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(ausencia.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Motivo</p>
                      <p className="text-gray-700">{ausencia.motivo}</p>
                    </div>
                    
                    {ausencia.anexo && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(ausencia.anexo, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Documento Anexado
                        </Button>
                      </div>
                    )}

                    {ausencia.observacoes_aprovacao && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">Observações</p>
                        <p className="text-sm text-gray-600">{ausencia.observacoes_aprovacao}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {ausencias.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma solicitação de ausência</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}