import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import PlanoAcaoForm from "./PlanoAcaoForm";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO } from "date-fns";

const STATUS_CONFIG = {
  aberto:                  { label: "Aberto",              className: "bg-gray-100 text-gray-800" },
  em_andamento:            { label: "Em Andamento",         className: "bg-blue-100 text-blue-800" },
  aguardando_verificacao:  { label: "Ag. Verificação",     className: "bg-yellow-100 text-yellow-800" },
  concluido:               { label: "Concluído",           className: "bg-green-100 text-green-800" },
  cancelado:               { label: "Cancelado",           className: "bg-red-100 text-red-800" },
};

const STATUS_ICONS = {
  concluido: <CheckCircle className="w-3.5 h-3.5" />,
  em_andamento: <Clock className="w-3.5 h-3.5" />,
};

function statusIcon(s) {
  return STATUS_ICONS[s] || <AlertTriangle className="w-3.5 h-3.5" />;
}

export default function PlanoAcaoList({ planosAcao, auditorias, onRefresh, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [validando, setValidando] = useState(null);

  const isLiderOuAdmin =
    currentUser?.role === "admin" ||
    currentUser?.cargo === "supervisor" ||
    currentUser?.cargo === "lider";

  const handleValidar = async (plano) => {
    setValidando(plano.id);
    await base44.entities.PlanoAcaoVDA.update(plano.id, {
      eficacia_verificada: true,
      status: "concluido",
      data_verificacao: new Date().toISOString().split("T")[0],
      verificado_por: currentUser?.nome_exibicao || currentUser?.full_name || currentUser?.email,
    });
    onRefresh();
    setValidando(null);
  };

  const handleUpdateStatus = async (plano, novoStatus) => {
    await base44.entities.PlanoAcaoVDA.update(plano.id, { status: novoStatus });
    onRefresh();
  };

  const hoje = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-700">Planos de Ação ({planosAcao.length})</h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo Plano
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <PlanoAcaoForm
            auditorias={auditorias}
            currentUser={currentUser}
            onSubmit={() => { setShowForm(false); onRefresh(); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {planosAcao.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">Nenhum plano de ação registrado</p>
            <p className="text-slate-300 text-xs mt-1">Clique em "Novo Plano" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {planosAcao.map((plano, i) => {
            const diasRestantes = plano.prazo_conclusao
              ? differenceInDays(parseISO(plano.prazo_conclusao), hoje)
              : null;
            const vencido = diasRestantes !== null && diasRestantes < 0 && plano.status !== "concluido";
            const cfg = STATUS_CONFIG[plano.status] || STATUS_CONFIG.aberto;

            return (
              <motion.div
                key={plano.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`border-l-4 ${vencido ? "border-l-red-500" : plano.eficacia_verificada ? "border-l-green-500" : "border-l-purple-500"} border border-slate-200`}>
                  <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                        <Badge className={`text-[10px] px-1.5 py-0 flex items-center gap-1 ${cfg.className}`}>
                          {statusIcon(plano.status)}
                          {cfg.label}
                        </Badge>
                        {plano.eficacia_verificada && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Validado
                          </Badge>
                        )}
                        {vencido && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700">
                            {Math.abs(diasRestantes)}d atraso
                          </Badge>
                        )}
                        {diasRestantes !== null && diasRestantes >= 0 && plano.status !== "concluido" && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {diasRestantes === 0 ? "Hoje" : `${diasRestantes}d`}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Não conformidade */}
                    <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{plano.nao_conformidade}</p>

                    {/* Ação corretiva */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{plano.acao_corretiva}</p>

                    {/* Responsável + prazo */}
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
                      <span>👤 {plano.responsavel_nome}</span>
                      {plano.prazo_conclusao && (
                        <span>📅 {new Date(plano.prazo_conclusao).toLocaleDateString("pt-BR")}</span>
                      )}
                      {plano.verificado_por && (
                        <span>✅ {plano.verificado_por}</span>
                      )}
                    </div>

                    {/* Ações para líderes/admins */}
                    {isLiderOuAdmin && plano.status !== "concluido" && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100">
                        {/* Avançar status */}
                        {plano.status === "aberto" && (
                          <button
                            onClick={() => handleUpdateStatus(plano, "em_andamento")}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium active:bg-blue-100 touch-manipulation"
                          >
                            ▶ Iniciar
                          </button>
                        )}
                        {plano.status === "em_andamento" && (
                          <button
                            onClick={() => handleUpdateStatus(plano, "aguardando_verificacao")}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 font-medium active:bg-yellow-100 touch-manipulation"
                          >
                            ⏳ Ag. Verificação
                          </button>
                        )}
                        {/* Validar eficácia */}
                        {(plano.status === "aguardando_verificacao" || plano.status === "em_andamento") && (
                          <button
                            onClick={() => handleValidar(plano)}
                            disabled={validando === plano.id}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-green-500 text-white font-semibold active:bg-green-600 touch-manipulation disabled:opacity-50 flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {validando === plano.id ? "Validando..." : "Validar Eficácia"}
                          </button>
                        )}
                        {/* Cancelar */}
                        <button
                          onClick={() => handleUpdateStatus(plano, "cancelado")}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium active:bg-red-100 touch-manipulation ml-auto"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}