import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Grid, Plus, Pencil, Trash2, Users, Clock, Search, Eye, MoreVertical, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LayoutEditor from "../components/linha/LayoutEditor";

const TIPOS_MAP = {
  operacao: "🔧", armario: "🗄️", bancada: "🪑", esteira: "➡️",
  entrada: "🚪", saida: "🏁", qualidade: "🔍", ferramenta: "🔩",
  lixeira: "♻️", texto: "📝"
};
const TURNO_LABEL = { manha: "Manhã", tarde: "Tarde", noite: "Noite", todos: "Todos" };
const TURNO_COLOR = { manha: "bg-amber-100 text-amber-700", tarde: "bg-orange-100 text-orange-700", noite: "bg-indigo-100 text-indigo-700", todos: "bg-slate-100 text-slate-600" };

function LayoutPreview({ layout }) {
  const gw = layout.grade_largura || 14;
  const gh = layout.grade_altura || 10;
  return (
    <div className="w-full h-28 bg-slate-50 relative border-b border-slate-200 overflow-hidden"
      style={{ backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)", backgroundSize: "10px 10px" }}>
      {(layout.elementos || []).map(el => (
        <div key={el.id} className="absolute flex items-center justify-center"
          style={{
            left: `${(el.x / gw) * 100}%`, top: `${(el.y / gh) * 100}%`,
            width: `${((el.largura || 2) / gw) * 100}%`, height: `${((el.altura || 2) / gh) * 100}%`,
            backgroundColor: (el.cor || "#0066b1") + "22",
            border: `1.5px solid ${el.cor || "#0066b1"}99`,
            borderRadius: 4, fontSize: 10
          }}>
          <span>{TIPOS_MAP[el.tipo]}</span>
        </div>
      ))}
      {!(layout.elementos?.length) && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">layout vazio</div>
      )}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className="text-[10px] bg-white/80 backdrop-blur-sm">{gw}×{gh}</Badge>
      </div>
    </div>
  );
}

export default function LayoutLinhaPage() {
  const [view, setView] = useState("list"); // list | editor | preview
  const [editingLayout, setEditingLayout] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
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
    setView("list");
    setEditingLayout(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este layout?")) return;
    await base44.entities.LayoutLinha.delete(id);
    queryClient.invalidateQueries({ queryKey: ["layouts-linha"] });
  };

  const openNew = () => { setEditingLayout(null); setView("editor"); };
  const openEdit = (l) => { setEditingLayout(l); setView("editor"); };
  const openPreview = (l) => { setPreviewLayout(l); setView("preview"); };
  const backToList = () => { setView("list"); setEditingLayout(null); setPreviewLayout(null); };

  const filtered = layouts.filter(l =>
    !search ||
    l.nome_linha?.toLowerCase().includes(search.toLowerCase()) ||
    l.equipe?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Editor ──
  if (view === "editor") {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="-ml-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0066b1] rounded-lg flex items-center justify-center">
              <Grid className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {editingLayout ? `Editando: ${editingLayout.nome_linha}` : "Novo Layout"}
              </h2>
              <p className="text-[10px] text-slate-400">Clique na grade para adicionar elementos</p>
            </div>
          </div>
        </div>
        <LayoutEditor layout={editingLayout} currentUser={currentUser} onSave={handleSave} onCancel={backToList} />
      </div>
    );
  }

  // ── Preview fullscreen ──
  if (view === "preview" && previewLayout) {
    const gw = previewLayout.grade_largura || 14;
    const gh = previewLayout.grade_altura || 10;
    const CELL = Math.min(Math.floor((window.innerWidth - 48) / gw), 70);
    return (
      <div className="max-w-full">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="-ml-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">{previewLayout.nome_linha}</h2>
            <p className="text-[10px] text-slate-400">{previewLayout.equipe} • {TURNO_LABEL[previewLayout.turno]}</p>
          </div>
          <div className="ml-auto">
            <Button size="sm" className="bg-[#0066b1] hover:bg-[#004d82]"
              onClick={() => { setEditingLayout(previewLayout); setView("editor"); }}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
            </Button>
          </div>
        </div>
        <Card className="border border-slate-200">
          <CardContent className="p-4 overflow-auto">
            <div className="relative mx-auto"
              style={{
                width: gw * CELL, height: gh * CELL,
                backgroundImage: "radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)",
                backgroundSize: `${CELL}px ${CELL}px`,
                border: "1px solid #e2e8f0", borderRadius: 8
              }}>
              {(previewLayout.elementos || []).map(el => (
                <div key={el.id} className="absolute flex flex-col items-center justify-center rounded-xl border-2 shadow-sm"
                  style={{
                    left: el.x * CELL + 3, top: el.y * CELL + 3,
                    width: (el.largura || 2) * CELL - 6, height: (el.altura || 2) * CELL - 6,
                    backgroundColor: (el.cor || "#0066b1") + "18",
                    borderColor: el.cor || "#0066b1",
                  }}>
                  <span className="text-2xl leading-none">{TIPOS_MAP[el.tipo]}</span>
                  <p className="text-[9px] font-bold mt-0.5 text-center px-0.5 truncate w-full text-center"
                    style={{ color: el.cor || "#0066b1" }}>{el.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── List ──
  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center flex-shrink-0">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Layout das Linhas</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Mapa físico das operações</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-[#0066b1] hover:bg-[#004d82]">
          <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Novo Layout</span>
        </Button>
      </div>

      {/* Search */}
      {layouts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por linha ou equipe..." className="pl-9 h-9 text-sm" />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066b1]" />
        </div>
      ) : layouts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Grid className="w-10 h-10 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">Nenhum layout criado</p>
          <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Monte o mapa visual da sua linha de produção com posições de operações, armários e equipamentos.</p>
          <Button onClick={openNew} className="bg-[#0066b1] hover:bg-[#004d82]">
            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Layout
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Nenhum resultado para "<strong>{search}</strong>"</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((layout, i) => {
            const contadores = (layout.elementos || []).reduce((acc, el) => {
              acc[el.tipo] = (acc[el.tipo] || 0) + 1;
              return acc;
            }, {});
            return (
              <motion.div key={layout.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-slate-200 hover:shadow-md transition-all overflow-hidden group">
                  {/* Preview */}
                  <div className="relative cursor-pointer" onClick={() => openPreview(layout)}>
                    <LayoutPreview layout={layout} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <Eye className="w-4 h-4 text-[#0066b1]" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{layout.nome_linha}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
                            <Users className="w-3 h-3 flex-shrink-0" />{layout.equipe}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Badge className={`text-[10px] px-1.5 py-0 ${TURNO_COLOR[layout.turno] || TURNO_COLOR.todos}`}>
                          {TURNO_LABEL[layout.turno] || layout.turno}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-slate-100"><MoreVertical className="w-3.5 h-3.5 text-slate-400" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPreview(layout)}>
                              <Eye className="w-4 h-4 mr-2" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(layout)}>
                              <Pencil className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(layout.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
                      {Object.entries(contadores).slice(0, 6).map(([tipo, qtd]) => (
                        <span key={tipo} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-600">
                          {TIPOS_MAP[tipo]} {qtd}
                        </span>
                      ))}
                      {!Object.keys(contadores).length && <span className="text-[11px] text-slate-400 italic">Sem elementos</span>}
                    </div>

                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-xs hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]"
                        onClick={() => openEdit(layout)}>
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs hover:bg-slate-100 px-2"
                        onClick={() => openPreview(layout)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50 hover:border-red-300 px-2"
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