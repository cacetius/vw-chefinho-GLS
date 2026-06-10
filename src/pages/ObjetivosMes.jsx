import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Check, X, Plus, Trash2, Download, FileSpreadsheet, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OBJ_DIARIOS_KEY = "objetivos-diarios-config";
const OBJ_SEMANAIS_KEY = "objetivos-semanais-config";
const INFO_KEY = "objetivos-info-config";

const OBJ_DIARIOS_PADRAO = [
  { id: 1, titulo: "Acidentes", descricao: '"0" acidentes com afastamentos', meta: "0" },
  { id: 2, titulo: "Qualidade", descricao: "4 D/1000 por turno — ZP6", meta: "4 D/1000" },
  { id: 3, titulo: "Prod. 100%", descricao: "Volume conforme Programa P2", meta: "100%" },
  { id: 4, titulo: "Retrabalhos", descricao: "1.1 D/1000 por Turno — ZP8", meta: "1.1 D/1000" },
  { id: 5, titulo: "TP Verificação", descricao: "1 operação por Turno", meta: "1/turno" },
];

const OBJ_SEMANAIS_PADRAO = [
  { id: 1, titulo: "Reuniões do time", meta: "1 por semana" },
  { id: 2, titulo: '"6 S"', meta: "1 por semana" },
  { id: 3, titulo: "Rotatividade", meta: "Semanal" },
];

const STATUS_COLORS = {
  concluido: { bg: "bg-green-500", text: "text-white", label: "✓" },
  nao_atingido: { bg: "bg-red-500", text: "text-white", label: "✗" },
  feriado: { bg: "bg-slate-300", text: "text-slate-600", label: "F" },
  null: { bg: "bg-white", text: "text-slate-300", label: "" },
};

export default function ObjetivosMes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [registros, setRegistros] = useState({});
  const [mesAtual] = useState(new Date());
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const mesNome = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const [infoArea, setInfoArea] = useState({ lider: "", centroCusto: "3338", equipe: "", turno: "" });
  const [objDiarios, setObjDiarios] = useState(OBJ_DIARIOS_PADRAO);
  const [objSemanais, setObjSemanais] = useState(OBJ_SEMANAIS_PADRAO);

  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemp, setInfoTemp] = useState(null);
  const [editandoDiarios, setEditandoDiarios] = useState(false);
  const [diariosTemp, setDiariosTemp] = useState([]);
  const [editandoSemanais, setEditandoSemanais] = useState(false);
  const [semanaisTemp, setSemanaisTemp] = useState([]);
  const [popupDia, setPopupDia] = useState(null); // { dia, objId, x, y }

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setInfoArea(prev => ({
        ...prev,
        lider: u?.nome_exibicao || u?.full_name || "",
        equipe: u?.equipe || "",
        turno: u?.turno === "manha" ? "1º" : u?.turno === "tarde" ? "2º" : u?.turno === "noite" ? "3º" : ""
      }));
    });
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    carregarRegistros();
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
      if (o.data_referencia) {
        const dia = parseInt(o.data_referencia.split("-")[2]);
        const objId = o.objetivo_id || "geral";
        const key = `${dia}-${objId}`;
        mapa[key] = o.concluido ? "concluido" : o.status_especial || "nao_atingido";
      }
    });
    setRegistros(mapa);
  };

  // Status do dia para um objetivo específico
  const getStatus = (dia, objId) => {
    return registros[`${dia}-${objId}`] || null;
  };

  // Status geral do dia (para linha de resumo)
  const getDiaGeral = (dia) => {
    const statuses = objDiarios.map(o => getStatus(dia, o.id));
    if (statuses.some(s => s === "nao_atingido")) return "nao_atingido";
    if (statuses.every(s => s === "concluido")) return "concluido";
    if (statuses.some(s => s === "feriado")) return "feriado";
    return null;
  };

  const handleCellClick = (dia, objId, e) => {
    const hoje = new Date().getDate();
    setPopupDia({ dia, objId, x: Math.min(e.clientX, window.innerWidth - 180), y: Math.min(e.clientY, window.innerHeight - 160) });
  };

  const handleMarcar = async (status) => {
    if (!popupDia) return;
    const { dia, objId } = popupDia;
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const dataRef = format(new Date(ano, mes, dia), "yyyy-MM-dd");

    const existentes = await base44.entities.Objetivo.filter({ tipo: "diario", data_referencia: dataRef });
    const existente = existentes.find(o => (o.objetivo_id || "geral") === String(objId));

    if (status === null) {
      if (existente) await base44.entities.Objetivo.delete(existente.id);
    } else if (existente) {
      await base44.entities.Objetivo.update(existente.id, {
        concluido: status === "concluido",
        status_especial: status === "feriado" ? "feriado" : null
      });
    } else {
      await base44.entities.Objetivo.create({
        titulo: `Dia ${dia}`, tipo: "diario", categoria: "producao",
        data_referencia: dataRef, objetivo_id: String(objId),
        concluido: status === "concluido",
        status_especial: status === "feriado" ? "feriado" : null,
        equipe: currentUser?.equipe
      });
    }
    setPopupDia(null);
    carregarRegistros();
  };

  const salvarConfig = async (key, payload) => {
    const existentes = await base44.entities.AtividadeLogistica.filter({ setor: "objetivos-config", titulo: key });
    const dados = { titulo: key, setor: "objetivos-config", responsavel: "sistema", descricao: JSON.stringify(payload) };
    if (existentes.length > 0) await base44.entities.AtividadeLogistica.update(existentes[0].id, dados);
    else await base44.entities.AtividadeLogistica.create(dados);
  };

  // Estatísticas
  const hoje = new Date().getDate();
  const diasPassados = diasArray.filter(d => d <= hoje);
  const diasAtingidos = diasPassados.filter(d => getDiaGeral(d) === "concluido").length;
  const pct = diasPassados.length > 0 ? Math.round((diasAtingidos / diasPassados.length) * 100) : 0;

  // Dias da semana abreviados
  const DIAS_ABR = ["D", "S", "T", "Q", "Q", "S", "S"];
  function getDiaSemana(dia) {
    return new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia).getDay();
  }

  // Export PDF — tabela real tipo VW
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageW = doc.internal.pageSize.width;

    // Cabeçalho azul
    doc.setFillColor(13, 45, 107);
    doc.rect(0, 0, pageW, 20, "F");
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont(undefined, "bold");
    doc.text("Objetivos do Mês", pageW / 2, 9, { align: "center" });
    doc.setFontSize(9); doc.setFont(undefined, "normal");
    doc.text(`${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} | Líder: ${infoArea.lider} | Equipe: ${infoArea.equipe} | Turno: ${infoArea.turno} | CC: ${infoArea.centroCusto}`, pageW / 2, 16, { align: "center" });

    // Tabela de objetivos diários com dias nas colunas
    const head = [["Objetivo / Meta", ...diasArray.map(d => {
      const ds = getDiaSemana(d);
      return `${DIAS_ABR[ds]}\n${d}`;
    })]];

    const body = [
      ...objDiarios.map(obj => [
        `${obj.titulo}\n${obj.meta || ""}`,
        ...diasArray.map(dia => {
          const ds = getDiaSemana(dia);
          if (ds === 0 || ds === 6) return "—";
          const s = getStatus(dia, obj.id);
          return s === "concluido" ? "✓" : s === "nao_atingido" ? "✗" : s === "feriado" ? "F" : "";
        })
      ]),
      // Linha de resumo
      ["RESUMO DO DIA", ...diasArray.map(dia => {
        const ds = getDiaSemana(dia);
        if (ds === 0 || ds === 6) return "—";
        const s = getDiaGeral(dia);
        return s === "concluido" ? "✓" : s === "nao_atingido" ? "✗" : "";
      })]
    ];

    autoTable(doc, {
      head, body, startY: 24,
      styles: { fontSize: 6, cellPadding: 1.5, halign: "center", lineColor: [180, 180, 180], lineWidth: 0.2 },
      headStyles: { fillColor: [13, 45, 107], textColor: 255, fontSize: 7, fontStyle: "bold" },
      columnStyles: { 0: { halign: "left", cellWidth: 38, fontStyle: "bold" } },
      didParseCell: (data) => {
        if (data.section !== "body" || data.column.index === 0) return;
        const dia = data.column.index;
        const ds = getDiaSemana(dia);
        if (ds === 0 || ds === 6) { data.cell.styles.fillColor = [220, 220, 220]; return; }
        const isResumo = data.row.index === objDiarios.length;
        const objId = !isResumo ? objDiarios[data.row.index]?.id : null;
        const s = isResumo ? getDiaGeral(dia) : getStatus(dia, objId);
        if (s === "concluido") data.cell.styles.fillColor = [34, 197, 94];
        else if (s === "nao_atingido") data.cell.styles.fillColor = [239, 68, 68];
        else if (s === "feriado") data.cell.styles.fillColor = [203, 213, 225];
        if (s === "concluido" || s === "nao_atingido") data.cell.styles.textColor = [255, 255, 255];
      }
    });

    let y = doc.lastAutoTable.finalY + 8;

    // Objetivos semanais
    doc.setFontSize(8); doc.setTextColor(13, 45, 107); doc.setFont(undefined, "bold");
    doc.text("Objetivos Semanais", 14, y);
    y += 5;
    objSemanais.forEach((o, i) => {
      doc.setFontSize(7); doc.setFont(undefined, "normal"); doc.setTextColor(40, 40, 40);
      doc.text(`${i + 1}. ${o.titulo}  —  Meta: ${o.meta}`, 16, y);
      y += 5;
    });

    y += 4;
    // Legenda
    const leg = [{ c: [34, 197, 94], l: "Atingido" }, { c: [239, 68, 68], l: "Não Atingido" }, { c: [203, 213, 225], l: "Feriado/FDS" }];
    let lx = 14;
    leg.forEach(({ c, l }) => {
      doc.setFillColor(...c); doc.rect(lx, y, 5, 4, "F");
      doc.setFontSize(7); doc.setTextColor(60, 60, 60); doc.text(l, lx + 6, y + 3.5);
      lx += 40;
    });

    const pH = doc.internal.pageSize.height;
    doc.setFontSize(6); doc.setTextColor(160, 160, 160);
    doc.text(`Creation date: ${format(mesAtual, "dd.MM.yy")} | Responsible department: 8-OTM-4 | CSD-Class: 0.0 – INTERNAL`, pageW / 2, pH - 5, { align: "center" });

    doc.save(`objetivos-${format(mesAtual, "yyyy-MM")}.pdf`);
  };

  const exportarExcel = () => {
    const linhas = [
      ["Objetivos do Mês", mesNome],
      [],
      ["Líder", infoArea.lider, "CC", infoArea.centroCusto, "Time", infoArea.equipe, "Turno", infoArea.turno],
      [],
      ["Objetivo / Meta", ...diasArray.map(d => `${DIAS_ABR[getDiaSemana(d)]} ${d}`)],
      ...objDiarios.map(obj => [
        `${obj.titulo} — ${obj.meta || ""}`,
        ...diasArray.map(dia => {
          const s = getStatus(dia, obj.id);
          return s === "concluido" ? "✓" : s === "nao_atingido" ? "✗" : s === "feriado" ? "F" : "";
        })
      ]),
      ["RESUMO", ...diasArray.map(dia => {
        const s = getDiaGeral(dia);
        return s === "concluido" ? "✓" : s === "nao_atingido" ? "✗" : "";
      })],
    ];
    const csv = linhas.map(l => l.map(c => `"${c ?? ""}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `objetivos-${format(mesAtual, "yyyy-MM")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#0d2d6b] rounded-xl py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-white">Objetivos do mês</h1>
            <p className="text-blue-200 text-xs capitalize">{mesNome}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={exportarPDF} className="bg-red-600 hover:bg-red-700 text-white gap-1 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button size="sm" onClick={exportarExcel} className="bg-green-600 hover:bg-green-700 text-white gap-1 text-xs h-8">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Informações da área */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Informações da Área</span>
          <button onClick={() => { setInfoTemp({ ...infoArea }); setEditandoInfo(true); }} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800">
            <Settings className="w-3 h-3" /> Editar
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 text-xs">
          <InfoCell label="Líder da área" value={infoArea.lider || "—"} />
          <InfoCell label="Centro de Custo" value={infoArea.centroCusto || "—"} />
          <InfoCell label="Time / Equipe" value={infoArea.equipe || "—"} />
          <InfoCell label="Turno" value={infoArea.turno || "—"} />
        </div>
      </div>

      {/* Tabela principal — Objetivos x Dias */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#2563eb]">
          <h2 className="text-white font-bold text-sm">Objetivos Diários — Acompanhamento</h2>
          <div className="flex gap-2">
            <button onClick={() => { setDiariosTemp(objDiarios.map(o => ({ ...o }))); setEditandoDiarios(true); }} className="text-blue-200 hover:text-white p-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: diasNoMes * 26 + 200 }}>
            <thead>
              <tr className="bg-slate-100">
                <th className="sticky left-0 z-10 bg-slate-100 border border-slate-300 px-2 py-1.5 text-left text-[10px] font-bold text-slate-700 min-w-[190px]">
                  Objetivo / Meta
                </th>
                {diasArray.map(dia => {
                  const ds = getDiaSemana(dia);
                  const fds = ds === 0 || ds === 6;
                  const isHoje = dia === hoje;
                  return (
                    <th key={dia} className={`border border-slate-300 text-center w-6 px-0 py-0.5 ${fds ? "bg-slate-200 text-slate-400" : isHoje ? "bg-blue-100 text-blue-700" : "text-slate-600"}`}>
                      <div className="text-[8px]">{DIAS_ABR[ds]}</div>
                      <div className="text-[9px] font-bold">{dia}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {objDiarios.map((obj, idx) => (
                <tr key={obj.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="sticky left-0 z-10 border border-slate-200 px-2 py-1 bg-inherit">
                    <div className="text-[11px] font-bold text-slate-800">{obj.titulo}</div>
                    <div className="text-[9px] text-slate-400">{obj.descricao}</div>
                    <div className="text-[9px] text-blue-600 font-semibold">{obj.meta}</div>
                  </td>
                  {diasArray.map(dia => {
                    const ds = getDiaSemana(dia);
                    const fds = ds === 0 || ds === 6;
                    const status = getStatus(dia, obj.id);
                    const cfg = STATUS_COLORS[status] || STATUS_COLORS.null;
                    return (
                      <td
                        key={dia}
                        onClick={(e) => !fds && handleCellClick(dia, obj.id, e)}
                        className={`border border-slate-200 text-center w-6 h-7 cursor-pointer select-none transition-all active:opacity-70
                          ${fds ? "bg-slate-100 cursor-default" : "hover:opacity-80"}
                          ${cfg.bg} ${cfg.text}`}
                      >
                        <span className="text-[10px] font-bold">{fds ? "" : cfg.label}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Linha de resumo geral */}
              <tr className="bg-slate-800">
                <td className="sticky left-0 z-10 border border-slate-600 px-2 py-1.5 bg-slate-800">
                  <span className="text-[11px] font-bold text-white">RESULTADO DO DIA</span>
                </td>
                {diasArray.map(dia => {
                  const ds = getDiaSemana(dia);
                  const fds = ds === 0 || ds === 6;
                  const status = getDiaGeral(dia);
                  const cfg = STATUS_COLORS[status] || STATUS_COLORS.null;
                  return (
                    <td key={dia} className={`border border-slate-600 text-center w-6 h-8 ${fds ? "bg-slate-600" : cfg.bg}`}>
                      <span className={`text-[11px] font-black ${fds ? "text-slate-500" : cfg.text}`}>{fds ? "—" : cfg.label}</span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Legenda */}
        <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-4 h-3 bg-green-500 rounded-sm inline-block" /> Atingido</span>
          <span className="flex items-center gap-1"><span className="w-4 h-3 bg-red-500 rounded-sm inline-block" /> Não Atingido</span>
          <span className="flex items-center gap-1"><span className="w-4 h-3 bg-slate-300 rounded-sm inline-block" /> Feriado</span>
          <span className="ml-auto font-semibold text-[#0066b1]">{pct}% — {diasAtingidos}/{diasPassados.length} dias atingidos</span>
        </div>
      </div>

      {/* Objetivos Semanais */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#2563eb]">
          <h2 className="text-white font-bold text-sm">Objetivos Semanais</h2>
          <button onClick={() => { setSemanaisTemp(objSemanais.map(o => ({ ...o }))); setEditandoSemanais(true); }} className="text-blue-200 hover:text-white p-1">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {objSemanais.map((o, i) => (
            <div key={o.id} className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="font-semibold text-slate-700">{i + 1}. {o.titulo}</span>
              <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{o.meta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-[10px] text-slate-400 text-center pb-2">
        Creation date: {format(mesAtual, "dd.MM.yy")} | Responsible department for filing: 8-OTM-4 | CSD-Class: 0.0 – INTERNAL
      </div>

      {/* Popup marcar status */}
      {popupDia && (
        <div className="fixed inset-0 z-50" onClick={() => setPopupDia(null)}>
          <div
            className="absolute bg-white shadow-2xl rounded-xl border border-slate-200 p-3 space-y-1.5 min-w-[170px]"
            style={{ top: popupDia.y - 10, left: popupDia.x }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs font-bold text-slate-700 text-center mb-2">Dia {popupDia.dia}</p>
            <button onClick={() => handleMarcar("concluido")} className="w-full text-xs py-2 rounded-lg bg-green-500 text-white font-semibold">✅ Atingido</button>
            <button onClick={() => handleMarcar("nao_atingido")} className="w-full text-xs py-2 rounded-lg bg-red-500 text-white font-semibold">❌ Não Atingido</button>
            <button onClick={() => handleMarcar("feriado")} className="w-full text-xs py-2 rounded-lg bg-slate-200 text-slate-600 font-semibold">📅 Feriado / FDS</button>
            <button onClick={() => handleMarcar(null)} className="w-full text-xs py-1.5 rounded-lg border border-slate-200 text-slate-400">🗑 Limpar</button>
            <button onClick={() => setPopupDia(null)} className="w-full text-[10px] py-1 text-slate-300">Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal editar info */}
      {editandoInfo && infoTemp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditandoInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800">Editar Informações</p>
              <button onClick={() => setEditandoInfo(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[["Líder da área", "lider"], ["Centro de Custo", "centroCusto"], ["Time / Equipe", "equipe"], ["Turno", "turno"]].map(([label, key]) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label>
                  <input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={infoTemp[key]} onChange={e => setInfoTemp(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => { setInfoArea(infoTemp); await salvarConfig(INFO_KEY, { _info: infoTemp }); setEditandoInfo(false); }}>Salvar</Button>
              <Button variant="outline" onClick={() => setEditandoInfo(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

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
                    <input className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold" placeholder="Título" value={o.titulo} onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, titulo: e.target.value } : x))} />
                    <button onClick={() => setDiariosTemp(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs" placeholder="Descrição" value={o.descricao} onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, descricao: e.target.value } : x))} />
                  <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-blue-600 font-semibold" placeholder="Meta (ex: 0 acidentes, 4 D/1000)" value={o.meta || ""} onChange={e => setDiariosTemp(prev => prev.map((x, i) => i === idx ? { ...x, meta: e.target.value } : x))} />
                </div>
              ))}
            </div>
            <button onClick={() => setDiariosTemp(prev => [...prev, { id: Date.now(), titulo: "", descricao: "", meta: "" }])} className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <Plus className="w-3.5 h-3.5" /> Adicionar objetivo
            </button>
            <div className="flex gap-2 mt-4 border-t border-slate-100 pt-3">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => { setObjDiarios(diariosTemp); await salvarConfig(OBJ_DIARIOS_KEY, { _diarios: diariosTemp }); setEditandoDiarios(false); }}>
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
                  <input className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs" placeholder="Título" value={o.titulo} onChange={e => setSemanaisTemp(prev => prev.map((x, i) => i === idx ? { ...x, titulo: e.target.value } : x))} />
                  <input className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-xs" placeholder="Meta" value={o.meta} onChange={e => setSemanaisTemp(prev => prev.map((x, i) => i === idx ? { ...x, meta: e.target.value } : x))} />
                  <button onClick={() => setSemanaisTemp(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setSemanaisTemp(prev => [...prev, { id: Date.now(), titulo: "", meta: "" }])} className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
            <div className="flex gap-2 mt-4 border-t border-slate-100 pt-3">
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82] text-white" onClick={async () => { setObjSemanais(semanaisTemp); await salvarConfig(OBJ_SEMANAIS_KEY, { _semanais: semanaisTemp }); setEditandoSemanais(false); }}>
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
      <p className="font-semibold text-slate-800 text-xs">{value}</p>
    </div>
  );
}