import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, Plus, Pencil, Trash2, Users, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import LayoutEditor from "../components/linha/LayoutEditor";

const TIPOS_MAP = {
  operacao: "🔧", armario: "🗄️", bancada: "🪑", esteira: "➡️",
  entrada: "🚪", saida: "🏁", qualidade: "🔍", ferramenta: "🔩",
  lixeira: "♻️", texto: "📝"
};
const TURNO_LABEL = { manha: "Manhã", tarde: "Tarde", noite: "Noite", todos: "Todos" };

export default function LayoutLinhaPage() {
  const [editingLayout, setEditingLayout] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: layouts = [], isLoading } = useQuery({
    queryKey: ["layouts-linha"],
    queryFn: () => base44.entities.LayoutLinha.list("-created_date")
  });

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["layouts-linha"] });
    setShowEditor(false);
    setEditingLayout(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este layout?")) return;
    await base44.entities.LayoutLinha.delete(id);
    queryClient.invalidateQueries({ queryKey: ["layouts-linha"] });
  };

  if (showEditor) {
    return (
      <div className="max-w-[1600px] mx-auto">
        {/* Back header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setShowEditor(false); setEditingLayout(null); }}
            className="text-slate-600 hover:text-slate-900 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0066b1] rounded-lg flex items-center justify-center">
              <Grid className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {editingLayout ? `Editando: ${editingLayout.nome_linha}` : "Novo Layout"}
              </h2>
              <p className="text-[10px] text-slate-500">Monte o layout físico da linha</p>
            </div>
          </div>
        </div>
        <LayoutEditor
          layout={editingLayout}
          currentUser={currentUser}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingLayout(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Layout das Linhas</h1>
            <p className="text-xs text-slate-500">Mapa físico das operações, armários e postos</p>
          </div>
        </div>
        <Button onClick={() => { setEditingLayout(null); setShowEditor(true); }}
          className="bg-[#0066b1] hover:bg-[#004d82]">
          <Plus className="w-4 h-4 mr-2" /> Novo Layout
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066b1]" />
        </div>
      ) : layouts.length === 0 ? (
        <div className="text-center py-20">
          <Grid className="w-14 h-14 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 mb-1">Nenhum layout criado</p>
          <p className="text-sm text-slate-400 mb-6">Crie o mapa visual da sua linha com posições de operações, armários e equipamentos.</p>
          <Button onClick={() => setShowEditor(true)} className="bg-[#0066b1] hover:bg-[#004d82]">
            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Layout
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout, i) => {
            const contadores = (layout.elementos || []).reduce((acc, el) => {
              acc[el.tipo] = (acc[el.tipo] || 0) + 1;
              return acc;
            }, {});
            const gw = layout.grade_largura || 20;
            const gh = layout.grade_altura || 12;
            return (
              <motion.div key={layout.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
                  {/* Preview */}
                  <div className="w-full h-28 bg-slate-50 relative border-b border-slate-200 overflow-hidden">
                    {(layout.elementos || []).map(el => (
                      <div key={el.id} className="absolute rounded flex items-center justify-center text-[10px]"
                        style={{
                          left: `${(el.x / gw) * 100}%`,
                          top: `${(el.y / gh) * 100}%`,
                          width: `${((el.largura || 2) / gw) * 100}%`,
                          height: `${((el.altura || 2) / gh) * 100}%`,
                          backgroundColor: (el.cor || "#0066b1") + "25",
                          border: `1.5px solid ${el.cor || "#0066b1"}`,
                          borderRadius: 4,
                        }}>
                        {TIPOS_MAP[el.tipo]}
                      </div>
                    ))}
                    {(layout.elementos || []).length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">vazio</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-[10px] bg-white">{gw}×{gh}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{layout.nome_linha}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3 h-3" /> {layout.equipe}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {TURNO_LABEL[layout.turno] || layout.turno}
                      </span>
                    </div>

                    {/* Chips de tipos */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Object.entries(contadores).map(([tipo, qtd]) => (
                        <span key={tipo} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-600">
                          {TIPOS_MAP[tipo]} {qtd}
                        </span>
                      ))}
                      {(layout.elementos || []).length === 0 && (
                        <span className="text-xs text-slate-400 italic">Sem elementos</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8 hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]"
                        onClick={() => { setEditingLayout(layout); setShowEditor(true); }}>
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8 text-red-600 hover:bg-red-50 hover:border-red-300 px-3"
                        onClick={() => handleDelete(layout.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}