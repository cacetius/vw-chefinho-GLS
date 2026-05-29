import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Postos de trabalho padrão (conforme legenda do documento)
const POSTOS_DEFAULT = [
  { num: 1, desc: "F361 Raku raku montagem mangueira do AC" },
  { num: 2, desc: "F123 Mtg PCH+a diant. LE" },
  { num: 3, desc: "F186 Revestimento de caixa de roda dianteira LE" },
  { num: 4, desc: "F170 Revestimento da caixa de roda traseira LE" },
  { num: 5, desc: "F881 Flexível de Freio LE" },
  { num: 6, desc: "F104 Aperto pch diant. interior + aperto de cr do roda inferior" },
  { num: 7, desc: "F103 Ossada térmica central + duto do freio dianteiro" },
  { num: 8, desc: "F120 Mang radiador + deflexor termométrico = bote de freio de inferior 5x rosetas" },
  { num: 9, desc: "F476 Aperto pch diant. interior + bote de freio de inferior 5x rosetas" },
  { num: 10, desc: "F174 Resistência p/ cr do roda traseira LD" },
  { num: 11, desc: "F860 Flexível do freio LD" },
  { num: 12, desc: "F107 Revestimento caixa de roda dianteira LD" },
  { num: 13, desc: "F125 Aplicar torque parafuso do tanque" },
  { num: 14, desc: "F124 Mtg PCH diant. LD" },
];

const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function PlanejamentoRotatividade() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mesAtual] = useState(new Date());
  const [colaboradores, setColaboradores] = useState([]);
  const [grade, setGrade] = useState({}); // { "colab_id-dia": postoNum }
  const [postos, setPostos] = useState(POSTOS_DEFAULT);
  const [novoColab, setNovoColab] = useState({ chapa: "", nome: "" });
  const [adicionando, setAdicionando] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u));
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const versatilidades = await base44.entities.Versatilidade.list();
    setColaboradores(versatilidades.map(v => ({ id: v.id, chapa: v.chapa, nome: v.colaborador, equipe: v.equipe })));

    // Carregar grade do mês atual via AtividadeLogistica como registro
    const atividades = await base44.entities.AtividadeLogistica.filter({ setor: "rotatividade" });
    const gradeMap = {};
    atividades.forEach(a => {
      if (a.descricao) {
        try {
          const d = JSON.parse(a.descricao);
          Object.assign(gradeMap, d);
        } catch {}
      }
    });
    setGrade(gradeMap);
  };

  const salvarGrade = async (novaGrade) => {
    // Persiste a grade como JSON em um registro de AtividadeLogistica
    const mesKey = format(mesAtual, "yyyy-MM");
    const existentes = await base44.entities.AtividadeLogistica.filter({ setor: "rotatividade", titulo: mesKey });
    const payload = { titulo: mesKey, setor: "rotatividade", responsavel: "sistema", descricao: JSON.stringify(novaGrade) };
    if (existentes.length > 0) {
      await base44.entities.AtividadeLogistica.update(existentes[0].id, payload);
    } else {
      await base44.entities.AtividadeLogistica.create(payload);
    }
  };

  const handleCellClick = (colabId, dia) => {
    setEditingCell({ colabId, dia });
  };

  const handlePostoSelect = async (posto) => {
    if (!editingCell) return;
    const key = `${editingCell.colabId}-${editingCell.dia}`;
    const novaGrade = { ...grade, [key]: posto === 0 ? undefined : posto };
    if (posto === 0) delete novaGrade[key];
    setGrade(novaGrade);
    setEditingCell(null);
    await salvarGrade(novaGrade);
  };

  const adicionarColaborador = async () => {
    if (!novoColab.chapa || !novoColab.nome) return;
    await base44.entities.Versatilidade.create({ chapa: novoColab.chapa, colaborador: novoColab.nome });
    setNovoColab({ chapa: "", nome: "" });
    setAdicionando(false);
    carregarDados();
  };

  const removerColaborador = async (id) => {
    await base44.entities.Versatilidade.delete(id);
    carregarDados();
  };

  const getDiaSemana = (dia) => {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    return d.getDay(); // 0=Dom, 6=Sáb
  };

  const mesNome = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });
  const hoje = new Date().getDate();

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="bg-[#0d2d6b] rounded-xl py-4 px-6 text-center">
        <h1 className="text-xl font-bold text-white tracking-wide">Planejamento de Rotatividade</h1>
        <p className="text-blue-200 text-sm mt-1 capitalize">{mesNome}</p>
      </div>

      {/* Cabeçalho informativo */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Área / Setor</p>
            <p className="font-semibold text-slate-800">Para-choque</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Líder da área</p>
            <p className="font-semibold text-slate-800">{currentUser?.full_name || "—"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Centro de Custo / Time</p>
            <p className="font-semibold text-slate-800">3338 / {currentUser?.equipe || "2"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Turno / Data</p>
            <p className="font-semibold text-slate-800">
              {currentUser?.turno === "manha" ? "1º" : currentUser?.turno === "tarde" ? "2º" : currentUser?.turno === "noite" ? "3º" : "2º"} — {format(mesAtual, "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de rotatividade */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: diasNoMes * 28 + 160 }}>
            <thead>
              <tr className="bg-slate-100">
                <th className="sticky left-0 z-10 bg-slate-100 border border-slate-300 px-2 py-1 text-left text-[10px] font-bold text-slate-700 min-w-[140px]">
                  Integrantes da Equipe
                </th>
                {diasArray.map(dia => {
                  const ds = getDiaSemana(dia);
                  const fds = ds === 0 || ds === 6;
                  return (
                    <th
                      key={dia}
                      className={`border border-slate-300 text-center text-[9px] font-bold w-7 ${fds ? "bg-slate-200 text-slate-400" : "text-slate-700"} ${dia === hoje ? "bg-blue-100 text-blue-700" : ""}`}
                    >
                      <div>{DIAS_SEMANA_ABREV[ds][0]}</div>
                      <div>{dia}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((colab, idx) => (
                <tr key={colab.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="sticky left-0 z-10 border border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-800 bg-inherit">
                    <div className="flex items-center justify-between gap-1">
                      <div>
                        <div className="text-[9px] text-slate-400">{colab.chapa}</div>
                        <div className="font-semibold">{colab.nome}</div>
                      </div>
                      <button onClick={() => removerColaborador(colab.id)} className="text-slate-300 hover:text-red-400 p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  {diasArray.map(dia => {
                    const ds = getDiaSemana(dia);
                    const fds = ds === 0 || ds === 6;
                    const key = `${colab.id}-${dia}`;
                    const posto = grade[key];
                    const isEditing = editingCell?.colabId === colab.id && editingCell?.dia === dia;

                    return (
                      <td
                        key={dia}
                        onClick={() => !fds && handleCellClick(colab.id, dia)}
                        className={`border border-slate-200 text-center text-[9px] w-7 h-7 relative select-none
                          ${fds ? "bg-slate-100 cursor-default" : "cursor-pointer hover:bg-blue-50"}
                          ${isEditing ? "bg-blue-100" : ""}
                          ${posto && !fds ? "bg-green-100" : ""}
                        `}
                      >
                        {fds ? (
                          <span className="text-slate-300 text-[8px]">—</span>
                        ) : posto ? (
                          <span className="font-bold text-green-700">{posto}</span>
                        ) : (
                          <span className="text-slate-200">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Linha para adicionar colaborador */}
              {adicionando ? (
                <tr className="bg-blue-50">
                  <td className="sticky left-0 z-10 border border-slate-300 px-2 py-1 bg-blue-50">
                    <div className="flex flex-col gap-1">
                      <input
                        placeholder="Chapa"
                        value={novoColab.chapa}
                        onChange={e => setNovoColab(p => ({ ...p, chapa: e.target.value }))}
                        className="border border-slate-300 rounded px-1 py-0.5 text-[10px] w-full"
                      />
                      <input
                        placeholder="Nome"
                        value={novoColab.nome}
                        onChange={e => setNovoColab(p => ({ ...p, nome: e.target.value }))}
                        className="border border-slate-300 rounded px-1 py-0.5 text-[10px] w-full"
                      />
                      <div className="flex gap-1">
                        <button onClick={adicionarColaborador} className="flex-1 bg-green-500 text-white text-[9px] rounded py-0.5">OK</button>
                        <button onClick={() => setAdicionando(false)} className="flex-1 bg-slate-200 text-slate-600 text-[9px] rounded py-0.5">X</button>
                      </div>
                    </div>
                  </td>
                  {diasArray.map(dia => <td key={dia} className="border border-slate-200 bg-blue-50" />)}
                </tr>
              ) : (
                <tr>
                  <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-1" colSpan={diasNoMes + 1}>
                    <button
                      onClick={() => setAdicionando(true)}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-3 h-3" /> Adicionar colaborador
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup seletor de posto */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditingCell(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-slate-800 mb-3">
              Selecione o posto — Dia {editingCell.dia}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {postos.map(p => (
                <button
                  key={p.num}
                  onClick={() => handlePostoSelect(p.num)}
                  className="text-left text-[10px] px-2 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <span className="font-bold text-blue-700">{p.num}</span> — <span className="text-slate-600">{p.desc.substring(0, 30)}...</span>
                </button>
              ))}
              <button
                onClick={() => handlePostoSelect(0)}
                className="col-span-2 text-[10px] px-2 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
              >
                🗑 Limpar célula
              </button>
            </div>
            <button onClick={() => setEditingCell(null)} className="mt-3 w-full text-xs text-slate-400 py-1">Cancelar</button>
          </div>
        </div>
      )}

      {/* Descrição dos Postos de Trabalho */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
          Descrição dos Postos de trabalho
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {postos.map(p => (
            <div key={p.num} className="flex gap-2 text-[11px] text-slate-600">
              <span className="font-bold text-blue-700 w-5 flex-shrink-0">{p.num}</span>
              <span>{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-[10px] text-slate-400 text-center pb-2">
        Creation date: {format(mesAtual, "dd.MM.yy")} | Responsible department for filing: 8-OTM-4 | CSD-Class: 0.0 – Máximo de 90 dias — INTERNAL
      </div>
    </div>
  );
}