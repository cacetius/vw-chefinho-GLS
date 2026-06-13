import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, ClipboardCheck, Sparkles, Tag, LayoutGrid,
  HardHat, Target, Gauge, Camera, AlertTriangle,
  CheckCircle2, Clock, MapPin, ChevronRight, Plus,
  Search, Calendar, ShieldCheck, Zap, ArrowRight
} from "lucide-react";

// ─── Quick Action Card ─────────────────────────────────────
function QuickCard({ icon: Icon, title, subtitle, bgColor, textColor, badge, onClick }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick} className="cursor-pointer">
      <Card className={`hover:shadow-md transition-shadow border-l-4 ${bgColor}`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${bgColor.replace('border-l-', 'bg-').replace('-400', '-100').replace('-500', '-100').replace('-600', '-100').replace('-700', '-100')}`}>
            <Icon className={`w-5 h-5 ${textColor.replace('border-l-', 'text-')}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Rotina Inteligente ────────────────────────────────────
function RotinaInteligente({ userName, atividades, auditorias, calibracoes }) {
  const hoje = new Date().toISOString().split('T')[0];
  const tarefasHoje = atividades.filter(a => a.data === hoje && a.status !== "concluido");
  const auditoriasPendentes = auditorias.filter(a => a.conformidade === "nao_conforme");
  const calibracoesProximas = calibracoes.filter(c => {
    const data = c.data_proxima_calibracao || c.proxima_calibracao;
    if (!data) return false;
    const dias = Math.ceil((new Date(data) - new Date(hoje)) / 86400000);
    return dias >= 0 && dias <= 7;
  });

  if (tarefasHoje.length === 0 && auditoriasPendentes.length === 0 && calibracoesProximas.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-5 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-emerald-700">Tudo em dia!</p>
          <p className="text-sm text-emerald-600">Nenhuma pendência para hoje.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-900 text-sm">Bom dia, {userName?.split(' ')[0] || "Monitor"}!</p>
            <p className="text-xs text-blue-600">Hoje você precisa:</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {tarefasHoje.slice(0, 5).map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 text-sm text-slate-700 py-1.5 border-t border-blue-100">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-blue-600" defaultChecked={false} />
              <span className="flex-1">{t.titulo}</span>
              <Badge variant="outline" className="text-[10px]">{t.categoria}</Badge>
            </div>
          ))}
          {auditoriasPendentes.slice(0, 2).map((a, i) => (
            <div key={`aud-${a.id}`} className="flex items-center gap-2 text-sm text-red-700 py-1.5 border-t border-red-100">
              <input type="checkbox" className="w-4 h-4 rounded border-red-300 accent-red-600" defaultChecked={false} />
              <span className="flex-1">Resolver auditoria — {a.area}</span>
              <Badge className="bg-red-100 text-red-700 text-[10px]">Pendente</Badge>
            </div>
          ))}
          {calibracoesProximas.slice(0, 2).map((c, i) => (
            <div key={`cal-${c.id}`} className="flex items-center gap-2 text-sm text-amber-700 py-1.5 border-t border-amber-100">
              <input type="checkbox" className="w-4 h-4 rounded border-amber-300 accent-amber-600" defaultChecked={false} />
              <span className="flex-1">Conferir calibração — {c.ferramenta || c.nome || c.equipamento}</span>
              <Badge className="bg-amber-100 text-amber-700 text-[10px]">Em breve</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────
export default function MochilaMonitorPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  const { data: atividades = [] } = useQuery({
    queryKey: ['atividadesMochila'],
    queryFn: () => base44.entities.AtividadeMonitor.list('-created_date', 50),
    enabled: !!currentUser,
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ['auditoriasMochila'],
    queryFn: () => base44.entities.AuditoriaProcesso.list('-created_date', 20),
    enabled: !!currentUser,
  });

  const { data: calibracoes = [] } = useQuery({
    queryKey: ['calibracoesMochila'],
    queryFn: () => base44.entities.Calibracao.list(),
    enabled: !!currentUser,
  });

  const { data: naoConformidades = [] } = useQuery({
    queryKey: ['ncMochila'],
    queryFn: () => base44.entities.NaoConformidade.list('-created_date', 20),
    enabled: !!currentUser,
  });

  const ncAbertas = naoConformidades.filter(n => n.status === "aberta").length;
  const ncTotal = naoConformidades.length;

  const modules = [
    { icon: Wrench, title: "Ferramentas", subtitle: "Gestão de ferramentas", bg: "border-l-blue-500", textColor: "text-blue-600", path: "Ferramentas", badge: null },
    { icon: ClipboardCheck, title: "Auditorias", subtitle: "Processo e Torque", bg: "border-l-emerald-500", textColor: "text-emerald-600", path: "AuditoriaIndustrial", badge: null },
    { icon: Sparkles, title: "5S", subtitle: "Gestão 5S", bg: "border-l-purple-500", textColor: "text-purple-600", path: "CincoS", badge: null },
    { icon: Tag, title: "Etiquetas", subtitle: "Identificação visual", bg: "border-l-orange-500", textColor: "text-orange-600", path: "Etiquetas", badge: null },
    { icon: LayoutGrid, title: "Bancadas", subtitle: "Gestão de bancadas", bg: "border-l-teal-500", textColor: "text-teal-600", path: "Bancadas", badge: null },
    { icon: HardHat, title: "EPI", subtitle: "Equipamentos de proteção", bg: "border-l-amber-500", textColor: "text-amber-600", path: "OperacoesHub", badge: null },
    { icon: Target, title: "Plano de Ação", subtitle: "Ações corretivas", bg: "border-l-red-500", textColor: "text-red-600", path: "SaudeArea", badge: ncAbertas > 0 ? `${ncAbertas} pendentes` : null },
    { icon: Gauge, title: "Calibração", subtitle: "Controle de calibrações", bg: "border-l-indigo-500", textColor: "text-indigo-600", path: "Calibracao", badge: null },
    { icon: ShieldCheck, title: "Saúde da Área", subtitle: "Score e prontidão", bg: "border-l-cyan-500", textColor: "text-cyan-600", path: "SaudeArea", badge: null },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">🎒 Mochila do Monitor</h1>
        <p className="text-sm text-slate-500">Tudo que você precisa em um lugar</p>
      </div>

      {/* Rotina Inteligente */}
      <RotinaInteligente
        userName={currentUser?.full_name || currentUser?.nome_exibicao}
        atividades={atividades}
        auditorias={auditorias}
        calibracoes={calibracoes}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-slate-700">{atividades.filter(a => a.status === "concluido").length}</p>
            <p className="text-[10px] text-slate-500">Tarefas OK</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-red-600">{ncAbertas}</p>
            <p className="text-[10px] text-red-600">Não Conf.</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-amber-600">{atividades.filter(a => a.status === "atrasado").length}</p>
            <p className="text-[10px] text-amber-600">Atrasadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Módulos Rápidos</h2>
        <div className="grid gap-2">
          {modules.map((mod, i) => (
            <QuickCard
              key={mod.title}
              {...mod}
              onClick={() => navigate(createPageUrl(mod.path))}
            />
          ))}
        </div>
      </div>

      {/* Ações Rápidas - Modo Celular */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1.5 border-2 border-dashed hover:border-slate-400"
            onClick={() => navigate(createPageUrl("AuditoriaIndustrial"))}
          >
            <Camera className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-medium">Auditar + Foto</span>
            <span className="text-[10px] text-slate-400">&lt; 20 segundos</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1.5 border-2 border-dashed hover:border-red-400"
            onClick={() => navigate(createPageUrl("SaudeArea"))}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-xs font-medium">Registrar Problema</span>
            <span className="text-[10px] text-slate-400">&lt; 15 segundos</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1.5 border-2 border-dashed hover:border-blue-400"
            onClick={() => navigate(createPageUrl("SaudeArea"))}
          >
            <Target className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-medium">Criar Ação</span>
            <span className="text-[10px] text-slate-400">Plano de ação</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1.5 border-2 border-dashed hover:border-emerald-400"
            onClick={() => navigate(createPageUrl("SaudeArea"))}
          >
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span className="text-xs font-medium">Verificar Prontidão</span>
            <span className="text-[10px] text-slate-400">Auditoria</span>
          </Button>
        </div>
      </div>
    </div>
  );
}