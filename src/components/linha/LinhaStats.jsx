import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, AlertTriangle } from "lucide-react";

export default function LinhaStats({ carros }) {
  // Carros por estação
  const estacoes = ["entrada", "chassi", "montagem", "pintura", "acabamento", "qualidade", "saida"];
  const carrosPorEstacao = estacoes.map(estacao => ({
    estacao: estacao,
    quantidade: carros.filter(c => c.estacao_atual === estacao).length
  }));

  // Carros por status
  const statusCount = carros.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCount).map(([status, count]) => ({
    status: status.replace('_', ' '),
    quantidade: count
  }));

  // Carros por modelo
  const modeloCount = carros.reduce((acc, c) => {
    acc[c.modelo] = (acc[c.modelo] || 0) + 1;
    return acc;
  }, {});

  const modeloData = Object.entries(modeloCount).map(([modelo, count]) => ({
    modelo,
    quantidade: count
  }));

  // Problemas por tipo
  const problemasCount = {};
  carros.forEach(c => {
    c.problemas?.forEach(p => {
      problemasCount[p.tipo] = (problemasCount[p.tipo] || 0) + 1;
    });
  });

  const problemasData = Object.entries(problemasCount).map(([tipo, count]) => ({
    tipo,
    quantidade: count
  }));

  const COLORS = ['#0066b1', '#00b0f0', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  if (carros.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carros por Estação */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Distribuição por Estação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carrosPorEstacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estacao" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#0066b1" name="Carros" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status dos Carros */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Status dos Carros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="quantidade"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modelos na Linha */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle>Modelos na Linha</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modeloData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="modelo" type="category" />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#10b981" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Problemas por Tipo */}
      {problemasData.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Problemas por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={problemasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#ef4444" name="Problemas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}