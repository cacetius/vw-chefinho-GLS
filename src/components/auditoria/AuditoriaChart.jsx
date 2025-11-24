import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

export default function AuditoriaChart({ auditorias }) {
  // Dados para gráfico de conformidade ao longo do tempo
  const conformidadeData = auditorias
    .slice(-10)
    .map(a => ({
      data: new Date(a.data_auditoria).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      conformidade: a.percentual_conformidade || 0,
      area: a.area_auditada
    }));

  // Dados para gráfico de tipos de auditoria
  const tiposCount = auditorias.reduce((acc, a) => {
    acc[a.tipo_auditoria] = (acc[a.tipo_auditoria] || 0) + 1;
    return acc;
  }, {});

  const tiposData = Object.entries(tiposCount).map(([tipo, count]) => ({
    tipo: tipo.replace('_', ' '),
    quantidade: count
  }));

  // Dados para gráfico de não conformidades por categoria
  const categoriasNC = {};
  auditorias.forEach(a => {
    a.itens_checklist?.forEach(item => {
      if (item.status === 'nao_conforme') {
        categoriasNC[item.categoria] = (categoriasNC[item.categoria] || 0) + 1;
      }
    });
  });

  const categoriasData = Object.entries(categoriasNC).map(([cat, count]) => ({
    categoria: cat,
    quantidade: count
  }));

  const COLORS = ['#0066b1', '#00b0f0', '#001e50', '#4a90e2', '#82ca9d'];

  if (auditorias.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nenhum dado disponível para análise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evolução da Conformidade */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Evolução da Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conformidadeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="conformidade" 
                stroke="#0066b1" 
                strokeWidth={3}
                name="% Conformidade"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tipos de Auditoria */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Tipos de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tiposData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percent }) => `${tipo}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {tiposData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Não Conformidades por Categoria */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Não Conformidades por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoriasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#ef4444" name="Não Conformidades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}