import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Save, Trash2, Move, Type, X, ChevronLeft, ChevronRight, RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TIPOS = [
  { id: "operacao",   label: "Operação",   icon: "🔧", cor: "#0066b1" },
  { id: "armario",    label: "Armário",    icon: "🗄️", cor: "#475569" },
  { id: "bancada",    label: "Bancada",    icon: "🪑", cor: "#92400e" },
  { id: "esteira",    label: "Esteira",    icon: "➡️", cor: "#1e40af" },
  { id: "entrada",    label: "Entrada",    icon: "🚪", cor: "#15803d" },
  { id: "saida",      label: "Saída",      icon: "🏁", cor: "#b91c1c" },
  { id: "qualidade",  label: "Qualidade",  icon: "🔍", cor: "#7e22ce" },
  { id: "ferramenta", label: "Ferram.",    icon: "🔩", cor: "#b45309" },
  { id: "lixeira",    label: "Lixeira",    icon: "♻️", cor: "#166534" },
  { id: "texto",      label: "Texto",      icon: "📝", cor: "#64748b" },
];

const CELL_BASE = 44; // tamanho base da célula

function getTipoInfo(tipo) {
  return TIPOS.find(t => t.id === tipo) || TIPOS[0];
}

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
  const [grade, setGrade] = useState({ w: layout?.grade_largura || 16, h: layout?.grade_altura || 10 });
  const [movendo, setMovendo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showToolbar, setShowToolbar] = useState(false); // mobile bottom sheet
  const gridRef = useRef(null);
  const COLS = grade.w;
  const ROWS = grade.h;
  const CELL = Math.round(CELL_BASE * zoom);

  // Fecha seleção ao pressionar Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setElementoSelecionado(null); setTipoSelecionado(null); setMovendo(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCellClick = useCallback((col, row) => {
    if (movendo && elementoSelecionado) {
      setElementos(prev => prev.map(el =>
        el.id === elementoSelecionado.id ? { ...el, x: col, y: row } : el
      ));
      setMovendo(false);
      return;
    }

    // Clicou em elemento existente?
    const encontrado = elementos.find(el =>
      col >= el.x && col < el.x + (el.largura || 2) &&
      row >= el.y && row < el.y + (el.altura || 2)
    );
    if (encontrado) {
      setElementoSelecionado(encontrado);
      setTipoSelecionado(null);
      return;
    }

    if (!tipoSelecionado) {
      setElementoSelecionado(null);
      return;
    }

    const tipo = getTipoInfo(tipoSelecionado);
    const novoEl = {
      id: `el_${Date.now()}`,
      tipo: tipoSelecionado,
      label: tipo.label,
      x: Math.min(col, COLS - (tipoSelecionado === "esteira" ? 4 : 2)),
      y: Math.min(row, ROWS - (tipoSelecionado === "esteira" ? 1 : 2)),
      largura: tipoSelecionado === "esteira" ? 4 : tipoSelecionado === "texto" ? 3 : 2,
      altura: tipoSelecionado === "esteira" ? 1 : 2,
      cor: tipo.cor
    };
    setElementos(prev => [...prev, novoEl]);
    setElementoSelecionado(novoEl);
    setShowToolbar(false);
  }, [movendo, elementoSelecionado, elementos, tipoSelecionado, COLS, ROWS]);

  const handleDeleteEl = () => {
    if (!elementoSelecionado) return;
    setElementos(prev => prev.filter(el => el.id !== elementoSelecionado.id));
    setElementoSelecionado(null);
  };

  const handleSaveLabel = () => {
    if (!labelTemp.trim()) return;
    setElementos(prev => prev.map(el =>
      el.id === elementoSelecionado.id ? { ...el, label: labelTemp } : el
    ));
    setElementoSelecionado(prev => ({ ...prev, label: labelTemp }));
    setEditandoLabel(false);
  };

  const handleClearAll = () => {
    if (!window.confirm("Limpar todos os elementos do layout?")) return;
    setElementos([]);
    setElementoSelecionado(null);
  };

  const handleSave = async () => {
    if (!nomeLinha.trim() || !equipe.trim()) return alert("Preencha nome da linha e equipe!");
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

  const elSel = elementoSelecionado ? elementos.find(e => e.id === elementoSelecionado.id) || elementoSelecionado : null;

  return (
    <div className="space-y-3 pb-32 md:pb-6">

      {/* ── Config Card ── */}
      <Card className="border border-slate-200">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="col-span-2 md:col-span-1">
              <Label className="text-[11px] font-semibold text-slate-600">Nome da Linha *</Label>
              <Input value={nomeLinha} onChange={e => setNomeLinha(e.target.value)}
                placeholder="Ex: Linha Parachoque" className="h-9 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-slate-600">Equipe *</Label>
              <Input value={equipe} onChange={e => setEquipe(e.target.value)}
                placeholder="Ex: Equipe 2" className="h-9 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-slate-600">Turno</Label>
              <select value={turno} onChange={e => setTurno(e.target.value)}
                className="w-full h-9 mt-1 rounded-md border border-input bg-background px-2 text-sm">
                <option value="todos">Todos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <div className="flex items-end gap-2 col-span-2 md:col-span-1">
              <Button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#0066b1] hover:bg-[#004d82] h-9 text-sm">
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={onCancel} className="h-9 px-3">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Layout Desktop: sidebar + canvas ── */}
      <div className="flex gap-3">

        {/* Sidebar Desktop (oculto no mobile) */}
        <div className="hidden md:flex flex-col gap-2 w-48 flex-shrink-0">
          <Card className="border border-slate-200">
            <CardContent className="p-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Elementos</p>
              <div className="space-y-0.5">
                {TIPOS.map(tipo => (
                  <button key={tipo.id}
                    onClick={() => { setTipoSelecionado(tipo.id); setElementoSelecionado(null); setMovendo(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                      tipoSelecionado === tipo.id
                        ? "bg-[#0066b1] text-white shadow-sm"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="text-base w-5 text-center">{tipo.icon}</span>
                    <span className="text-xs font-medium">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade controles */}
          <Card className="border border-slate-200">
            <CardContent className="p-3 space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Grade</p>
              {[
                { label: "Colunas", key: "w", min: 8, max: 30 },
                { label: "Linhas", key: "h", min: 4, max: 20 },
              ].map(({ label, key, min, max }) => (
                <div key={key} className="flex items-center justify-between gap-1">
                  <span className="text-xs text-slate-600 w-14">{label}:</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0"
                      onClick={() => setGrade(g => ({ ...g, [key]: Math.max(min, g[key] - 2) }))}>
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-mono w-5 text-center">{grade[key]}</span>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0"
                      onClick={() => setGrade(g => ({ ...g, [key]: Math.min(max, g[key] + 2) }))}>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-1 border-t pt-2 mt-1">
                <span className="text-xs text-slate-600">Zoom:</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0"
                    onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-mono w-7 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0"
                    onClick={() => setZoom(z => Math.min(2, +(z + 0.25).toFixed(2)))}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs h-7 text-red-500 hover:bg-red-50 mt-1"
                onClick={handleClearAll}>
                <RotateCcw className="w-3 h-3 mr-1" /> Limpar tudo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Canvas + action bar */}
        <div className="flex-1 min-w-0 space-y-2">

          {/* Action bar - elemento selecionado */}
          <AnimatePresence>
            {elSel && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex flex-wrap items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-lg">{getTipoInfo(elSel.tipo).icon}</span>
                {editandoLabel ? (
                  <>
                    <Input value={labelTemp} onChange={e => setLabelTemp(e.target.value)}
                      className="h-8 w-36 text-xs flex-1 md:flex-none" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") handleSaveLabel(); if (e.key === "Escape") setEditandoLabel(false); }} />
                    <Button size="sm" className="h-8 px-3 bg-green-600 hover:bg-green-700 text-xs" onClick={handleSaveLabel}>
                      <Check className="w-3 h-3 mr-1" /> OK
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setEditandoLabel(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-sm text-slate-800 truncate max-w-[120px]">{elSel.label}</span>
                    <Badge variant="outline" className="text-[10px] hidden sm:flex">{getTipoInfo(elSel.tipo).label}</Badge>
                    <div className="flex gap-1 ml-auto">
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs"
                        onClick={() => { setLabelTemp(elSel.label); setEditandoLabel(true); }}>
                        <Type className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Renomear</span>
                      </Button>
                      <Button size="sm" variant="outline"
                        className={`h-8 px-2 text-xs ${movendo ? "bg-green-100 border-green-400 text-green-700" : ""}`}
                        onClick={() => setMovendo(m => !m)}>
                        <Move className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">{movendo ? "Clique na grade" : "Mover"}</span>
                      </Button>
                      <Button size="sm" variant="outline"
                        className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={handleDeleteEl}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setElementoSelecionado(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint de modo ativo */}
          {tipoSelecionado && !elSel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <span>{getTipoInfo(tipoSelecionado).icon}</span>
              <span>Modo <strong>{getTipoInfo(tipoSelecionado).label}</strong> — toque na grade para posicionar</span>
              <Button size="sm" variant="ghost" className="h-6 px-1 ml-auto" onClick={() => setTipoSelecionado(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {movendo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
              <Move className="w-3 h-3" />
              <span>Toque na grade para mover <strong>{elSel?.label}</strong></span>
              <Button size="sm" variant="ghost" className="h-6 px-1 ml-auto" onClick={() => setMovendo(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* ── Grade ── */}
          <div className="overflow-auto rounded-lg border border-slate-300 bg-white shadow-inner touch-pan-x touch-pan-y"
            style={{ maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>
            <div ref={gridRef} className="relative select-none"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                width: COLS * CELL,
                height: ROWS * CELL,
                backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                backgroundSize: `${CELL}px ${CELL}px`,
              }}
            >
              {/* células clicáveis */}
              {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                const col = idx % COLS;
                const row = Math.floor(idx / COLS);
                return (
                  <div key={idx}
                    onPointerDown={() => handleCellClick(col, row)}
                    className={`border border-slate-100/60 transition-colors ${
                      tipoSelecionado ? "cursor-crosshair active:bg-blue-100" :
                      movendo ? "cursor-move active:bg-green-100" : "cursor-default"
                    }`}
                    style={{ gridColumn: col + 1, gridRow: row + 1 }}
                  />
                );
              })}

              {/* elementos */}
              {elementos.map(el => {
                const tipo = getTipoInfo(el.tipo);
                const isSel = elSel?.id === el.id;
                const isMoving = isSel && movendo;
                return (
                  <div key={el.id}
                    onPointerDown={e => {
                      e.stopPropagation();
                      if (movendo && elSel?.id === el.id) return;
                      setElementoSelecionado(el);
                      setTipoSelecionado(null);
                    }}
                    className={`absolute flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all z-10
                      ${isSel ? "ring-2 ring-blue-400 ring-offset-1 z-20 shadow-lg" : "shadow-md"}
                      ${isMoving ? "opacity-60 scale-95" : ""}
                    `}
                    style={{
                      left: el.x * CELL + 3,
                      top: el.y * CELL + 3,
                      width: (el.largura || 2) * CELL - 6,
                      height: (el.altura || 2) * CELL - 6,
                      backgroundColor: (el.cor || tipo.cor) + "20",
                      borderColor: el.cor || tipo.cor,
                    }}
                  >
                    <span className="text-base md:text-lg leading-none">{tipo.icon}</span>
                    <p className="text-[8px] md:text-[10px] font-bold text-center leading-tight px-0.5 mt-0.5 truncate w-full text-center"
                      style={{ color: el.cor || tipo.cor }}>
                      {el.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 px-1">
            <span>{COLS} × {ROWS} células</span>
            <span>{elementos.length} elemento{elementos.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-xl">
        {/* Toolbar expandida */}
        <AnimatePresence>
          {showToolbar && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-200 bg-slate-50">
              <div className="p-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Selecione um elemento</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIPOS.map(tipo => (
                    <button key={tipo.id}
                      onClick={() => { setTipoSelecionado(tipo.id); setElementoSelecionado(null); setMovendo(false); setShowToolbar(false); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95 ${
                        tipoSelecionado === tipo.id
                          ? "border-[#0066b1] bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="text-xl leading-none">{tipo.icon}</span>
                      <span className="text-[9px] font-medium text-slate-600 mt-1 leading-tight text-center">{tipo.label}</span>
                    </button>
                  ))}
                </div>

                {/* Grade e zoom no mobile */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Grade:</span>
                    <button className="px-1.5 py-0.5 bg-slate-200 rounded" onClick={() => setGrade(g => ({...g, w: Math.max(8, g.w - 2)}))}>-C</button>
                    <span className="font-mono">{COLS}×{ROWS}</span>
                    <button className="px-1.5 py-0.5 bg-slate-200 rounded" onClick={() => setGrade(g => ({...g, w: Math.min(30, g.w + 2)}))}>+C</button>
                    <button className="px-1.5 py-0.5 bg-slate-200 rounded ml-1" onClick={() => setGrade(g => ({...g, h: Math.max(4, g.h - 2)}))}>-L</button>
                    <button className="px-1.5 py-0.5 bg-slate-200 rounded" onClick={() => setGrade(g => ({...g, h: Math.min(20, g.h + 2)}))}>+L</button>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <button className="px-2 py-0.5 bg-slate-200 rounded" onClick={() => setZoom(z => Math.max(0.5, +(z-0.25).toFixed(2)))}>−</button>
                    <span className="font-mono">{Math.round(zoom*100)}%</span>
                    <button className="px-2 py-0.5 bg-slate-200 rounded" onClick={() => setZoom(z => Math.min(2, +(z+0.25).toFixed(2)))}>+</button>
                  </div>
                </div>

                <button className="w-full mt-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1"
                  onClick={() => { handleClearAll(); setShowToolbar(false); }}>
                  <RotateCcw className="w-3 h-3" /> Limpar tudo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom action bar */}
        <div className="flex items-center gap-2 p-2.5 safe-area-inset-bottom">
          <button
            onClick={() => setShowToolbar(t => !t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${
              showToolbar || tipoSelecionado
                ? "bg-[#0066b1] text-white border-[#0066b1]"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            {tipoSelecionado ? (
              <>
                <span>{getTipoInfo(tipoSelecionado).icon}</span>
                <span className="text-xs">{getTipoInfo(tipoSelecionado).label} ativo</span>
              </>
            ) : (
              <span className="text-xs">+ Adicionar elemento</span>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#0066b1] text-white font-semibold text-sm active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs">{saving ? "..." : "Salvar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}