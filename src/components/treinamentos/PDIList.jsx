import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

export default function PDIList({ pdis, currentUser }) {
  return (
    <div className="space-y-4">
      {pdis.map((pdi) => (
        <Card key={pdi.id} className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{pdi.colaborador_nome}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Habilidade #{pdi.habilidade_alvo}
                </p>
              </div>
              <Badge className={pdi.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {pdi.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span className="font-semibold">{pdi.progresso || 0}%</span>
                </div>
                <Progress value={pdi.progresso || 0} />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nível Atual</p>
                  <Badge variant="outline">{pdi.nivel_atual}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nível Alvo</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {pdi.nivel_alvo}
                  </Badge>
                </div>
              </div>

              {pdi.acoes && pdi.acoes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Ações do Plano</p>
                  <div className="space-y-2">
                    {pdi.acoes.map((acao, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={acao.concluida}
                          readOnly
                          className="w-4 h-4"
                        />
                        <span className={`text-sm flex-1 ${acao.concluida ? 'line-through text-gray-500' : ''}`}>
                          {acao.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {pdis.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum PDI cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}