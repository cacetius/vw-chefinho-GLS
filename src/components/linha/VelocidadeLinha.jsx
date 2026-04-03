import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, TrendingUp, Clock, Car, Target } from "lucide-react";

// Duração de cada turno em horas
const DURACAO_TURNO_HORAS = 8.17; // ~8h10min de produção efetiva

export default function VelocidadeLinha({ carros }) {
  const stats = useMemo(() => {
    if (carros.length === 0) return null;

    // Pega carros que já têm tempo de entrada registrado
    const carrosComTempo = carros.filter(c => c.tempo_entrada);
    
    const agora = new Date();
    
    // Calcula tempo médio na linha (em minutos) dos carros já concluídos com tempo de saída ou estimativa
    // Como não temos tempo de saída, usamos o tempo desde entrada para concluídos
    const concluidos = carrosComTempo.filter(c => c.status === "concluido");
    
    let tempoMedioMin = null;
    if (concluidos.length > 0) {
      const tempos = concluidos.map(c => {
        const entrada = new Date(c.tempo_entrada);
        const diffMs = agora - entrada;
        return diffMs / 60000;
      });
      tempoMedioMin = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    }

    // Taxa atual: carros concluídos / tempo decorrido desde o 1º carro
    let taxaAtualPorHora = null;
    if (concluidos.length > 0 && carrosComTempo.length > 0) {
      const maisAntigo = carrosComTempo.reduce((min, c) => {
        const t = new Date(c.tempo_entrada);
        return t < min ? t : min;
      }, new Date(carrosComTempo[0].tempo_entrada));
      const horasDecorridas = (agora - maisAntigo) / 3600000;
      if (horasDecorridas > 0.05) {
        taxaAtualPorHora = concluidos.length / horasDecorridas;
      }
    }

    // Se não temos taxa calculada, usamos referência da VW Taubaté (~34 carros/turno)
    const taxaReferencia = 34 / DURACAO_TURNO_HORAS; // ~4.16 carros/hora
    const taxa = taxaAtualPorHora || taxaReferencia;

    // Previsão por turno
    const previsaoPorTurno = Math.round(taxa * DURACAO_TURNO_HORAS);

    // Carros/hora atual
    const carrosPorHora = Math.round(taxa * 10) / 10;

    // Takt time em minutos (tempo entre carros)
    const taktTimeMin = taxa > 0 ? Math.round((60 / taxa) * 10) / 10 : null;

    // Estimativa de quando a linha estará vazia (carros em processo / taxa)
    const emProcesso = carros.filter(c => c.status === "em_processo" || c.status === "aguardando").length;
    const minutosParaZerar = emProcesso > 0 && taxa > 0 ? Math.round((emProcesso / taxa) * 60) : null;

    // Eficiência: proporção de carros sem erro
    const semErro = carros.filter(c => c.status !== "erro").length;
    const eficiencia = Math.round((semErro / carros.length) * 100);

    return {
      taxa: carrosPorHora,
      previsaoPorTurno,
      taktTimeMin,
      tempoMedioMin: tempoMedioMin ? Math.round(tempoMedioMin) : null,
      minutosParaZerar,
      eficiencia,
      usandoReferencia: !taxaAtualPorHora,
    };
  }, [carros]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Gauge className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">Adicione carros na linha para ver a velocidade</p>
      </div>
    );
  }

  // Barra de velocidade relativa ao alvo (34 carros/turno = 100%)
  const velocidadePercent = Math.min(100, Math.round((stats.previsaoPorTurno / 34) * 100));
  const corVelocidade = velocidadePercent >= 90 ? "bg-emerald-500" : velocidadePercent >= 70 ? "bg-amber-500" : "bg-red-500";
  const corTextoVel = velocidadePercent >= 90 ? "text-emerald-600" : velocidadePercent >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-3">
      {/* Card principal: Velocidade */}
      <div className="bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-5 h-5 text-blue-200" />
          <span className="text-sm font-bold">Velocidade da Linha</span>
          {stats.usandoReferencia && (
            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full ml-auto">Ref. VW Taubaté</span>
          )}
        </div>

        {/* Taxa em carros/hora */}
        <div className="flex items-end gap-2 mb-3">
          <span className="text-5xl font-black leading-none">{stats.taxa}</span>
          <div className="mb-1">
            <p className="text-blue-200 text-xs font-medium">carros/hora</p>
          </div>
        </div>

        {/* Barra de progresso vs meta */}
        <div>
          <div className="flex justify-between text-[10px] text-blue-200 mb-1">
            <span>Progresso vs meta (34/turno)</span>
            <span className="font-bold text-white">{velocidadePercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-white transition-all duration-700"
              style={{ width: `${velocidadePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cards de previsão */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border border-slate-200 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-[#0066b1]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Previsão/Turno</span>
            </div>
            <p className={`text-3xl font-black ${corTextoVel}`}>{stats.previsaoPorTurno}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">carros por turno</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Takt Time</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{stats.taktTimeMin ?? "—"}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">min entre carros</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Eficiência</span>
            </div>
            <p className={`text-3xl font-black ${stats.eficiencia >= 90 ? "text-emerald-600" : stats.eficiencia >= 70 ? "text-amber-600" : "text-red-600"}`}>
              {stats.eficiencia}%
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">veículos sem erro</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Fila Atual</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{carros.filter(c => c.status === "em_processo" || c.status === "aguardando").length}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              {stats.minutosParaZerar ? `~${stats.minutosParaZerar}min p/ zerar` : "em processo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referência VW Taubaté */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-[10px] font-bold text-slate-600 mb-2">📊 Referência VW Taubaté</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-base font-bold text-[#0066b1]">34</p>
            <p className="text-[9px] text-slate-400">carros/turno</p>
          </div>
          <div>
            <p className="text-base font-bold text-[#0066b1]">~4.2</p>
            <p className="text-[9px] text-slate-400">carros/hora</p>
          </div>
          <div>
            <p className="text-base font-bold text-[#0066b1]">~14min</p>
            <p className="text-[9px] text-slate-400">takt time</p>
          </div>
        </div>
      </div>
    </div>
  );
}