import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const getNivelBadge = (nivel) => {
  switch(nivel) {
    case "nao_treinado":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Não Treinado</Badge>;
    case "em_treinamento":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Em Treinamento</Badge>;
    case "treinado":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Treinado</Badge>;
    case "instrutor":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Instrutor</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const getNivelColor = (nivel) => {
  switch(nivel) {
    case "nao_treinado": return "bg-gray-100";
    case "em_treinamento": return "bg-yellow-100";
    case "treinado": return "bg-green-100";
    case "instrutor": return "bg-blue-100";
    default: return "bg-white";
  }
};

export default function MatrizHabilidades({ colaboradores = [], onEdit, onDelete }) {
  // Obter todas as habilidades únicas
  const todasHabilidades = [];
  colaboradores.forEach(colab => {
    colab.habilidades?.forEach(hab => {
      if (!todasHabilidades.find(h => h.numero === hab.numero)) {
        todasHabilidades.push(hab);
      }
    });
  });
  todasHabilidades.sort((a, b) => a.numero - b.numero);

  if (colaboradores.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p>Nenhum colaborador cadastrado na matriz de habilidades</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-3 px-3">
      <div style={{ minWidth: Math.max(320, 200 + todasHabilidades.length * 100) + 'px' }}>
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <tr>
            <th className="px-3 py-2 text-left font-semibold sticky left-0 bg-purple-600 z-10 text-xs min-w-[120px]">Colaborador</th>
            {todasHabilidades.map((hab) => (
              <th key={hab.numero} className="px-2 py-2 text-center font-semibold min-w-[80px]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{hab.numero}</span>
                  <span className="text-[9px] font-normal leading-tight">{hab.descricao}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colaboradores.map((colaborador, idx) => (
            <tr key={colaborador.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-3 py-2 sticky left-0 bg-inherit z-10">
                <p className="font-medium text-gray-900 text-xs truncate max-w-[110px]">{colaborador.colaborador}</p>
                <p className="text-[9px] text-gray-400">{colaborador.chapa}</p>
              </td>
              {todasHabilidades.map((hab) => {
                const habilidadeColab = colaborador.habilidades?.find(h => h.numero === hab.numero);
                const nivel = habilidadeColab?.nivel || "nao_treinado";
                const dot = { nao_treinado: "bg-gray-300", em_treinamento: "bg-yellow-400", treinado: "bg-green-500", instrutor: "bg-blue-500" };
                return (
                  <td key={hab.numero} className={`px-2 py-2 text-center ${getNivelColor(nivel)}`}>
                    <div className={`w-4 h-4 rounded-full mx-auto ${dot[nivel] || "bg-gray-300"}`} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-600 font-semibold mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border"></div>
            <span className="text-xs">Não Treinado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-xs">Em Treinamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-xs">Treinado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-xs">Instrutor</span>
          </div>
        </div>
      </div>
    </div>
  );
}