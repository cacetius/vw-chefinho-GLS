import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import PlanoAcaoForm from "./PlanoAcaoForm";
import { AnimatePresence } from "framer-motion";

export default function PlanoAcaoList({ planosAcao, auditorias, onRefresh, currentUser }) {
  const [showForm, setShowForm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "concluido": return "bg-green-100 text-green-800";
      case "em_andamento": return "bg-blue-100 text-blue-800";
      case "aguardando_verificacao": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "concluido": return <CheckCircle className="w-4 h-4" />;
      case "em_andamento": return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Planos de Ação</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano de Ação
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <PlanoAcaoForm
            auditorias={auditorias}
            currentUser={currentUser}
            onSubmit={() => {
              setShowForm(false);
              onRefresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {planosAcao.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg mb-2">Nenhum plano de ação registrado</p>
            <p className="text-gray-400 text-sm">Clique em "Novo Plano de Ação" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {planosAcao.map((plano) => (
            <Card key={plano.id} className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(plano.status)}>
                        {getStatusIcon(plano.status)}
                        <span className="ml-1">{plano.status.replace('_', ' ')}</span>
                      </Badge>
                      {plano.eficacia_verificada && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Eficácia Verificada
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{plano.nao_conformidade}</h4>

                    <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Ação Corretiva:</p>
                        <p className="text-gray-700">{plano.acao_corretiva}</p>
                      </div>
                      {plano.acao_preventiva && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Ação Preventiva:</p>
                          <p className="text-gray-700">{plano.acao_preventiva}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-4 text-xs text-gray-600">
                      <span>👤 Responsável: <strong>{plano.responsavel_nome}</strong></span>
                      <span>📅 Prazo: <strong>{new Date(plano.prazo_conclusao).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}