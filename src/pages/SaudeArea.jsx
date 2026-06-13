import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ShieldCheck, AlertTriangle, XCircle, Camera, Plus, 
  CheckCircle2, Clock, Wrench, Gauge, Tag, LayoutGrid, 
  Sparkles, HardHat, ClipboardList, Zap, MapPin, Calendar,
  TrendingUp, TrendingDown, ChevronRight, Search, Target,
  RefreshCw, BarChart3, Activity, ArrowRight, Upload, Image
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const STATUS_BADGE = {
  aberta: { icon: XCircle, label: "Aberta", color: "bg-red-100 text-red-700 border-red-200" },
  em_andamento: { icon: AlertTriangle, label: "Em andamento", color: "bg-amber-100 text-amber-700 border-amber-200" },
  resolvida: { icon: CheckCircle2, label: "Resolvida", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

const CATEGORIA_ICON = {
  ferramenta: Wrench, calibracao: Gauge, etiqueta: Tag,
  bancada: LayoutGrid, "5s": Sparkles, epi: HardHat,
  seguranca: ShieldCheck, auditoria: ClipboardList, outro: Zap
};

const SAUDE_STATUS = {
  ok: { label: "Área pronta para auditoria", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  atencao: { label: "Atenção necessária", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  risco: { label: "Risco de não conformidade", icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" }
};

// ─── ScoreCard Component ───────────────────────────────────
function ScoreCard({ icon: Icon, label, valor, total, onClick }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 100;
  const statusColor = pct >= 90 ? "text-emerald-500" : pct >= 70 ? "text-amber-500" : "text-red-500";
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick} className="cursor-pointer">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${pct >= 90 ? 'bg-emerald-100' : pct >= 70 ? 'bg-amber-100' : 'bg-red-100'}`}>
            <Icon className={`w-5 h-5 ${statusColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
            <p className={`text-lg font-bold ${statusColor}`}>{pct}%</p>
            <Progress value={pct} className="h-1 mt-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── IndicadorGeral Component ──────────────────────────────
function IndicadorGeral({ pontuacoes }) {
  const geral = useMemo(() => {
    if (!pontuacoes || pontuacoes.length === 0) return { pct: 0, status: "risco" };
    const avg = pontuacoes.reduce((sum, p) => sum + p.pct, 0) / pontuacoes.length;
    return {
      pct: Math.round(avg),
      status: avg >= 90 ? "ok" : avg >= 70 ? "atencao" : "risco"
    };
  }, [pontuacoes]);

  const s = SAUDE_STATUS[geral.status];
  const Icon = s.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-2xl border-2 p-6 ${s.bg}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${geral.status === 'ok' ? 'bg-emerald-100' : geral.status === 'atencao' ? 'bg-amber-100' : 'bg-red-100'}`}>
          <Icon className={`w-8 h-8 ${s.color}`} />
        </div>
        <div className="flex-1">
          <p className={`text-lg font-bold ${s.color}`}>{s.label}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-3xl font-black ${s.color}`}>{geral.pct}%</span>
            <span className="text-sm text-slate-500">Score da Área</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Form NaoConformidade ──────────────────────────────────
function FormNaoConformidade({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || { problema: "", local: "", categoria: "outro", responsavel: "", prazo: "", foto: "" });
  const [uploading, setUploading] = useState(false);

  const handleFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, foto: file_url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.problema || !form.local) return;
    onSubmit(form);
    setForm({ problema: "", local: "", categoria: "outro", responsavel: "", prazo: "", foto: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            {initialData ? "Editar Não Conformidade" : "Nova Não Conformidade"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={form.categoria} onValueChange={v => setForm(p => ({ ...p, categoria: v }))}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ferramenta">🔧 Ferramenta</SelectItem>
              <SelectItem value="calibracao">📐 Calibração</SelectItem>
              <SelectItem value="etiqueta">🏷️ Etiqueta</SelectItem>
              <SelectItem value="bancada">🪑 Bancada</SelectItem>
              <SelectItem value="5s">✨ 5S</SelectItem>
              <SelectItem value="epi">🦺 EPI</SelectItem>
              <SelectItem value="seguranca">🛡️ Segurança</SelectItem>
              <SelectItem value="auditoria">📋 Auditoria</SelectItem>
              <SelectItem value="outro">📌 Outro</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Local (ex: Tacto 3, Bancada 2)" value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))} />
          <Textarea placeholder="Descreva o problema encontrado..." value={form.problema} onChange={e => setForm(p => ({ ...p, problema: e.target.value }))} className="min-h-[80px]" />
          <Input placeholder="Responsável" value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))} />
          <Input type="date" value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))} />
          <div>
            <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">{uploading ? "Enviando..." : form.foto ? "Foto anexada ✓" : "Tirar foto / Anexar evidência"}</span>
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
          </div>
          {form.foto && (
            <img src={form.foto} alt="Evidência" className="rounded-lg max-h-40 object-cover w-full" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-1" /> Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── PlanoAcaoModal ────────────────────────────────────────
function PlanoAcaoModal({ nc, open, onClose, onSave }) {
  const [form, setForm] = useState({ responsavel: nc?.responsavel || "", prazo: nc?.prazo || "", descricao: "" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Criar Plano de Ação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{nc?.problema}</p>
          <Input placeholder="Responsável pelo plano" value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))} />
          <Input type="date" value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))} />
          <Textarea placeholder="Descreva o plano de ação..." value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Depois</Button>
          <Button onClick={() => onSave(form)} className="bg-blue-600 hover:bg-blue-700">
            <Target className="w-4 h-4 mr-1" /> Criar Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── NaoConformidadeCard ───────────────────────────────────
function NaoConformidadeCard({ nc, onStatusChange, onPlanoAcao, onEdit }) {
  const s = STATUS_BADGE[nc.status];
  const Icon = s.icon;
  const CatIcon = CATEGORIA_ICON[nc.categoria] || Zap;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${nc.status === 'aberta' ? 'bg-red-100' : nc.status === 'em_andamento' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              <CatIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={s.color}><Icon className="w-3 h-3 mr-1" />{s.label}</Badge>
                <span className="text-xs text-slate-400">{nc.categoria}</span>
              </div>
              <p className="font-medium text-slate-900 text-sm">{nc.problema}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{nc.local}</span>
                {nc.responsavel && <span>👤 {nc.responsavel}</span>}
                {nc.prazo && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(nc.prazo).toLocaleDateString('pt-BR')}</span>}
              </div>
            </div>
            {nc.foto && (
              <img src={nc.foto} alt="Evidência" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            )}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onEdit(nc)}>
              Editar
            </Button>
            {nc.status === "aberta" && (
              <>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onStatusChange(nc, "em_andamento")}>
                  Iniciar
                </Button>
                <Button size="sm" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onPlanoAcao(nc)}>
                  <Target className="w-3 h-3 mr-1" /> Plano
                </Button>
              </>
            )}
            {nc.status === "em_andamento" && (
              <Button size="sm" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => onStatusChange(nc, "resolvida")}>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Resolver
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── IA Insight Component ──────────────────────────────────
function ChefinhoInsight({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-900 text-sm">Chefinho IA</p>
            <p className="text-xs text-blue-600">Análise de tendências</p>
          </div>
        </div>
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 py-2 border-t border-blue-100">
            <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">{insight.mensagem}</p>
              {insight.sugestao && (
                <p className="text-xs text-blue-600 mt-1 font-medium">💡 {insight.sugestao}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────
export default function SaudeAreaPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNC, setEditingNC] = useState(null);
  const [planoAcaoNC, setPlanoAcaoNC] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  // ── Data Fetching ──
  const { data: naoConformidades = [], isLoading: loadingNC } = useQuery({
    queryKey: ['naoConformidades'],
    queryFn: () => base44.entities.NaoConformidade.list('-created_date', 100),
  });

  const { data: ferramentas = [] } = useQuery({
    queryKey: ['ferramentasSaude'],
    queryFn: () => base44.entities.Ferramenta.list(),
  });

  const { data: calibracoes = [] } = useQuery({
    queryKey: ['calibracoesSaude'],
    queryFn: () => base44.entities.Calibracao.list(),
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ['auditoriasSaude'],
    queryFn: () => base44.entities.AuditoriaProcesso.list('-created_date', 100),
  });

  const { data: atividades = [] } = useQuery({
    queryKey: ['atividadesSaude'],
    queryFn: () => base44.entities.AtividadeMonitor.list('-created_date', 100),
  });

  // ── Mutations ──
  const createNC = useMutation({
    mutationFn: (data) => base44.entities.NaoConformidade.create({ ...data, criado_por: currentUser?.full_name || "Monitor", equipe: currentUser?.equipe || "", area: currentUser?.area || "" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['naoConformidades'] }),
  });

  const updateNC = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NaoConformidade.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['naoConformidades'] }),
  });

  // ── Score Calculation ──
  const hoje = new Date().toISOString().split('T')[0];
  const em30dias = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const pontuacoes = useMemo(() => {
    const totalFerramentas = ferramentas.length;
    const ferramentasOK = ferramentas.filter(f => f.status === "ativo" || !f.status).length;

    const totalCalibracoes = calibracoes.length;
    const calibracoesOK = calibracoes.filter(c => {
      if (!c.data_proxima_calibracao && !c.proxima_calibracao) return true;
      const data = c.data_proxima_calibracao || c.proxima_calibracao;
      return data > hoje;
    }).length;

    const auditoriasConcluidas = auditorias.filter(a => a.conformidade === "conforme" || a.conformidade === "resolvido").length;
    const totalAuditorias = auditorias.length;

    const atividadesConcluidas = atividades.filter(a => a.status === "concluido").length;
    const totalAtividades = atividades.length;

    const ncResolvidas = naoConformidades.filter(n => n.status === "resolvida").length;
    const totalNC = naoConformidades.length;

    return [
      { key: "ferramentas", label: "Ferramentas", icon: Wrench, valor: ferramentasOK, total: totalFerramentas, pct: totalFerramentas > 0 ? Math.round((ferramentasOK / totalFerramentas) * 100) : 100 },
      { key: "calibracao", label: "Calibração", icon: Gauge, valor: calibracoesOK, total: totalCalibracoes, pct: totalCalibracoes > 0 ? Math.round((calibracoesOK / totalCalibracoes) * 100) : 100 },
      { key: "auditorias", label: "Auditorias", icon: ClipboardList, valor: auditoriasConcluidas, total: totalAuditorias, pct: totalAuditorias > 0 ? Math.round((auditoriasConcluidas / totalAuditorias) * 100) : 100 },
      { key: "atividades", label: "Atividades", icon: Activity, valor: atividadesConcluidas, total: totalAtividades, pct: totalAtividades > 0 ? Math.round((atividadesConcluidas / totalAtividades) * 100) : 100 },
      { key: "naoConformidades", label: "Não Conf.", icon: XCircle, valor: ncResolvidas, total: totalNC, pct: totalNC > 0 ? Math.round((ncResolvidas / totalNC) * 100) : 100 },
    ];
  }, [ferramentas, calibracoes, auditorias, atividades, naoConformidades]);

  // ── Audit Readiness ──
  const analiseAuditoria = useMemo(() => {
    const ferramentasFora = ferramentas.filter(f => f.status && f.status !== "ativo").length;
    const calibracoesVencidas = calibracoes.filter(c => {
      const data = c.data_proxima_calibracao || c.proxima_calibracao;
      return data && data <= hoje;
    }).length;
    const calibracoesProximas = calibracoes.filter(c => {
      const data = c.data_proxima_calibracao || c.proxima_calibracao;
      return data && data > hoje && data <= em30dias;
    }).length;
    const auditoriasPendentes = auditorias.filter(a => a.conformidade === "nao_conforme").length;
    const atividadesAtrasadas = atividades.filter(a => a.status === "atrasado").length;
    const ncAbertas = naoConformidades.filter(n => n.status === "aberta").length;

    const problemas = [];
    if (ferramentasFora > 0) problemas.push(`${ferramentasFora} ferramenta(s) fora de uso`);
    if (calibracoesVencidas > 0) problemas.push(`${calibracoesVencidas} calibração(ões) vencida(s)`);
    if (calibracoesProximas > 0) problemas.push(`${calibracoesProximas} calibração(ões) vencem em 30 dias`);
    if (auditoriasPendentes > 0) problemas.push(`${auditoriasPendentes} auditoria(s) com não conformidade`);
    if (atividadesAtrasadas > 0) problemas.push(`${atividadesAtrasadas} atividade(s) atrasada(s)`);
    if (ncAbertas > 0) problemas.push(`${ncAbertas} não conformidade(s) aberta(s)`);

    const pronto = problemas.length === 0;
    return {
      pronto,
      status: pronto ? "ok" : ferramentasFora > 0 || calibracoesVencidas > 0 ? "risco" : "atencao",
      problemas,
      detalhes: { ferramentasFora, calibracoesVencidas, calibracoesProximas, auditoriasPendentes, atividadesAtrasadas, ncAbertas }
    };
  }, [ferramentas, calibracoes, auditorias, atividades, naoConformidades]);

  // ── IA Insights ──
  const insights = useMemo(() => {
    const resultado = [];
    const ncPorCategoria = {};
    naoConformidades.forEach(nc => {
      if (!ncPorCategoria[nc.categoria]) ncPorCategoria[nc.categoria] = [];
      ncPorCategoria[nc.categoria].push(nc);
    });

    Object.entries(ncPorCategoria).forEach(([cat, items]) => {
      if (items.length >= 3) {
        resultado.push({
          mensagem: `A categoria "${cat}" teve ${items.length} não conformidades recentemente.`,
          sugestao: cat === "etiqueta" ? "Realizar revisão completa das etiquetas e plaquetas." :
                    cat === "calibracao" ? "Verificar cronograma de calibração preventiva." :
                    cat === "5s" ? "Reforçar rotina 5S com checklist diário." :
                    cat === "ferramenta" ? "Avaliar necessidade de substituição ou manutenção preventiva." :
                    `Criar plano de ação específico para ${cat}.`
        });
      }
    });

    if (atividades.filter(a => a.status === "atrasado").length >= 5) {
      resultado.push({
        mensagem: "Alto número de atividades atrasadas detectado.",
        sugestao: "Revisar distribuição de tarefas e prazos com a equipe."
      });
    }

    return resultado.slice(0, 3);
  }, [naoConformidades, atividades]);

  // ── Handlers ──
  const handleCreateNC = (data) => createNC.mutate(data);
  const handleUpdateNC = (data) => updateNC.mutate({ id: editingNC.id, data });
  const handleStatusChange = (nc, newStatus) => updateNC.mutate({ id: nc.id, data: { status: newStatus } });
  const handlePlanoSave = (plano) => {
    updateNC.mutate({
      id: planoAcaoNC.id,
      data: {
        plano_acao: plano.descricao,
        plano_responsavel: plano.responsavel,
        plano_prazo: plano.prazo,
        plano_status: "em_andamento"
      }
    });
    setPlanoAcaoNC(null);
  };

  const handleVerificarProntidao = () => {
    setVerificando(true);
    setTimeout(() => setVerificando(false), 2000);
  };

  // ── Filters ──
  const filteredNC = naoConformidades.filter(nc => {
    if (filtroStatus !== "todas" && nc.status !== filtroStatus) return false;
    if (searchTerm && !nc.problema?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !nc.local?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // ── Render ──
  if (loadingNC && !currentUser) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saúde da Área</h1>
          <p className="text-sm text-slate-500">Radar de auditoria e preparação</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleVerificarProntidao} size="sm" variant="outline" className="gap-1.5" disabled={verificando}>
            {verificando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {verificando ? "Analisando..." : "Verificar Prontidão"}
          </Button>
          <Button onClick={() => { setEditingNC(null); setShowForm(true); }} size="sm" className="bg-red-600 hover:bg-red-700 gap-1.5">
            <Plus className="w-4 h-4" /> Não Conformidade
          </Button>
        </div>
      </div>

      {/* Indicador Geral */}
      <IndicadorGeral pontuacoes={pontuacoes} />

      {/* Resultado Verificação */}
      <AnimatePresence>
        {verificando && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="font-bold text-blue-700">Analisando área...</p>
            <p className="text-sm text-blue-500 mt-1">Verificando ferramentas, calibrações, auditorias e pendências</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!verificando && analiseAuditoria.problemas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 p-5 ${analiseAuditoria.status === 'risco' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            {analiseAuditoria.status === 'risco' ? <XCircle className="w-5 h-5 text-red-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            <p className={`font-bold ${analiseAuditoria.status === 'risco' ? 'text-red-700' : 'text-amber-700'}`}>
              {analiseAuditoria.status === 'risco' ? 'Área com riscos — Corrigir antes da auditoria' : 'Atenção — Itens a corrigir'}
            </p>
          </div>
          <ul className="space-y-1.5">
            {analiseAuditoria.problemas.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Score Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Score por Categoria
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {pontuacoes.map(p => (
            <ScoreCard key={p.key} {...p} />
          ))}
        </div>
      </div>

      {/* IA Insights */}
      {insights.length > 0 && <ChefinhoInsight insights={insights} />}

      {/* Radar: Alertas Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-black text-red-600">{analiseAuditoria.detalhes.ncAbertas}</p>
            <p className="text-xs text-red-700 font-medium">Não Conf. Abertas</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-black text-amber-600">{analiseAuditoria.detalhes.calibracoesVencidas}</p>
            <p className="text-xs text-amber-700 font-medium">Calibrações Vencidas</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-black text-blue-600">{analiseAuditoria.detalhes.calibracoesProximas}</p>
            <p className="text-xs text-blue-700 font-medium">Vencem em 30 dias</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-black text-purple-600">{analiseAuditoria.detalhes.atividadesAtrasadas}</p>
            <p className="text-xs text-purple-700 font-medium">Atividades Atrasadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Não Conformidades */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Não Conformidades
          </h2>
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="aberta">🔴 Abertas</SelectItem>
                <SelectItem value="em_andamento">🟡 Em andamento</SelectItem>
                <SelectItem value="resolvida">🟢 Resolvidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filteredNC.map(nc => (
              <NaoConformidadeCard
                key={nc.id}
                nc={nc}
                onStatusChange={handleStatusChange}
                onPlanoAcao={setPlanoAcaoNC}
                onEdit={(nc) => { setEditingNC(nc); setShowForm(true); }}
              />
            ))}
          </AnimatePresence>
          {filteredNC.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm">Nenhuma não conformidade encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <FormNaoConformidade
        open={showForm}
        onClose={() => { setShowForm(false); setEditingNC(null); }}
        onSubmit={editingNC ? handleUpdateNC : handleCreateNC}
        initialData={editingNC}
      />
      {planoAcaoNC && (
        <PlanoAcaoModal
          nc={planoAcaoNC}
          open={!!planoAcaoNC}
          onClose={() => setPlanoAcaoNC(null)}
          onSave={handlePlanoSave}
        />
      )}
    </div>
  );
}