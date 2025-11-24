import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function GastosChart({ pedidos }) {
  const gastosPorStatus = {
    pendente: 0,
    aprovado: 0,
    reprovado: 0,
    entregue: 0
  };

  pedidos.forEach(pedido => {
    if (gastosPorStatus[pedido.status] !== undefined) {
      gastosPorStatus[pedido.status] += pedido.valor_total || 0;
    }
  });

  const total = Object.values(gastosPorStatus).reduce((sum, val) => sum + val, 0);

  const statusInfo = [
    { status: "pendente", label: "Pendente", color: "bg-yellow-500", valor: gastosPorStatus.pendente },
    { status: "aprovado", label: "Aprovado", color: "bg-green-500", valor: gastosPorStatus.aprovado },
    { status: "entregue", label: "Entregue", color: "bg-blue-500", valor: gastosPorStatus.entregue },
    { status: "reprovado", label: "Reprovado", color: "bg-red-500", valor: gastosPorStatus.reprovado },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-white">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Análise de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {statusInfo.map((info) => (
            <div key={info.status}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{info.label}</span>
                <span className="text-sm font-bold">R$ {info.valor.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${info.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: total > 0 ? `${(info.valor / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Geral</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}