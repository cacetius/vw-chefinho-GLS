import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import CalendarioRosca from "../components/objetivos/CalendarioRosca";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Check, X, Plus, Trash2, Download, FileSpreadsheet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OBJ_DIARIOS_KEY = "objetivos-diarios-config";
const OBJ_SEMANAIS_KEY = "objetivos-semanais-config";
const INFO_KEY = "objetivos-info-config";

const OBJ_DIARIOS_PADRAO = [
  { id: 1, titulo: "Acidentes", descricao: '"0" acidentes com afastamentos', subdescricao: "" },
  { id: 2, titulo: "Qualidade", descricao: "4 D/1000 por turno — ZP6", subdescricao: "FisEQS-Q3 Dinâmico-ZP6-PCH-FRC-EQ2" },
  { id: 3, titulo: "100% Cumprimento Programa de produção", descricao: "Volume conforme Programa de Produção P2", subdescricao: "" },
  { id: 4, titulo: "Retrabalhos / Peças NOK", descricao: "1.1 D/1000 por Turno — ZP8", subdescricao: "FisEQS-Q3Dinâmico-RODAGEM-PCH-FRC ESPECIFICADO-EQ3" },
  { id: 5, titulo: "Verificação do Trabalho Padronizado", descricao: "1 operação por Turno", subdescricao: "" },
];

const OBJ_SEMANAIS_PADRAO = [
  { id: 1, titulo: "Andamento das reuniões do time", meta: "1 por semana" },
  { id: 2, titulo: '"6 S"', meta: "1 por semana" },
  { id: 3, titulo: "Rotatividade da Equipe - Conforme Planejamento?", meta: "Semanal" },
];

export default function ObjetivosMes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [registros, setRegistros] = useState({});
  const [mesAtual] = useState(new Date());
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const mesNome = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });

  // Dados editáveis
  const [infoArea, setInfoArea] = useState({ lider: "", centroCusto: "3338", equipe: "", turno: "" });
  const [objDiarios, setObjDiarios] = useState(OBJ_DIARIOS_PADRAO);
  const [objSemanais, setObjSemanais] = useState(OBJ_SEMANAIS_PADRAO);

  // Estados de edição
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemp, setInfoTemp] = useState(null);
  const [editandoDiarios, setEditandoDiarios] = useState(false);
  const [diariosTemp, setDiariosTemp] = useState([]);
  const [editandoSemanais, setEditandoSemanais] = useState(false);
  const [semanaisTemp, setSemanaisTemp] = useState([]);

  const pageRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setInfoArea(prev => ({
        ...prev,
        lider: u?.full_name || "",
        equipe: u?.equipe || "",
        turno: u?.turno === "manha" ? "1º" : u?.turno === "tarde" ? "2º" : u?.turno === "noite" ? "3º" : ""
      }));
    });
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    carregarRegistros();
    // Carregar configurações salvas
    const configs = await base44.entities.AtividadeLogistica.filter({ setor: "objetivos-config" });
    configs.forEach(c => {
      if (!c.descricao) return;
      try {
        const d = JSON.parse(c.descricao);
        if (d._info) setInfoArea(prev => ({ ...prev, ...d._info }));
        if (d._diarios) setObjDiarios(d._diarios);
        if (d._semanais) setObjSemanais(d._semanais);
      } catch {}
    });
  };

  const carregarRegistros = async () => {
    const objetivos = await base44.entities.Objetivo.list("-data_referencia");
    const mapa = {};
    objetivos.forEach(o => {
      if (o.tipo === "diario" && o.data_referencia) {
        const dia = new Date(o.data_referencia).getDate();
        if (!mapa[dia]) mapa[dia] = [];
        mapa[dia].push(o);
      }
    });
    setRegistros(mapa);
  };

  const salvarConfig = async (key, payload) => {
    const existentes = await base44.entities.AtividadeLogistica.filter({ setor: "objetivos-config", titulo: key });
    const dados = { titulo: key, setor: "objetivos-config", responsavel: "sistema", descricao: JSON.stringify(payload) };
    if (existentes.length > 0) await base44.entities.AtividadeLogistica.update(existentes[0].id, dados);
    else await base44.entities.AtividadeLogistica.create(dados);
  };

  async function handleMarcarDia(dia, novoStatus) {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const dataRef = format(new Date(ano, mes, dia), "yyyy-MM-dd");
    const existentes = await base44.entities.Objetivo.filter({ tipo: "diario", data_referencia: dataRef });
    if (existentes.length > 0) {
      await base44.entities.Objetivo.update(existentes[0].id, { concluido: novoStatus === "concluido" });
    } else {
      await base44.entities.Objetivo.create({
        titulo: `Dia ${dia}`, tipo: "diario", categoria: "producao",
        data_referencia: dataRef, concluido: novoStatus === "concluido",
      });
    }
    carregarRegistros();
  }

  // ── Estatísticas para o centro da rosca ──────────────────────────────────
  const hoje = new Date().getDate();
  const diasPassados = Array.from({ length: hoje }, (_, i) => i + 1);
  const diasAtingidos = diasPassados.filter(d => {
    const objs = registros[d];
    if (!objs || objs.length === 0) return false;
    return objs.every(o => o.concluido);
  }).length;
  const pct = diasPassados.length > 0 ? Math.round((diasAtingidos / diasPassados.length) * 100) : 0;

  // ── Export PDF ────────────────────────────────────────────────────────────
  const exportarPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.width;

    // Header azul
    doc.setFillColor(13, 45, 107);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("Objetivos do Mês", pageW / 2, 10, { align: "center" });
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(mesNome.charAt(0).toUpperCase() + mesNome.slice(1), pageW / 2, 17, { align: "center" });

    // Info da área
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    let y = 28;
    const col = pageW / 4;
    [
      ["Líder da área", infoArea.lider || "—"],
      ["Centro de Custo", infoArea.centroCusto || "—"],
      ["Time / Equipe", infoArea.equipe || "—"],
      ["Turno", infoArea.turno || "—"],
    ].forEach(([label, val], i) => {
      const x = 10 + i * col;
      doc.setFont(undefined, "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(label, x, y);
      doc.setFont(undefined, "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(val, x, y + 5);
    });

    // Objetivos Diários
    y = 46;
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y, pageW - 20, 7, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("Objetivos Diários", 14, y + 5);
    y += 10;

    objDiarios.forEach((o, i) => {
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${o.titulo}`, 14, y);
      y += 5;
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`   ${o.descricao}`, 14, y);
      y += 4;
      if (o.subdescricao) {
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.text(`   ${o.subdescricao}`, 14, y);
        y += 4;
      }
      y += 2;
    });

    // Objetivos Semanais
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y, pageW - 20, 7, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("Objetivos Semanais", 14, y + 5);
    y += 10;

    objSemanais.forEach((o, i) => {
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${o.titulo}`, 14, y);
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Meta: ${o.meta}`, pageW - 50, y);
      y += 7;
    });

    y += 4;

    // Tabela dos dias do mês (status)
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y, pageW - 20, 7, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("Calendário de Acompanhamento", 14, y + 5);
    y += 10;

    // Grid 7 colunas
    const cellW = (pageW - 20) / 7;
    const cellH = 8;
    const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
    dias.forEach((dia, idx) => {
      const col2 = idx % 7;
      const row = Math.floor(idx / 7);
      const cx = 10 + col2 * cellW;
      const cy = y + row * cellH;
      const objs = registros[dia];
      const status = objs && objs.length > 0 ? (objs.every(o => o.concluido) ? "concluido" : "nao_atingido") : null;
      if (status === "concluido") doc.setFillColor(34, 197, 94);
      else if (status === "nao_atingido") doc.setFillColor(248, 113, 113);
      else doc.setFillColor(248, 250, 252);
      doc.rect(cx, cy, cellW - 1, cellH - 1, "F");
      doc.setDrawColor(200, 200, 200);
      doc.rect(cx, cy, cellW - 1, cellH - 1, "S");
      doc.setFontSize(7);
      doc.setTextColor(status ? 255 : 100, status ? 255 : 100, status ? 255 : 100);
      doc.text(`${dia}`, cx + cellW / 2 - 1, cy + cellH / 2 + 1, { align: "center" });
    });

    const rows = Math.ceil(diasNoMes / 7);
    y += rows * cellH + 8;

    // Legenda
    const legendItems = [
      { color: [34, 197, 94], label: "Atingido" },
      { color: [248, 113, 113], label: "Não Atingido" },
      { color: [248, 250, 252], label: "Sem registro" },
    ];
    let lx = 14;
    legendItems.forEach(({ color, label }) => {
      doc.setFillColor(...color);
      doc.rect(lx, y, 5, 4, "F");
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text(label, lx + 6, y + 3.5);
      lx += 35;
    });

    // Rodapé
    const pageH = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Creation date: ${format(mesAtual, "dd.MM.yy")} | Responsible department: 8-OTM-4 | CSD-Class: 0.0 – INTERNAL`, pageW / 2, pageH - 6, { align: "center" });

    doc.save(`objetivos-${format(mesAtual, "yyyy-MM")}.pdf`);
  };

  // ── Export Excel (CSV) ────────────────────────────────────────────────────
  const exportarExcel = () => {
    const linhas = [];
    linhas.push(["Objetivos do Mês", mesNome]);
    linhas.push([]);
    linhas.push(["Líder", infoArea.lider, "Centro de Custo", infoArea.centroCusto, "Time", infoArea.equipe, "Turno", infoArea.turno]);
    linhas.push([]);
    linhas.push(["# ", "OBJETIVO DIÁRIO", "DESCRIÇÃO", "REFERÊNCIA"]);
    objDiarios.forEach((o, i) => linhas.push([i + 1, o.titulo, o.descricao, o.subdescricao || ""]));
    linhas.push([]);
    linhas.push(["# ", "OBJETIVO SEMANAL", "META"]);
    objSemanais.forEach((o, i) => linhas.push([i + 1, o.titulo, o.meta]));
    linhas.push([]);
    linhas.push(["DIA", "STATUS"]);
    Array.from({ length: diasNoMes }, (_, i) => i + 1).forEach(dia => {
      const objs = registros[dia];
      const status = !objs || objs.length === 0 ? "Sem registro"
        : objs.every(o => o.concluido) ? "Atingido" : "Não Atingido";
      linhas.push([dia, status]);
    });

    const csvContent = linhas.map(l => l.map(c => `"${c ?? ""}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `objetivos-${format(mesAtual, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" ref={pageRef}>
      {/* Título */}
      <div className="bg-[#0d2d6b] rounded-xl py-4 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white tracking-wide">Objetivos do mês</h1>
            <p className="text-blue-200 text-sm mt-1 capitalize">{mesNome}</p>
          </div>
          <div className="flex gap-2 justify-center md:justify-end">
            <Button size="sm" onClick={exportarPDF} className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button size="sm" onClick={exportarExcel} className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Cabeçalho informativo editável */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Informações da Área</span>
          <button
            onClick={() => { setInfoTemp({ ...infoArea }); setEditandoInfo(true); }}
            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800"
          >
            <Settings className="w-3 h-3" /> Editar
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
          <InfoCell label="Líder da área" value={infoArea.lider || "—"} />
          <InfoCell label="Centro de Custo" value={infoArea.centroCusto || "—"} />
          <InfoCell label="Time / Equipe" value={infoArea.equipe || "—"} />
          <InfoCell label="Turno" value={infoArea.turno || "—"} />
        </div>
      </div>

      {/* Modal editar info */}
      {editandoInfo && infoTemp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditandoInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800">Editar Informações</p>
              <button onClick={() => setEditandoInfo(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                ["Líder da área", "lider"],
                ["Centro de Custo", "centroCusto"],
                ["Time / Equipe", "equipe"],
                ["Turno", "turno"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label>
                  <input
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={infoTemp[key]}
                    onChange={e => setInfoTemp(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => {
                setInfoArea(infoTemp);
                await salvarConfig(INFO_KEY, { _info: infoTemp });
                setEditandoInfo(false);
              }}>Salvar</Button>
              <Button variant="outline" onClick={() => setEditandoInfo(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Corpo principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-3">
          {/* Objetivos Diários */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#2563eb] px-4 py-2 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Objetivos diários</h2>
              <button
                onClick={() => { setDiariosTemp(objDiarios.map(o => ({ ...o }))); setEditandoDiarios(true); }}
                className="text-blue-200 hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {objDiarios.map((o, i) => (
                <div key={o.id}>
                  <p className="font-bold text-slate-800">{i + 1}. {o.titulo}</p>
                  <p className="text-slate-600 pl-3">{o.descricao}</p>
                  {o.subdescricao && <p className="text-slate-400 pl-3 text-[10px]">{o.subdescricao}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Objetivos Semanais */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#2563eb] px-4 py-2 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Objetivos Semanais</h2>
              <button
                onClick={() => { setSemanaisTemp(objSemanais.map(o => ({ ...o }))); setEditandoSemanais(true); }}
                className="text-blue-200 hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {objSemanais.map((o, i) => (
                <div key={o.id} className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-700">{i + 1}. {o.titulo}</p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{o.meta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
            <p className="text-[10px] font-semibold text-slate-500 mb-2">Legenda:</p>
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
              <div className="flex items-center gap-1"><div className="w-5 h-3 bg-green-500 rounded-sm" /><span>Objetivo Atingido</span></div>
              <div className="flex items-center gap-1"><div className="w-5 h-3 bg-red-400 rounded-sm" /><span>Não Atingido / Acidente</span></div>
              <div className="flex items-center gap-1"><div className="w-5 h-3 border border-slate-300 rounded-sm" /><span>Sem registro</span></div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Calendário Rosca */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-4 gap-3">
          <CalendarioRosca
            registros={registros}
            diasNoMes={diasNoMes}
            mesAtual={mesAtual}
            onDiaClick={handleMarcarDia}
          />
          <div className="w-full bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 font-semibold">Performance do Mês</p>
            <p className="text-2xl font-black text-[#0066b1]">{pct}%</p>
            <p className="text-[10px] text-slate-400">{diasAtingidos} de {diasPassados.length} dias atingidos</p>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Toque no dia para marcar o status</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-[10px] text-slate-400 text-center pb-2">
        Creation date: {format(mesAtual, "dd.MM.yy")} | Responsible department for filing: 8-OTM-4 | CSD-Class: 0.0 – INTERNAL
      </div>

      {/* Modal editar objetivos diários */}
      {editandoDiarios && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditandoDiarios(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800">Editar Objetivos Diários</p>
              <button onClick={() => setEditandoDiarios(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {diariosTemp.map((o, idx) => (
                <div key={o.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 w-5">{idx + 1}</span>
                    <input
                      className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                      placeholder="Título"
                      value={o.titulo}
                      onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, titulo: e.target.value } : x))}
                    />
                    <button onClick={() => setDiariosTemp(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    placeholder="Descrição"
                    value={o.descricao}
                    onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, descricao: e.target.value } : x))}
                  />
                  <input
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-500"
                    placeholder="Sub-descrição (opcional)"
                    value={o.subdescricao || ""}
                    onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, subdescricao: e.target.value } : x))}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setDiariosTemp(prev => [...prev, { id: Date.now(), titulo: "", descricao: "", subdescricao: "" }])}
              className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar objetivo
            </button>
            <div className="flex gap-2 mt-4 border-t border-slate-100 pt-3">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => {
                setObjDiarios(diariosTemp);
                await salvarConfig(OBJ_DIARIOS_KEY, { _diarios: diariosTemp });
                setEditandoDiarios(false);
              }}>
                <Check className="w-3.5 h-3.5 mr-1" /> Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditandoDiarios(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar objetivos semanais */}
      {editandoSemanais && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditandoSemanais(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800">Editar Objetivos Semanais</p>
              <button onClick={() => setEditandoSemanais(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {semanaisTemp.map((o, idx) => (
                <div key={o.id} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 w-5">{idx + 1}</span>
                  <input
                    className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    placeholder="Título"
                    value={o.titulo}
                    onChange={e => setSemanaisTemp(prev => prev.map((x, i) => i === idx ? { ...x, titulo: e.target.value } : x))}
                  />
                  <input
                    className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    placeholder="Meta"
                    value={o.meta}
                    onChange={e => setSemanaisTemp(prev => prev.map((x, i) => i === idx ? { ...x, meta: e.target.value } : x))}
                  />
                  <button onClick={() => setSemanaisTemp(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSemanaisTemp(prev => [...prev, { id: Date.now(), titulo: "", meta: "" }])}
              className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar objetivo
            </button>
            <div className="flex gap-2 mt-4 border-t border-slate-100 pt-3">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => {
                setObjSemanais(semanaisTemp);
                await salvarConfig(OBJ_SEMANAIS_KEY, { _semanais: semanaisTemp });
                setEditandoSemanais(false);
              }}>
                <Check className="w-3.5 h-3.5 mr-1" /> Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditandoSemanais(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="px-3 py-2">
      <p className="text-slate-400 text-[10px]">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}