import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Users, Clock, TrendingUp, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

const statusLabels = { ativo: "Ativo", esgotado: "Esgotado", cancelado: "Cancelado" };
const catLabels = { epi: "EPI", ferramentas: "Ferramentas", manutencao: "Manutenção", outros: "Outros" };
const catColors = {
  epi: "bg-blue-100 text-blue-800",
  ferramentas: "bg-purple-100 text-purple-800",
  manutencao: "bg-orange-100 text-orange-800",
  outros: "bg-gray-100 text-gray-800"
};

export default function OrcamentosList({ orcamentos, onEdit, onDelete, currentUser, pedidos }) {
  const hasLeaderAccess = currentUser?.cargo === "lider" ||
    (currentUser?.cargo_temporario === "lider" && currentUser?.data_cargo_temporario &&
      new Date(currentUser.data_cargo_temporario) >= new Date());

  const getValorUtilizado = (orc) => {
    return pedidos
      .filter(p => (p.status === "aprovado" || p.status === "entregue") &&
        p.equipe === orc.equipe && (orc.turno === "todos" || p.turno === orc.turno))
      .reduce((sum, p) => sum + (p.valor_total || 0), 0);
  };

  if (orcamentos.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="py-12 text-center text-slate-400">
          <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum orçamento cadastrado</p>
          {hasLeaderAccess && <p className="text-xs mt-1 text-slate-400">Clique em "Orçamento" no topo para criar</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <AnimatePresence>
        {orcamentos.map((orc) => {
          const utilizado = getValorUtilizado(orc);
          const restante = orc.valor_total - utilizado;
          const percent = Math.min((utilizado / orc.valor_total) * 100, 100);
          const isCritical = percent >= 90;
          const isWarning = percent >= 70 && percent < 90;

          return (
            <motion.div key={orc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className={`border ${isCritical ? "border-red-200 bg-red-50/30" : isWarning ? "border-amber-200 bg-amber-50/20" : "border-slate-200"}`}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{orc.titulo}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge className={`text-[10px] px-2 py-0 ${orc.status === "ativo" ? "bg-green-100 text-green-800" : orc.status === "esgotado" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[orc.status] || orc.status}
                        </Badge>
                        <Badge className={`text-[10px] px-2 py-0 ${catColors[orc.categoria]}`}>
                          {catLabels[orc.categoria] || orc.categoria}
                        </Badge>
                        {orc.equipe && <Badge variant="outline" className="text-[10px] px-2 py-0"><Users className="w-2.5 h-2.5 mr-1" />{orc.equipe}</Badge>}
                        {orc.turno && orc.turno !== "todos" && <Badge variant="outline" className="text-[10px] px-2 py-0"><Clock className="w-2.5 h-2.5 mr-1" />{orc.turno}</Badge>}
                      </div>
                    </div>
                    {hasLeaderAccess && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(orc)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onDelete(orc.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </div>
                    )}
                  </div>

                  {orc.descricao && <p className="text-xs text-slate-500 mb-3">{orc.descricao}</p>}

                  {/* Valores em destaque */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Total</p>
                      <p className="text-sm font-bold text-slate-900">R${orc.valor_total.toFixed(0)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-red-500 mb-0.5">Utilizado</p>
                      <p className="text-sm font-bold text-red-700">R${utilizado.toFixed(0)}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${restante <= 0 ? "bg-red-100" : "bg-green-50"}`}>
                      <p className={`text-[10px] mb-0.5 ${restante <= 0 ? "text-red-600" : "text-green-600"}`}>Restante</p>
                      <p className={`text-sm font-bold ${restante <= 0 ? "text-red-700" : "text-green-700"}`}>R${restante.toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{percent.toFixed(0)}% utilizado</span>
                      <span className="flex items-center gap-1">
                        {isCritical && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        {!isCritical && !isWarning && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {isCritical ? "Orçamento crítico!" : isWarning ? "Atenção" : "Dentro do limite"}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                    />
                  </div>

                  {/* Rodapé */}
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    Referência: {format(new Date(orc.mes_referencia), "MM/yyyy", { locale: ptBR })}
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