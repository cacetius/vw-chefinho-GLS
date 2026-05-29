import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CalendarioRosca from "../components/objetivos/CalendarioRosca";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ObjetivosMes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [registros, setRegistros] = useState({});
  const [mesAtual] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u));
    carregarRegistros();
  }, []);

  const carregarRegistros = async () => {
    const objetivos = await base44.entities.Objetivo.list("-data_referencia");
    // Mapeia dia -> status (concluido/nao_concluido/acidente)
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

  const mesNome = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Título */}
      <div className="bg-[#0d2d6b] rounded-xl py-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-white tracking-wide">Objetivos do mês</h1>
        <p className="text-blue-200 text-sm mt-1 capitalize">{mesNome}</p>
      </div>

      {/* Cabeçalho informativo */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm">
        <div className="grid grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Líder da área</p>
            <p className="font-semibold text-slate-800">{currentUser?.nome_lider || currentUser?.full_name || "—"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Centro de Custo</p>
            <p className="font-semibold text-slate-800">{currentUser?.centro_custo || "3338"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Time / Equipe</p>
            <p className="font-semibold text-slate-800">{currentUser?.equipe || "—"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Turno</p>
            <p className="font-semibold text-slate-800">
              {currentUser?.turno === "manha" ? "1º" : currentUser?.turno === "tarde" ? "2º" : currentUser?.turno === "noite" ? "3º" : "—"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Elaborado por</p>
            <p className="font-semibold text-slate-800">{currentUser?.full_name || "—"}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-slate-400 text-[10px]">Data</p>
            <p className="font-semibold text-slate-800">{format(mesAtual, "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Corpo principal: objetivos + rosca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COLUNA ESQUERDA: Objetivos */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Objetivos Diários */}
          <div className="bg-[#2563eb] px-4 py-2">
            <h2 className="text-white font-bold text-sm">Objetivos diários</h2>
          </div>
          <div className="px-4 py-3 space-y-3 text-xs">
            <ObjetivoItem
              numero="1"
              titulo="Acidentes"
              descricao={'"0" acidentes com afastamentos'}
            />
            <ObjetivoItem
              numero="2"
              titulo="Qualidade"
              descricao="4 D/1000 por turno — ZP6"
              subdescricao="FisEQS-Q3 Dinâmico-ZP6-PCH-FRC-EQ2"
            />
            <ObjetivoItem
              numero="3"
              titulo="100% Cumprimento Programa de produção"
              descricao="Volume conforme Programa de Produção P2"
            />
            <ObjetivoItem
              numero="4"
              titulo="Retrabalhos / Peças NOK"
              descricao="1.1 D/1000 por Turno — ZP8"
              subdescricao="FisEQS-Q3Dinâmico-RODAGEM-PCH-FRC ESPECIFICADO-EQ3"
            />
            <ObjetivoItem
              numero="5"
              titulo="Verificação do Trabalho Padronizado:"
              descricao="1 operação por Turno"
            />
          </div>

          {/* Objetivos Semanais */}
          <div className="bg-[#2563eb] px-4 py-2">
            <h2 className="text-white font-bold text-sm">Objetivos Semanais</h2>
          </div>
          <div className="px-4 py-3 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-slate-700">Andamento das reuniões do time</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => <div key={i} className="w-6 h-3 bg-green-500 rounded-sm" />)}
                  {[1,2].map(i => <div key={i} className="w-6 h-3 border border-slate-300 rounded-sm" />)}
                </div>
                <span className="text-slate-500">1 por semana</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-700">"6 S"</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => <div key={i} className="w-6 h-3 bg-green-500 rounded-sm" />)}
                  {[1,2].map(i => <div key={i} className="w-6 h-3 border border-slate-300 rounded-sm" />)}
                </div>
                <span className="text-slate-500">1 por semana</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Rotatividade da Equipe - Conforme Planejamento?</p>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3].map(i => <div key={i} className="w-6 h-3 bg-green-500 rounded-sm" />)}
                {[1,2].map(i => <div key={i} className="w-6 h-3 border border-slate-300 rounded-sm" />)}
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="px-4 pb-3">
            <div className="border-t border-slate-100 pt-2 space-y-1">
              <p className="text-[10px] font-semibold text-slate-500 mb-1">Legenda:</p>
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-5 h-3 bg-green-500 rounded-sm" />
                  <span>Objetivo Atingido</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-3 bg-red-400 rounded-sm" />
                  <span>Objetivo não atingido - Acidente com Afastamento</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-3 border border-slate-300 rounded-sm" />
                  <span>Acidente sem Afastamento</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-3 bg-slate-200 rounded-sm" style={{ backgroundImage: "repeating-linear-gradient(45deg, #94a3b8 0, #94a3b8 1px, transparent 0, transparent 50%)", backgroundSize: "4px 4px" }} />
                  <span>Dias de Feriado / sem produção</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Calendário Rosca */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-4">
          <CalendarioRosca
            registros={registros}
            diasNoMes={diasNoMes}
            mesAtual={mesAtual}
            onDiaClick={(dia, status) => handleMarcarDia(dia, status)}
          />
          <p className="text-[10px] text-slate-400 mt-2 text-center">Toque no dia para marcar o status</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-[10px] text-slate-400 text-center pb-2">
        Creation date: {format(mesAtual, "dd.MM.yy")} | Responsible department for filing: 8-OTM-4 | CSD-Class: 0.0 – Máximo de 90 dias — INTERNAL
      </div>
    </div>
  );

  async function handleMarcarDia(dia, novoStatus) {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const dataRef = format(new Date(ano, mes, dia), "yyyy-MM-dd");

    const existentes = await base44.entities.Objetivo.filter({ tipo: "diario", data_referencia: dataRef });
    if (existentes.length > 0) {
      await base44.entities.Objetivo.update(existentes[0].id, { concluido: novoStatus === "concluido" });
    } else {
      await base44.entities.Objetivo.create({
        titulo: `Dia ${dia}`,
        tipo: "diario",
        categoria: "producao",
        data_referencia: dataRef,
        concluido: novoStatus === "concluido",
      });
    }
    carregarRegistros();
  }
}

function ObjetivoItem({ numero, titulo, descricao, subdescricao }) {
  return (
    <div>
      <p className="font-bold text-slate-800">{numero}. {titulo}</p>
      <p className="text-slate-600 pl-3">{descricao}</p>
      {subdescricao && <p className="text-slate-400 pl-3 text-[10px]">{subdescricao}</p>}
    </div>
  );
}