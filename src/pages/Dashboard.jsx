import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Wrench, Gauge, ClipboardCheck, Sparkles,
  AlertTriangle, Clock, TrendingUp, ArrowRight,
  Zap, BarChart2, Shield, Activity
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import ChefinhoIA from "../components/dashboard/ChefinhoIA";

// ─── Micro componentes ─────────────────────────────────────────────────────

function StatRow({ label, value, variant = "default" }) {
  const cls = variant === "danger" ? "text-red-600" : variant === "warn" ? "text-amber-600" : variant === "ok" ? "text-emerald-600" : "text-slate-700";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${cls}`}>{value}</span>
    </div>
  );
}

function AlertBadge({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
      {children}
    </button>
  );
}

function AlertWarnBadge({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
      {children}
    </button>
  );
}

function NavTile({ label, icon: Icon, onClick, alert }) {
  return (
    <button onClick={onClick}
      className="relative flex flex-col items-start gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all group text-left">
      {alert && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />}
      <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
      <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700 leading-tight">{label}</span>
    </button>
  );
}

function CalBar({ label, value, total, colorClass }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-slate-500 w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums w-5 text-right ${value > 0 && colorClass.includes("red") ? "text-red-600" : value > 0 && colorClass.includes("amber") ? "text-amber-600" : "text-slate-500"}`}>{value}</span>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarIA, setMostrarIA] = useState(false);

  useEffect(() => { base44.auth.me().then(u => setCurrentUser(u)).catch(() => {}); }, []);

  const { data: kpis = {}, isLoading } = useQuery({
    queryKey: ["dashboard-executivo", currentUser?.equipe],
    queryFn: async () => {
      const [ferramentas, calibracoes, auditorias, cincoS, atividades, bancadas] = await Promise.all([
        base44.entities.Ferramenta.list(),
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaProcesso.list("-data", 100),
        base44.entities.CincoS.list("-data", 50),
        base44.entities.AtividadeMonitor.list("-data", 200),
        base44.entities.Bancada.list(),
      ]);

      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

      const calStatus = calibracoes.reduce((acc, c) => {
        if (!c.data_vencimento) { acc.semData++; return acc; }
        const dias = differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hoje);
        if (dias < 0) acc.vencido++;
        else if (dias <= 15) acc.vence15++;
        else if (dias <= 30) acc.vence30++;
        else acc.ok++;
        return acc;
      }, { ok: 0, vence30: 0, vence15: 0, vencido: 0, semData: 0 });

      const audStatus = auditorias.reduce((acc, a) => {
        if (a.conformidade === "conforme") acc.conforme++;
        else if (a.conformidade === "nao_conforme") acc.naoConforme++;
        else acc.outros++;
        return acc;
      }, { conforme: 0, naoConforme: 0, outros: 0 });

      const ativStatus = atividades.reduce((acc, a) => {
        if (a.status === "concluido") acc.concluidas++;
        else if (a.status === "atrasado") acc.atrasadas++;
        else if (a.status === "em_andamento") acc.emAndamento++;
        else acc.naoIniciadas++;
        return acc;
      }, { concluidas: 0, atrasadas: 0, emAndamento: 0, naoIniciadas: 0 });

      const ultimo5S = cincoS.length > 0 ? cincoS[0] : null;
      const score5S = ultimo5S ? Math.round((ultimo5S.pontuacao_total / 50) * 100) : null;

      // Cal vence em 30 dias (inclui vence15)
      const calProximas = calStatus.vence15 + calStatus.vence30;

      return {
        ferramentas: ferramentas.length,
        ferramentasAtivas: ferramentas.filter(f => f.status === "ativo").length,
        calStatus, calTotal: calibracoes.length, calProximas,
        audStatus, audTotal: auditorias.length,
        ultimo5S, score5S, cincoSTotal: cincoS.length,
        ativStatus, ativTotal: atividades.length,
        bancadas: bancadas.length,
      };
    },
    enabled: !!currentUser,
    refetchInterval: 60000,
  });

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = (currentUser?.nome_exibicao || currentUser?.full_name || "").split(" ")[0];
  const hasAlertas = (kpis.calStatus?.vencido > 0) || (kpis.audStatus?.naoConforme > 0) || (kpis.ativStatus?.atrasadas > 0);
  const score5S = kpis.score5S;
  const pctAtiv = kpis.ativTotal > 0 ? Math.round((kpis.ativStatus.concluidas / kpis.ativTotal) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">

      {/* ── Topo ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mb-0.5">VW Chefinho GLS</p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bom dia, {firstName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            {currentUser?.cargo === "supervisor" ? "Supervisor" : currentUser?.cargo === "lider" ? "Líder" : "Monitor"}
          </span>
          <button onClick={() => setMostrarIA(v => !v)}
            className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors">
            <Zap className="w-3 h-3" /> IA
          </button>
        </div>
      </div>

      {mostrarIA && <ChefinhoIA kpis={kpis} currentUser={currentUser} />}

      {/* ── Alertas ──────────────────────────────────────────── */}
      {hasAlertas && (
        <div className="border border-red-200 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-[11px] font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Requer atenção
          </p>
          <div className="flex flex-wrap gap-2">
            {kpis.calStatus?.vencido > 0 && <AlertBadge onClick={() => navigate(createPageUrl("Calibracao"))}>{kpis.calStatus.vencido} calibração{kpis.calStatus.vencido > 1 ? "ões" : ""} vencida{kpis.calStatus.vencido > 1 ? "s" : ""}</AlertBadge>}
            {kpis.calStatus?.vence15 > 0 && <AlertWarnBadge onClick={() => navigate(createPageUrl("Calibracao"))}>{kpis.calStatus.vence15} vencem em 15 dias</AlertWarnBadge>}
            {kpis.audStatus?.naoConforme > 0 && <AlertBadge onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))}>{kpis.audStatus.naoConforme} não conformidade{kpis.audStatus.naoConforme > 1 ? "s" : ""}</AlertBadge>}
            {kpis.ativStatus?.atrasadas > 0 && <AlertBadge onClick={() => navigate(createPageUrl("QuadroMonitor"))}>{kpis.ativStatus.atrasadas} atividade{kpis.ativStatus.atrasadas > 1 ? "s" : ""} atrasada{kpis.ativStatus.atrasadas > 1 ? "s" : ""}</AlertBadge>}
          </div>
        </div>
      )}

      {/* ── Grid principal ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Coluna esquerda: KPI strip + Calibrações + Auditorias */}
        <div className="lg:col-span-2 space-y-4">

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white divide-x divide-slate-100">
            {[
              { label: "Ferramentas", value: kpis.ferramentas, sub: `${kpis.ferramentasAtivas} ativas`, icon: Wrench },
              { label: "Calibrações", value: kpis.calTotal, sub: `${kpis.calStatus?.vencido || 0} vencidas`, icon: Gauge, variant: kpis.calStatus?.vencido > 0 ? "danger" : "default" },
              { label: "Auditorias", value: kpis.audTotal, sub: `${kpis.audStatus?.naoConforme || 0} NCs`, icon: ClipboardCheck, variant: kpis.audStatus?.naoConforme > 0 ? "danger" : "default" },
              { label: "5S Score", value: score5S != null ? `${score5S}%` : "—", sub: `${kpis.cincoSTotal} avaliações`, icon: Sparkles, variant: score5S != null && score5S < 60 ? "danger" : score5S != null && score5S < 80 ? "warn" : "ok" },
            ].map((k, i) => {
              const cls = k.variant === "danger" ? "text-red-600" : k.variant === "warn" ? "text-amber-600" : k.variant === "ok" ? "text-emerald-600" : "text-slate-800";
              return (
                <div key={k.label} className={`p-4 ${i >= 2 ? "sm:block hidden" : ""}`}>
                  <k.icon className="w-3.5 h-3.5 text-slate-400 mb-2" />
                  <p className={`text-2xl font-black tabular-nums leading-none ${cls}`}>{k.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{k.label}</p>
                  <p className="text-[10px] text-slate-300 leading-tight">{k.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Calibrações — barra detalhada */}
          <div className="border border-slate-200 rounded-xl bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Status de Calibrações</h2>
                <p className="text-xs text-slate-400 mt-0.5">{kpis.calTotal} equipamentos monitorados</p>
              </div>
              <button onClick={() => navigate(createPageUrl("Calibracao"))}
                className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Ver tudo <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              <CalBar label="Em dia" value={kpis.calStatus?.ok || 0} total={kpis.calTotal || 1} colorClass="bg-emerald-500" />
              <CalBar label="30 dias" value={kpis.calStatus?.vence30 || 0} total={kpis.calTotal || 1} colorClass="bg-amber-400" />
              <CalBar label="15 dias" value={kpis.calStatus?.vence15 || 0} total={kpis.calTotal || 1} colorClass="bg-orange-500" />
              <CalBar label="Vencidas" value={kpis.calStatus?.vencido || 0} total={kpis.calTotal || 1} colorClass="bg-red-500" />
            </div>
          </div>

          {/* Auditoria + Atividades lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Auditorias</h2>
              </div>
              <StatRow label="Conformes" value={kpis.audStatus?.conforme || 0} variant="ok" />
              <StatRow label="Não Conf." value={kpis.audStatus?.naoConforme || 0} variant={kpis.audStatus?.naoConforme > 0 ? "danger" : "default"} />
              <StatRow label="Em Análise" value={kpis.audStatus?.outros || 0} />
              <button onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))}
                className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Acessar <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Atividades</h2>
              </div>
              <div className="mb-3">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-2xl font-black text-slate-800 tabular-nums">{pctAtiv}%</span>
                  <span className="text-xs text-slate-400 mb-0.5">concluído</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pctAtiv >= 80 ? "bg-emerald-500" : pctAtiv >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pctAtiv}%` }} />
                </div>
              </div>
              <StatRow label="Concluídas" value={kpis.ativStatus?.concluidas || 0} variant="ok" />
              <StatRow label="Atrasadas" value={kpis.ativStatus?.atrasadas || 0} variant={kpis.ativStatus?.atrasadas > 0 ? "danger" : "default"} />
              <button onClick={() => navigate(createPageUrl("QuadroMonitor"))}
                className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Ver quadro <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna direita: Acessos rápidos + Score 5S */}
        <div className="space-y-4">

          {/* Score 5S */}
          <div className="border border-slate-200 rounded-xl bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Score 5S</h2>
            </div>
            {kpis.ultimo5S ? (
              <>
                <div className="flex items-end gap-1 mb-3">
                  <span className={`text-3xl font-black tabular-nums ${score5S >= 80 ? "text-emerald-600" : score5S >= 60 ? "text-amber-600" : "text-red-600"}`}>{score5S}%</span>
                </div>
                {[
                  { label: "Utilização", val: kpis.ultimo5S.utilizacao },
                  { label: "Organização", val: kpis.ultimo5S.organizacao },
                  { label: "Limpeza", val: kpis.ultimo5S.limpeza },
                  { label: "Padronização", val: kpis.ultimo5S.padronizacao },
                  { label: "Disciplina", val: kpis.ultimo5S.disciplina },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-slate-400 w-20 flex-shrink-0">{s.label}</span>
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(s.val || 0) >= 7 ? "bg-emerald-500" : (s.val || 0) >= 5 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${((s.val || 0) / 10) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 w-4 text-right">{s.val ?? "—"}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-xs text-slate-400 py-2">Nenhuma avaliação registrada</p>
            )}
            <button onClick={() => navigate(createPageUrl("CincoS"))} className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
              Gestão 5S <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Acessos Rápidos */}
          <div className="border border-slate-200 rounded-xl bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Acessos</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Ferramentas", url: "Ferramentas", icon: Wrench, alert: false },
                { label: "Calibração", url: "Calibracao", icon: Gauge, alert: kpis.calStatus?.vencido > 0 },
                { label: "Auditoria", url: "AuditoriaIndustrial", icon: ClipboardCheck, alert: kpis.audStatus?.naoConforme > 0 },
                { label: "5S", url: "CincoS", icon: Sparkles, alert: false },
                { label: "Quadro", url: "QuadroMonitor", icon: BarChart2, alert: kpis.ativStatus?.atrasadas > 0 },
                { label: "Segurança", url: "SegurancaHub", icon: Shield, alert: false },
              ].map(({ label, url, icon: Icon, alert }) => (
                <NavTile key={url} label={label} icon={Icon} alert={alert} onClick={() => navigate(createPageUrl(url))} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}