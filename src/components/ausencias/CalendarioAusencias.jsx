import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

export default function CalendarioAusencias({ ausencias }) {
  const [date, setDate] = React.useState(new Date());

  const getAusenciasParaDia = (dia) => {
    return ausencias.filter(a => {
      const inicio = new Date(a.data_inicio);
      const fim = new Date(a.data_fim);
      return dia >= inicio && dia <= fim;
    });
  };

  const ausenciasDoDia = getAusenciasParaDia(date);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>Calendário de Ausências</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            Ausências em {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ausenciasDoDia.length > 0 ? (
            <div className="space-y-3">
              {ausenciasDoDia.map((ausencia) => (
                <div key={ausencia.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">{ausencia.colaborador_nome}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{ausencia.tipo}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma ausência neste dia
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}