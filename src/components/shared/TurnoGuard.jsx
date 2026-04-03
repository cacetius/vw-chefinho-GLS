import React from "react";
import { Clock, Lock } from "lucide-react";

// Horários por turno
// 1º Turno (manha): 06:00 - 15:00
// 2º Turno (tarde): 14:50 - 00:00
// 3º Turno (noite): 21:50 - 06:00 (passa meia-noite)

// Supervisor e admin (role="admin") sempre têm acesso, independente do turno
export function isSupervisorOuAdmin(user) {
  return user?.cargo === "supervisor" || user?.role === "admin";
}

export function isTurnoAtivo(turno, user) {
  // Supervisor e admin ignoram restrição de turno
  if (user && isSupervisorOuAdmin(user)) return true;

  const agora = new Date();
  const h = agora.getHours();
  const m = agora.getMinutes();
  const totalMin = h * 60 + m; // minutos desde meia-noite

  if (turno === "manha") {
    // 06:00 (360) até 15:00 (900)
    return totalMin >= 360 && totalMin < 900;
  }
  if (turno === "tarde") {
    // 14:50 (890) até 00:00 (1440) — fim do dia
    return totalMin >= 890;
  }
  if (turno === "noite") {
    // 21:50 (1310) até 06:00 (360) do dia seguinte
    return totalMin >= 1310 || totalMin < 360;
  }
  // Sem turno definido: libera
  return true;
}

export function getProximoHorario(turno) {
  if (turno === "manha") return "06:00";
  if (turno === "tarde") return "14:50";
  if (turno === "noite") return "21:50";
  return "--:--";
}

export function getTurnoLabel(turno) {
  if (turno === "manha") return "1º Turno (Manhã)";
  if (turno === "tarde") return "2º Turno (Tarde)";
  if (turno === "noite") return "3º Turno (Noite)";
  return "Turno não definido";
}

export default function TurnoGuard({ turno, children }) {
  const ativo = isTurnoAtivo(turno);

  if (ativo) return children;

  const proximoHorario = getProximoHorario(turno);
  const label = getTurnoLabel(turno);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#001e50] p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20">
            <Lock className="w-10 h-10 text-white/60" />
          </div>
        </div>

        {/* Logo */}
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0066b1] rounded-2xl mb-3 shadow-lg">
            <span className="text-2xl">🏭</span>
          </div>
          <h1 className="text-2xl font-bold text-white">VW Chefinho</h1>
          <p className="text-white/60 text-sm mt-1">Acesso Restrito por Turno</p>
        </div>

        {/* Mensagem */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{label}</p>
            <p className="text-white/60 text-sm mt-1">
              O aplicativo está disponível somente durante o horário do seu turno.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/50 text-xs mb-1">Próximo acesso disponível às</p>
            <p className="text-white text-3xl font-bold tracking-wider">{proximoHorario}</p>
          </div>
          <p className="text-white/40 text-xs">
            Se você acredita que houve um erro, entre em contato com seu líder.
          </p>
        </div>
      </div>
    </div>
  );
}