import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Grid, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

const TIPOS_MAP = {
  operacao: "🔧", armario: "🗄️", bancada: "🪑", esteira: "➡️",
  entrada: "🚪", saida: "🏁", qualidade: "🔍", ferramenta: "🔩",
  lixeira: "♻️", texto: "📝"
};

const TURNO_LABEL = { manha: "Manhã", tarde: "Tarde", noite: "Noite", todos: "Todos" };

export default function LayoutsList({ layouts, onEdit, onDelete, onNew }) {
  if (layouts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Grid className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-semibold text-slate-600 mb-2">Nenhum layout criado ainda</p>
        <p className="text-sm mb-6">Crie o layout visual da sua linha de produção com posições de operações, armários e mais.</p>
        <Button onClick={onNew} className="bg-[#0066b1] hover:bg-[#004d82]">
          <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Layout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew} className="bg-[#0066b1] hover:bg-[#004d82]">
          <Plus className="w-4 h-4 mr-2" /> Novo Layout
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layouts.map((layout, i) => {
          const contadores = (layout.elementos || []).reduce((acc, el) => {
            acc[el.tipo] = (acc[el.tipo] || 0) + 1;
            return acc;
          }, {});
          return (
            <motion.div key={layout.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{layout.nome_linha}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3 h-3" /> {layout.equipe}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" /> {TURNO_LABEL[layout.turno] || layout.turno}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {layout.grade_largura || 20}×{layout.grade_altura || 12}
                    </Badge>
                  </div>

                  {/* Resumo de elementos */}
                  <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
                    {Object.entries(contadores).map(([tipo, qtd]) => (
                      <span key={tipo} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[11px] text-slate-600">
                        {TIPOS_MAP[tipo]} {qtd}
                      </span>
                    ))}
                    {(layout.elementos || []).length === 0 && (
                      <span className="text-xs text-slate-400 italic">Layout vazio</span>
                    )}
                  </div>

                  {/* Preview mini do layout */}
                  <div className="w-full h-16 bg-slate-50 rounded border border-slate-200 relative overflow-hidden mb-4">
                    {(layout.elementos || []).slice(0, 30).map(el => {
                      const gw = layout.grade_largura || 20;
                      const gh = layout.grade_altura || 12;
                      return (
                        <div key={el.id} className="absolute rounded flex items-center justify-center text-[8px]"
                          style={{
                            left: `${(el.x / gw) * 100}%`,
                            top: `${(el.y / gh) * 100}%`,
                            width: `${((el.largura || 2) / gw) * 100}%`,
                            height: `${((el.altura || 2) / gh) * 100}%`,
                            backgroundColor: (el.cor || "#0066b1") + "33",
                            borderLeft: `2px solid ${el.cor || "#0066b1"}`,
                          }}>
                          {TIPOS_MAP[el.tipo]}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]" onClick={() => onEdit(layout)}>
                      <Pencil className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs text-red-600 hover:bg-red-50 hover:border-red-300 px-3"
                      onClick={() => window.confirm("Excluir este layout?") && onDelete(layout.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}