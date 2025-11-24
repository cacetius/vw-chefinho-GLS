import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

export default function EstoqueChart({ itens }) {
  const itensComHistorico = itens.filter(item => item.historico_precos && item.historico_precos.length > 1);

  if (itensComHistorico.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Não há histórico de preços suficiente para análise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {itensComHistorico.map((item) => {
        const dados = item.historico_precos.map(h => ({
          data: new Date(h.data).toLocaleDateString('pt-BR'),
          preco: h.preco,
          fornecedor: h.fornecedor
        }));

        return (
          <Card key={item.id} className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Histórico de Preços - {item.item}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="preco" stroke="#22c55e" name="Preço (R$)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Preço atual: <span className="font-bold text-green-600">R$ {item.preco_atual.toFixed(2)}</span>
                  {item.fornecedor && <span className="ml-2">• Fornecedor: {item.fornecedor}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}