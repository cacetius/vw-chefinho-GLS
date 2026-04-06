import React, { useState, useEffect } from "react";
import { Clock, Lock, Sun, Sunrise, Moon } from "lucide-react";

// ─── Definição de Turnos VW Taubaté ────────────────────────────────────────────
// 1º Turno (manha): 06:00 – 14:48
// 2º Turno (tarde): 14:48 – 23:36
// 3º Turno (noite): 23:36 – 06:00

export function isSupervisorOuAdmin(user) {
  return user?.cargo === "supervisor" || user?.role === "admin" || user?.cargo === "lider";
}

export function isTurnoAtivo(turno, user) {
  if (user && isSupervisorOuAdmin(user)) return true;
  if (!turno) return true;

  const agora = new Date();
  const h = agora.getHours();
  const m = agora.getMinutes();
  const totalMin = h * 60 + m;

  // manha: 06:00 (360) → 14:48 (888)
  if (turno === "manha") return totalMin >= 360 && totalMin < 888;
  // tarde: 14:48 (888) → 23:36 (1416)
  if (turno === "tarde") return totalMin >= 888 && totalMin < 1416;
  // noite: 23:36 (1416) → 06:00 (360) — atravessa meia-noite
  if (turno === "noite") return totalMin >= 1416 || totalMin < 360;

  return true;
}

export function getProximoHorario(turno) {
  if (turno === "manha") return "06:00";
  if (turno === "tarde") return "14:48";
  if (turno === "noite") return "23:36";
  return "--:--";
}

export function getTurnoLabel(turno) {
  if (turno === "manha") return "1º Turno — Manhã";
  if (turno === "tarde") return "2º Turno — Tarde";
  if (turno === "noite") return "3º Turno — Noite";
  return "Turno não definido";
}

function getTurnoInfo(turno) {
  if (turno === "manha") return { icon: Sun, horario: "06:00 – 14:48", cor: "from-amber-400 to-orange-500", iconColor: "text-amber-400" };
  if (turno === "tarde") return { icon: Sunrise, horario: "14:48 – 23:36", cor: "from-orange-500 to-pink-500", iconColor: "text-orange-400" };
  if (turno === "noite") return { icon: Moon, horario: "23:36 – 06:00", cor: "from-indigo-600 to-purple-700", iconColor: "text-indigo-300" };
  return { icon: Clock, horario: "--:--", cor: "from-slate-600 to-slate-700", iconColor: "text-slate-400" };
}

export default function TurnoGuard({ turno, children }) {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [ativo, setAtivo] = useState(() => isTurnoAtivo(turno));

  useEffect(() => {
    const tick = setInterval(() => {
      const agora = new Date();
      setHoraAtual(agora);
      setAtivo(isTurnoAtivo(turno));
    }, 10000); // re-verifica a cada 10s
    return () => clearInterval(tick);
  }, [turno]);

  if (ativo) return children;

  const proximoHorario = getProximoHorario(turno);
  const label = getTurnoLabel(turno);
  const info = getTurnoInfo(turno);
  const TurnoIcon = info.icon;

  // Calcula tempo restante até o próximo turno
  const [hProx, mProx] = proximoHorario.split(":").map(Number);
  const agora = horaAtual;
  const proxDate = new Date(agora);
  proxDate.setHours(hProx, mProx, 0, 0);
  if (proxDate <= agora) proxDate.setDate(proxDate.getDate() + 1);
  const diffMs = proxDate - agora;
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#001e50] to-slate-900 p-4">
      <div className="max-w-sm w-full space-y-5 text-center">

        {/* Logo VW */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-[#0066b1] rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">🏭</span>
          </div>
          <p className="text-white font-bold text-lg tracking-tight">VW Chefinho</p>
        </div>

        {/* Ícone de cadeado */}
        <div className="relative flex justify-center">
          <div className="absolute w-28 h-28 bg-white/5 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
          <div className="w-24 h-24 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-white/50" />
          </div>
        </div>

        {/* Card de informação */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 space-y-5">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Acesso restrito</p>
            <p className="text-white text-xl font-bold">{label}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-white/60 text-sm">
              <TurnoIcon className={`w-4 h-4 ${info.iconColor}`} />
              <span>Horário do turno: <strong className="text-white">{info.horario}</strong></span>
            </div>
          </div>

          {/* Relógio atual */}
          <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
            <p className="text-white/40 text-[11px] uppercase tracking-wider mb-0.5">Agora</p>
            <p className="text-white text-4xl font-black tracking-widest tabular-nums">
              {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Próximo acesso */}
          <div className={`rounded-2xl px-4 py-3 text-center bg-gradient-to-r ${info.cor}`}>
            <p className="text-white/70 text-[11px] uppercase tracking-wider mb-0.5">Próximo acesso</p>
            <p className="text-white text-3xl font-black tracking-widest">{proximoHorario}</p>
            {(diffH > 0 || diffM > 0) && (
              <p className="text-white/70 text-xs mt-1">
                em {diffH > 0 ? `${diffH}h ` : ""}{diffM}min
              </p>
            )}
          </div>

          <p className="text-white/30 text-xs">
            Caso haja erro, entre em contato com seu líder ou supervisor.
          </p>
        </div>
      </div>
    </div>
  );
}