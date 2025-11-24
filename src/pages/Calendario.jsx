import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventoForm from "../components/calendario/EventoForm";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadEventos();
  }, [currentDate]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadEventos = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    const data = await base44.entities.EventoCalendario.list();
    const eventosDoMes = data.filter(e => {
      const eventDate = new Date(e.data_inicio);
      return eventDate >= start && eventDate <= end;
    });
    setEventos(eventosDoMes);
  };

  const handleSubmit = async (eventoData) => {
    await base44.entities.EventoCalendario.create({
      ...eventoData,
      criado_por: currentUser.id
    });
    setShowForm(false);
    setSelectedDate(null);
    loadEventos();
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventosDay = (day) => {
    return eventos.filter(e => isSameDay(new Date(e.data_inicio), day));
  };

  const tipoColors = {
    tarefa: "bg-blue-500",
    treinamento: "bg-green-500",
    ausencia: "bg-red-500",
    manutencao: "bg-yellow-500",
    reuniao: "bg-purple-500",
    outro: "bg-gray-500"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#001e50] flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#0066b1]" />
              Calendário
            </h1>
            <p className="text-gray-600 mt-1">Visualize todos os eventos, tarefas e compromissos</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#001e50] to-[#0066b1]">
            <Plus className="w-5 h-5 mr-2" />
            Novo Evento
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <EventoForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              dataInicial={selectedDate}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-xl">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div key={dia} className="text-center font-semibold text-gray-600 text-sm">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const eventosDay = getEventosDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      isToday ? 'bg-blue-50 border-blue-500 border-2' : 'bg-white'
                    } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowForm(true);
                    }}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {eventosDay.slice(0, 3).map((evento) => (
                        <div
                          key={evento.id}
                          className={`text-xs px-2 py-1 rounded text-white truncate ${tipoColors[evento.tipo]}`}
                          title={evento.titulo}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      {eventosDay.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{eventosDay.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Tarefas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Treinamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Ausências</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Manutenções</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Reuniões</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}