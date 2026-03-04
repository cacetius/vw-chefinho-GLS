import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Save, Trash2, Move, Type, X, ChevronLeft, ChevronRight, RotateCcw, Check, ZoomIn, ZoomOut, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TIPOS = [
  { id: "operacao",   label: "Operação",   icon: "🔧", cor: "#0066b1" },
  { id: "armario",    label: "Armário",    icon: "🗄️", cor: "#475569" },
  { id: "bancada",    label: "Bancada",    icon: "🪑", cor: "#92400e" },
  { id: "esteira",    label: "Esteira",    icon: "➡️", cor: "#1e40af" },
  { id: "entrada",    label: "Entrada",    icon: "🚪", cor: "#15803d" },
  { id: "saida",      label: "Saída",      icon: "🏁", cor: "#b91c1c" },
  { id: "qualidade",  label: "Qualidade",  icon: "🔍", cor: "#7e22ce" },
  { id: "ferramenta", label: "Ferramentas", icon: "🔩", cor: "#b45309" },
  { id: "lixeira",    label: "Lixeira",    icon: "♻️", cor: "#166534" },
  { id: "texto",      label: "Texto",      icon: "📝", cor: "#64748b" },
];

const CELL_BASE = 52;

function getTipo(id) { return TIPOS.find(t => t.id === id) || TIPOS[0]; }

export default function LayoutEditor({ layout, onSave, onCancel, currentUser }) {
  const [elementos, setElementos] = useState(layout?.elementos || []);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [elSelecionado, setElSelecionado] = useState(null);
  const [editandoLabel, setEditandoLabel] = useState(false);
  const [labelTemp, setLabelTemp] = useState("");
  const [nomeLinha, setNomeLinha] = useState(layout?.nome_linha || "");
  const [equipe, setEquipe] = useState(layout?.equipe || currentUser?.equipe || "");
  const [turno, setTurno] = useState(layout?.turno || "todos");
  const [saving, setSaving] = useState(false);
  const [grade, setGrade] = useState({ w: layout?.grade_largura || 14, h: layout?.grade_altura || 10 });
  const [movendo, setMovendo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showElementSheet, setShowElementSheet] = useState(false);
  const gridContainerRef = useRef(null);

  const COLS = grade.w;
  const ROWS = grade.h;
  const CELL = Math.round(CELL_BASE * zoom);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setElSelecionado(null); setTipoSelecionado(null); setMovendo(false); }
      if (e.key === "Delete" && elSelecionado) handleDelete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [elSelecionado]);

  const handleCellPointer = useCallback((col, row) => {
    if (movendo && elSelecionado) {
      setElementos(prev => prev.map(el => el.id === elSelecionado.id ? { ...el, x: col, y: row } : el));
      setMovendo(false);
      return;
    }

    const hit = elementos.find(el =>
      col >= el.x && col < el.x + (el.largura || 2) &&
      row >= el.y && row < el.y + (el.altura || 2)
    );
    if (hit) { setElSelecionado(hit); setTipoSelecionado(null); return; }

    if (!tipoSelecionado) { setElSelecionado(null); return; }

    const tipo = getTipo(tipoSelecionado);
    const lw = tipoSelecionado === "esteira" ? 4 : tipoSelecionado === "texto" ? 3 : 2;
    const lh = tipoSelecionado === "esteira" ? 1 : 2;
    const novo = {
      id: `el_${Date.now()}`,
      tipo: tipoSelecionado,
      label: tipo.label,
      x: Math.min(col, COLS - lw),
      y: Math.min(row, ROWS - lh),
      largura: lw, altura: lh, cor: tipo.cor
    };
    setElementos(prev => [...prev, novo]);
    setElSelecionado(novo);
    setShowElementSheet(false);
  }, [movendo, elSelecionado, elementos, tipoSelecionado, COLS, ROWS]);

  const handleDelete = useCallback(() => {
    if (!elSelecionado) return;
    setElementos(prev => prev.filter(el => el.id !== elSelecionado.id));
    setElSelecionado(null);
  }, [elSelecionado]);

  const handleSaveLabel = () => {
    if (!labelTemp.trim()) return;
    setElementos(prev => prev.map(el => el.id === elSelecionado.id ? { ...el, label: labelTemp } : el));
    setElSelecionado(prev => ({ ...prev, label: labelTemp }));
    setEditandoLabel(false);
  };

  const handleSave = async () => {
    if (!nomeLinha.trim() || !equipe.trim()) return alert("Preencha nome da linha e equipe!");
    setSaving(true);
    const data = { nome_linha: nomeLinha, equipe, turno, grade_largura: COLS, grade_altura: ROWS, elementos, criado_por_nome: currentUser?.nome_exibicao || currentUser?.full_name };
    layout?.id
      ? await base44.entities.LayoutLinha.update(layout.id, data)
      : await base44.entities.LayoutLinha.create(data);
    setSaving(false);
    onSave();
  };

  const elAtual = elSelecionado ? elementos.find(e => e.id === elSelecionado.id) || elSelecionado : null;

  return (
    <div className="flex flex-col gap-3 pb-36 md:pb-4">

      {/* ── Config ── */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="col-span-2 md:col-span-1">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase">Nome da Linha *</Label>
              <Input value={nomeLinha} onChange={e => setNomeLinha(e.target.value)} placeholder="Ex: Linha Parachoque" className="h-9 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-slate-500 uppercase">Equipe *</Label>
              <Input value={equipe} onChange={e => setEquipe(e.target.value)} placeholder="Ex: Equipe 2" className="h-9 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-slate-500 uppercase">Turno</Label>
              <select value={turno} onChange={e => setTurno(e.target.value)} className="w-full h-9 mt-1 rounded-md border border-input bg-background px-2 text-sm">
                <option value="todos">Todos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <div className="flex items-end gap-1.5 col-span-2 md:col-span-1">
              <Button onClick={handleSave} disabled={saving} className="flex-1 h-9 bg-[#0066b1] hover:bg-[#004d82] text-sm">
                <Save className="w-4 h-4 mr-1" />{saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={onCancel} className="h-9 w-9 p-0"><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Área principal ── */}
      <div className="flex gap-3 items-start">

        {/* Sidebar Desktop */}
        <div className="hidden md:flex flex-col gap-2 w-44 flex-shrink-0">
          <Card className="border border-slate-200">
            <CardContent className="p-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-0.5">Elementos</p>
              {TIPOS.map(tipo => (
                <button key={tipo.id}
                  onClick={() => { setTipoSelecionado(tipo.id); setElSelecionado(null); setMovendo(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-0.5 transition-all text-left ${
                    tipoSelecionado === tipo.id ? "bg-[#0066b1] text-white" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="text-base">{tipo.icon}</span>
                  <span className="text-xs font-medium">{tipo.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-2.5 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Grade</p>
              {[{ label: "Cols", key: "w", min: 6, max: 30 }, { label: "Rows", key: "h", min: 4, max: 20 }].map(({ label, key, min, max }) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 w-8">{label}:</span>
                  <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    onClick={() => setGrade(g => ({ ...g, [key]: Math.max(min, g[key] - 2) }))}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono w-5 text-center">{grade[key]}</span>
                  <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    onClick={() => setGrade(g => ({ ...g, [key]: Math.min(max, g[key] + 2) }))}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 w-8">Zoom:</span>
                <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                  onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}>
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-mono w-7 text-center">{Math.round(zoom * 100)}%</span>
                <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                  onClick={() => setZoom(z => Math.min(2, +(z + 0.25).toFixed(2)))}>
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => { if(window.confirm("Limpar tudo?")) { setElementos([]); setElSelecionado(null); } }}
                className="w-full py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1 mt-1">
                <RotateCcw className="w-3 h-3" /> Limpar tudo
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Canvas area */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Action bar */}
          <AnimatePresence>
            {elAtual && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex flex-wrap items-center gap-1.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-xl leading-none">{getTipo(elAtual.tipo).icon}</span>
                {editandoLabel ? (
                  <>
                    <Input value={labelTemp} onChange={e => setLabelTemp(e.target.value)} className="h-8 text-sm flex-1 min-w-0 max-w-[180px]" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") handleSaveLabel(); if (e.key === "Escape") setEditandoLabel(false); }} />
                    <Button size="sm" className="h-8 px-3 bg-green-600 text-xs" onClick={handleSaveLabel}><Check className="w-3 h-3 mr-1" />OK</Button>
                    <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setEditandoLabel(false)}><X className="w-3 h-3" /></Button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-sm text-slate-800 truncate max-w-[100px]">{elAtual.label}</span>
                    <div className="flex gap-1 ml-auto flex-wrap">
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs"
                        onClick={() => { setLabelTemp(elAtual.label); setEditandoLabel(true); }}>
                        <Type className="w-3 h-3 md:mr-1" /><span className="hidden md:inline">Renomear</span>
                      </Button>
                      <Button size="sm" variant="outline"
                        className={`h-8 px-2 text-xs ${movendo ? "bg-green-100 border-green-400 text-green-700" : ""}`}
                        onClick={() => setMovendo(m => !m)}>
                        <Move className="w-3 h-3 md:mr-1" /><span className="hidden md:inline">{movendo ? "Clique grade" : "Mover"}</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs text-red-600 hover:bg-red-50" onClick={handleDelete}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setElSelecionado(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints */}
          {tipoSelecionado && !elAtual && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <span>{getTipo(tipoSelecionado).icon}</span>
              <span>Modo <strong>{getTipo(tipoSelecionado).label}</strong> — toque na grade para posicionar</span>
              <button className="ml-auto p-0.5" onClick={() => setTipoSelecionado(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          {movendo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
              <Move className="w-3 h-3" />
              <span>Toque na grade para reposicionar <strong>{elAtual?.label}</strong></span>
              <button className="ml-auto p-0.5" onClick={() => setMovendo(false)}><X className="w-3 h-3" /></button>
            </div>
          )}

          {/* Grid */}
          <div ref={gridContainerRef}
            className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-inner"
            style={{ maxHeight: "58vh", touchAction: tipoSelecionado || movendo ? "none" : "pan-x pan-y" }}>
            <div className="relative"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                width: COLS * CELL, height: ROWS * CELL,
                backgroundImage: "radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)",
                backgroundSize: `${CELL}px ${CELL}px`,
              }}>
              {/* Células clicáveis */}
              {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                const col = idx % COLS, row = Math.floor(idx / COLS);
                return (
                  <div key={idx}
                    onPointerDown={e => { e.preventDefault(); handleCellPointer(col, row); }}
                    className={`border border-slate-100/50 transition-colors ${
                      tipoSelecionado ? "cursor-crosshair active:bg-blue-100" :
                      movendo ? "cursor-move active:bg-green-100" : ""
                    }`}
                    style={{ gridColumn: col + 1, gridRow: row + 1 }}
                  />
                );
              })}

              {/* Elementos renderizados */}
              {elementos.map(el => {
                const tipo = getTipo(el.tipo);
                const isSel = elAtual?.id === el.id;
                return (
                  <div key={el.id}
                    onPointerDown={e => { e.stopPropagation(); if (movendo && elAtual?.id === el.id) return; setElSelecionado(el); setTipoSelecionado(null); }}
                    className={`absolute flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer select-none transition-all z-10
                      ${isSel ? "ring-2 ring-blue-400 ring-offset-1 z-20 shadow-lg scale-[1.02]" : "shadow-md hover:shadow-lg hover:scale-[1.01]"}
                      ${movendo && isSel ? "opacity-50" : ""}
                    `}
                    style={{
                      left: el.x * CELL + 3, top: el.y * CELL + 3,
                      width: (el.largura || 2) * CELL - 6, height: (el.altura || 2) * CELL - 6,
                      backgroundColor: (el.cor || tipo.cor) + "18",
                      borderColor: el.cor || tipo.cor,
                    }}
                  >
                    <span className="text-lg md:text-xl leading-none">{tipo.icon}</span>
                    <p className="text-[9px] md:text-[10px] font-bold text-center px-1 mt-0.5 leading-tight w-full truncate text-center"
                      style={{ color: el.cor || tipo.cor }}>
                      {el.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 px-1">
            <span>{COLS} × {ROWS} células • zoom {Math.round(zoom*100)}%</span>
            <span>{elementos.length} elemento{elementos.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM SHEET ══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <AnimatePresence>
          {showElementSheet && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl pb-safe"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="px-4 pb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Escolha um elemento</p>
                <button onClick={() => setShowElementSheet(false)} className="p-1.5 rounded-lg bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 px-4 pb-4">
                {TIPOS.map(tipo => (
                  <button key={tipo.id}
                    onClick={() => { setTipoSelecionado(tipo.id); setElSelecionado(null); setMovendo(false); setShowElementSheet(false); }}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all active:scale-95 ${
                      tipoSelecionado === tipo.id ? "border-[#0066b1] bg-blue-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl leading-none">{tipo.icon}</span>
                    <span className="text-[9px] font-semibold text-slate-600 mt-1.5 text-center leading-tight">{tipo.label}</span>
                  </button>
                ))}
              </div>

              {/* Grade & zoom */}
              <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium">Grade:</span>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold"
                      onClick={() => setGrade(g => ({...g, w: Math.max(6, g.w - 2)}))}> − </button>
                    <span className="font-mono text-xs">{COLS}</span>
                    <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold"
                      onClick={() => setGrade(g => ({...g, w: Math.min(30, g.w + 2)}))}> + </button>
                    <span className="text-slate-300 mx-1">×</span>
                    <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold"
                      onClick={() => setGrade(g => ({...g, h: Math.max(4, g.h - 2)}))}> − </button>
                    <span className="font-mono text-xs">{ROWS}</span>
                    <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold"
                      onClick={() => setGrade(g => ({...g, h: Math.min(20, g.h + 2)}))}> + </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"
                    onClick={() => setZoom(z => Math.max(0.5, +(z-0.25).toFixed(2)))}><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="font-mono w-8 text-center">{Math.round(zoom*100)}%</span>
                  <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"
                    onClick={() => setZoom(z => Math.min(2, +(z+0.25).toFixed(2)))}><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating action bar always visible on mobile */}
        {!showElementSheet && (
          <div className="bg-white border-t border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <button
              onClick={() => { setShowElementSheet(true); setMovendo(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm active:scale-95 transition-all ${
                tipoSelecionado ? "bg-[#0066b1] text-white border-[#0066b1]" : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {tipoSelecionado ? (
                <><span className="text-lg">{getTipo(tipoSelecionado).icon}</span><span className="text-xs">{getTipo(tipoSelecionado).label} ativo</span></>
              ) : (
                <span className="text-xs">+ Adicionar elemento</span>
              )}
            </button>
            {tipoSelecionado && (
              <button onClick={() => setTipoSelecionado(null)}
                className="p-2.5 rounded-xl border-2 border-slate-200 text-slate-500 active:scale-95">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0066b1] text-white font-semibold active:scale-95 disabled:opacity-60">
              <Save className="w-4 h-4" />
              <span className="text-sm">{saving ? "..." : "Salvar"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}