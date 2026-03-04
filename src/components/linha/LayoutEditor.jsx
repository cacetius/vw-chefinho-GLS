import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import {
  Save, Trash2, Grid, ZoomIn, ZoomOut, RotateCcw,
  Move, Type, Plus, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIPOS = [
  { id: "operacao",   label: "Operação",   icon: "🔧", cor: "#0066b1", desc: "Posto de trabalho" },
  { id: "armario",    label: "Armário",    icon: "🗄️", cor: "#475569", desc: "Armário/Gaveta" },
  { id: "bancada",    label: "Bancada",    icon: "🪑", cor: "#92400e", desc: "Bancada/Mesa" },
  { id: "esteira",    label: "Esteira",    icon: "➡️", cor: "#1e40af", desc: "Esteira/Trilho" },
  { id: "entrada",    label: "Entrada",    icon: "🚪", cor: "#15803d", desc: "Entrada de peças" },
  { id: "saida",      label: "Saída",      icon: "🏁", cor: "#b91c1c", desc: "Saída/Expedição" },
  { id: "qualidade",  label: "Qualidade",  icon: "🔍", cor: "#7e22ce", desc: "Ponto de qualidade" },
  { id: "ferramenta", label: "Ferramenta", icon: "🔩", cor: "#b45309", desc: "Painel/Rack ferramentas" },
  { id: "lixeira",    label: "Lixeira",    icon: "♻️", cor: "#166534", desc: "Coleta seletiva" },
  { id: "texto",      label: "Texto",      icon: "📝", cor: "#64748b", desc: "Anotação livre" },
];

const CELL_SIZE = 48;

export default function LayoutEditor({ layout, onSave, onCancel, currentUser }) {
  const [elementos, setElementos] = useState(layout?.elementos || []);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [elementoSelecionado, setElementoSelecionado] = useState(null);
  const [editandoLabel, setEditandoLabel] = useState(false);
  const [labelTemp, setLabelTemp] = useState("");
  const [nomeLinha, setNomeLinha] = useState(layout?.nome_linha || "");
  const [equipe, setEquipe] = useState(layout?.equipe || currentUser?.equipe || "");
  const [turno, setTurno] = useState(layout?.turno || "todos");
  const [saving, setSaving] = useState(false);
  const [grade, setGrade] = useState({ w: layout?.grade_largura || 20, h: layout?.grade_altura || 12 });
  const [movendo, setMovendo] = useState(false);
  const gridRef = useRef(null);

  const COLS = grade.w;
  const ROWS = grade.h;

  const handleCellClick = (col, row) => {
    if (movendo && elementoSelecionado) {
      // move elemento para nova posição
      setElementos(prev => prev.map(el =>
        el.id === elementoSelecionado.id ? { ...el, x: col, y: row } : el
      ));
      setMovendo(false);
      return;
    }

    // Verifica se clicou em elemento existente
    const encontrado = elementos.find(el =>
      col >= el.x && col < el.x + (el.largura || 2) &&
      row >= el.y && row < el.y + (el.altura || 2)
    );

    if (encontrado) {
      setElementoSelecionado(encontrado);
      setTipoSelecionado(null);
      return;
    }

    if (!tipoSelecionado) return;

    const tipo = TIPOS.find(t => t.id === tipoSelecionado);
    const novoEl = {
      id: `el_${Date.now()}`,
      tipo: tipoSelecionado,
      label: tipo?.label || tipoSelecionado,
      x: col,
      y: row,
      largura: tipoSelecionado === "esteira" ? 4 : tipoSelecionado === "texto" ? 3 : 2,
      altura: tipoSelecionado === "esteira" ? 1 : 2,
      cor: tipo?.cor || "#0066b1"
    };
    setElementos(prev => [...prev, novoEl]);
    setElementoSelecionado(novoEl);
  };

  const handleDeleteEl = () => {
    if (!elementoSelecionado) return;
    setElementos(prev => prev.filter(el => el.id !== elementoSelecionado.id));
    setElementoSelecionado(null);
  };

  const handleEditLabel = () => {
    if (!elementoSelecionado) return;
    setLabelTemp(elementoSelecionado.label);
    setEditandoLabel(true);
  };

  const handleSaveLabel = () => {
    setElementos(prev => prev.map(el =>
      el.id === elementoSelecionado.id ? { ...el, label: labelTemp } : el
    ));
    setElementoSelecionado(prev => ({ ...prev, label: labelTemp }));
    setEditandoLabel(false);
  };

  const handleSave = async () => {
    if (!nomeLinha || !equipe) return alert("Preencha nome da linha e equipe!");
    setSaving(true);
    const data = {
      nome_linha: nomeLinha,
      equipe,
      turno,
      grade_largura: COLS,
      grade_altura: ROWS,
      elementos,
      criado_por_nome: currentUser?.nome_exibicao || currentUser?.full_name
    };
    if (layout?.id) {
      await base44.entities.LayoutLinha.update(layout.id, data);
    } else {
      await base44.entities.LayoutLinha.create(data);
    }
    setSaving(false);
    onSave();
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        cells.push(
          <div
            key={`${col}-${row}`}
            onClick={() => handleCellClick(col, row)}
            className={`border border-slate-200 transition-colors ${
              tipoSelecionado ? "cursor-crosshair hover:bg-blue-50" :
              movendo ? "cursor-move hover:bg-green-50" :
              "cursor-default"
            }`}
            style={{ width: CELL_SIZE, height: CELL_SIZE, gridColumn: col + 1, gridRow: row + 1 }}
          />
        );
      }
    }
    return cells;
  };

  const getTipoInfo = (tipo) => TIPOS.find(t => t.id === tipo) || TIPOS[0];

  return (
    <div className="space-y-4">
      {/* Config Header */}
      <Card className="border border-slate-200">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Nome da Linha *</Label>
              <Input value={nomeLinha} onChange={e => setNomeLinha(e.target.value)} placeholder="Ex: Linha Parachoque" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Equipe *</Label>
              <Input value={equipe} onChange={e => setEquipe(e.target.value)} placeholder="Ex: Equipe 2" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Turno</Label>
              <select value={turno} onChange={e => setTurno(e.target.value)}
                className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-sm">
                <option value="todos">Todos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0066b1] hover:bg-[#004d82] h-9">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Layout"}
              </Button>
              <Button variant="outline" onClick={onCancel} className="h-9 px-3">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-col xl:flex-row">
        {/* Toolbar de elementos */}
        <Card className="xl:w-56 border border-slate-200 flex-shrink-0">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-slate-700">🧱 Elementos</CardTitle>
            <p className="text-[10px] text-slate-500">Clique para selecionar, depois clique na grade</p>
          </CardHeader>
          <CardContent className="px-3 pb-4 space-y-1">
            {TIPOS.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => { setTipoSelecionado(tipo.id); setElementoSelecionado(null); setMovendo(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                  tipoSelecionado === tipo.id
                    ? "bg-[#0066b1] text-white shadow-md"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="text-base">{tipo.icon}</span>
                <div>
                  <p className="font-semibold text-xs">{tipo.label}</p>
                  <p className={`text-[9px] ${tipoSelecionado === tipo.id ? "text-blue-200" : "text-slate-400"}`}>{tipo.desc}</p>
                </div>
              </button>
            ))}

            <div className="border-t border-slate-200 pt-3 mt-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase px-1">Grade</p>
              <div className="flex gap-2 items-center px-1">
                <span className="text-xs text-slate-600">Cols:</span>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setGrade(g => ({...g, w: Math.max(8, g.w - 2)}))}>
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-xs font-mono w-4 text-center">{COLS}</span>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setGrade(g => ({...g, w: Math.min(30, g.w + 2)}))}>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-2 items-center px-1">
                <span className="text-xs text-slate-600">Rows:</span>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setGrade(g => ({...g, h: Math.max(6, g.h - 2)}))}>
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-xs font-mono w-4 text-center">{ROWS}</span>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setGrade(g => ({...g, h: Math.min(20, g.h + 2)}))}>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="flex-1 space-y-3">
          {/* Element Actions Bar */}
          <AnimatePresence>
            {elementoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <span className="text-xl">{getTipoInfo(elementoSelecionado.tipo).icon}</span>
                {editandoLabel ? (
                  <>
                    <Input value={labelTemp} onChange={e => setLabelTemp(e.target.value)} className="h-7 w-40 text-xs" autoFocus
                      onKeyDown={e => e.key === "Enter" && handleSaveLabel()} />
                    <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-xs" onClick={handleSaveLabel}>✓</Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEditandoLabel(false)}>✕</Button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-sm text-slate-800">{elementoSelecionado.label}</span>
                    <Badge variant="outline" className="text-xs">{getTipoInfo(elementoSelecionado.tipo).label}</Badge>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={handleEditLabel}>
                      <Type className="w-3 h-3 mr-1" /> Renomear
                    </Button>
                    <Button size="sm" variant="outline" className={`h-7 px-2 text-xs ${movendo ? "bg-green-100 border-green-400 text-green-700" : ""}`}
                      onClick={() => setMovendo(m => !m)}>
                      <Move className="w-3 h-3 mr-1" /> {movendo ? "Clique na grade" : "Mover"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteEl}>
                      <Trash2 className="w-3 h-3 mr-1" /> Remover
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs ml-auto" onClick={() => setElementoSelecionado(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status hint */}
          {tipoSelecionado && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <span className="text-base">{getTipoInfo(tipoSelecionado).icon}</span>
              <span>Modo <strong>{getTipoInfo(tipoSelecionado).label}</strong> ativo — clique na grade para posicionar.</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs ml-auto" onClick={() => setTipoSelecionado(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Grid Canvas */}
          <div className="overflow-auto border border-slate-300 rounded-lg bg-white shadow-inner">
            <div
              ref={gridRef}
              className="relative"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                width: COLS * CELL_SIZE,
                height: ROWS * CELL_SIZE,
                backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
              }}
            >
              {renderGrid()}

              {/* Elementos */}
              {elementos.map(el => {
                const tipo = getTipoInfo(el.tipo);
                const isSelected = elementoSelecionado?.id === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={e => {
                      e.stopPropagation();
                      if (movendo && elementoSelecionado) return;
                      setElementoSelecionado(el);
                      setTipoSelecionado(null);
                    }}
                    className={`absolute flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer select-none transition-all z-10 shadow-md ${
                      isSelected ? "ring-2 ring-offset-1 ring-blue-400 scale-105 z-20" : "hover:scale-105"
                    }`}
                    style={{
                      left: el.x * CELL_SIZE + 2,
                      top: el.y * CELL_SIZE + 2,
                      width: (el.largura || 2) * CELL_SIZE - 4,
                      height: (el.altura || 2) * CELL_SIZE - 4,
                      backgroundColor: (el.cor || tipo.cor) + "22",
                      borderColor: el.cor || tipo.cor,
                    }}
                  >
                    <span className="text-lg leading-none">{tipo.icon}</span>
                    <p className="text-[9px] font-bold text-center leading-tight px-1 mt-0.5"
                      style={{ color: el.cor || tipo.cor }}>
                      {el.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            {COLS} × {ROWS} células • {elementos.length} elemento(s) no layout
          </p>
        </div>
      </div>
    </div>
  );
}