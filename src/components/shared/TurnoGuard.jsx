import React, { useState, useEffect } from "react";
import { Clock, Lock, Sun, Sunrise, Moon } from "lucide-react";
import SenhaEmergenciaModal from "./SenhaEmergenciaModal";

// ─── Turnos VW Taubaté ────────────────────────────────────────────────────────
// 1º Turno (manha): 06:00 – 14:48
// 2º Turno (tarde): 14:48 – 23:36
// 3º Turno (noite): 23:36 – 06:00

export function isSupervisorOuAdmin(user) {
  return user?.cargo === "supervisor" || user?.role === "admin";
}

export function isTurnoAtivo(turno, user) {
  if (user && isSupervisorOuAdmin(user)) return true;
  if (!turno) return true;

  // Verifica sessão de emergência
  const valEmerg = sessionStorage.getItem("vw_acesso_emergencia");
  if (valEmerg === new Date().toDateString()) return true;

  const agora = new Date();
  const totalMin = agora.getHours() * 60 + agora.getMinutes();

  if (turno === "manha") return totalMin >= 360 && totalMin < 888;   // 06:00–14:48
  if (turno === "tarde") return totalMin >= 888 && totalMin < 1416;  // 14:48–23:36
  if (turno === "noite") return totalMin >= 1416 || totalMin < 360;  // 23:36–06:00

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

export default function TurnoGuard({ turno, children, currentUser }) {
  return children;
}