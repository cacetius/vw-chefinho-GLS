import React, { useState } from "react";

// Calendário circular tipo "rosca" com 31 dias ao redor
// Status: "concluido" (verde), "nao_atingido" (vermelho), "feriado" (hachura cinza), null (branco)

const STATUS_COLORS = {
  concluido: "#22c55e",
  nao_atingido: "#f87171",
  feriado: "#cbd5e1",
  null: "#f8fafc",
};

const RING_OUTER = 130;
const RING_INNER = 75;
const CENTER_X = 150;
const CENTER_Y = 150;
const SVG_SIZE = 300;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const s1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const e1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const s2 = polarToCartesian(cx, cy, rInner, endAngle);
  const e2 = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
    "Z",
  ].join(" ");
}

// Rings: 5 anéis concêntricos (1 para cada objetivo diário)
const NUM_RINGS = 5;
const RING_STEP = (RING_OUTER - RING_INNER) / NUM_RINGS;

export default function CalendarioRosca({ registros = {}, diasNoMes = 31, mesAtual, onDiaClick }) {
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState(null);

  const anglePerDay = 360 / diasNoMes;

  const handleClick = (dia, e) => {
    setSelected(dia);
    setPopup({ dia, x: e.clientX, y: e.clientY });
  };

  const handleMarcar = (status) => {
    if (popup) {
      onDiaClick(popup.dia, status);
      setPopup(null);
      setSelected(null);
    }
  };

  // Calcula status do dia baseado nos registros
  const getDiaStatus = (dia) => {
    const objs = registros[dia];
    if (!objs || objs.length === 0) return null;
    const algumNaoAtingido = objs.some(o => !o.concluido);
    if (algumNaoAtingido) return "nao_atingido";
    return "concluido";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={{ touchAction: "none" }}
      >
        {/* Anéis de fundo (5 níveis de objetivo) */}
        {Array.from({ length: NUM_RINGS }).map((_, ringIdx) => {
          const rOut = RING_OUTER - ringIdx * RING_STEP;
          const rIn = rOut - RING_STEP + 1;
          return Array.from({ length: diasNoMes }).map((_, dayIdx) => {
            const dia = dayIdx + 1;
            const start = dayIdx * anglePerDay;
            const end = start + anglePerDay - 1;
            const status = getDiaStatus(dia);
            const fill =
              status === "concluido" ? STATUS_COLORS.concluido :
              status === "nao_atingido" && ringIdx === 0 ? STATUS_COLORS.nao_atingido :
              STATUS_COLORS.null;

            return (
              <path
                key={`ring-${ringIdx}-day-${dia}`}
                d={describeArc(CENTER_X, CENTER_Y, rOut, rIn, start, end)}
                fill={fill}
                stroke="#e2e8f0"
                strokeWidth="0.8"
                onClick={(e) => ringIdx === 0 && handleClick(dia, e)}
                style={{ cursor: ringIdx === 0 ? "pointer" : "default" }}
              />
            );
          });
        })}

        {/* Números dos dias na borda externa */}
        {Array.from({ length: diasNoMes }).map((_, dayIdx) => {
          const dia = dayIdx + 1;
          const midAngle = dayIdx * anglePerDay + anglePerDay / 2;
          const labelR = RING_OUTER + 10;
          const pos = polarToCartesian(CENTER_X, CENTER_Y, labelR, midAngle);
          return (
            <text
              key={`label-${dia}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="#64748b"
              fontWeight={dia === new Date().getDate() ? "bold" : "normal"}
            >
              {dia}
            </text>
          );
        })}

        {/* Números dos anéis (1-5 objetivos) no centro-esquerda */}
        {Array.from({ length: NUM_RINGS }).map((_, i) => {
          const ringLabel = NUM_RINGS - i;
          const rMid = RING_OUTER - i * RING_STEP - RING_STEP / 2;
          return (
            <text
              key={`ring-label-${i}`}
              x={CENTER_X}
              y={CENTER_Y - rMid + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#94a3b8"
            >
              {ringLabel}
            </text>
          );
        })}

        {/* Centro da rosca */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={RING_INNER - 2} fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <text x={CENTER_X} y={CENTER_Y - 6} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">
          {mesAtual ? mesAtual.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase() : "MÊS"}
        </text>
        <text x={CENTER_X} y={CENTER_Y + 6} textAnchor="middle" fontSize="8" fill="#94a3b8">
          {mesAtual?.getFullYear()}
        </text>
      </svg>

      {/* Popup de ação ao clicar no dia */}
      {popup && (
        <div
          className="fixed z-50 bg-white shadow-xl rounded-xl border border-slate-200 p-3 space-y-2 min-w-[160px]"
          style={{ top: popup.y - 100, left: popup.x - 80 }}
        >
          <p className="text-xs font-bold text-slate-700 text-center">Dia {popup.dia}</p>
          <button
            onClick={() => handleMarcar("concluido")}
            className="w-full text-xs py-2 rounded-lg bg-green-500 text-white font-semibold"
          >
            ✅ Objetivo Atingido
          </button>
          <button
            onClick={() => handleMarcar("nao_atingido")}
            className="w-full text-xs py-2 rounded-lg bg-red-400 text-white font-semibold"
          >
            ❌ Não Atingido
          </button>
          <button
            onClick={() => handleMarcar("feriado")}
            className="w-full text-xs py-2 rounded-lg bg-slate-200 text-slate-600 font-semibold"
          >
            📅 Feriado / Sem produção
          </button>
          <button
            onClick={() => setPopup(null)}
            className="w-full text-[10px] py-1 text-slate-400"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}