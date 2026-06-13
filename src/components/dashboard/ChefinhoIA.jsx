import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, FileText, Calendar, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function ChefinhoIA({ kpis, currentUser }) {
  const [tipoRelatorio, setTipoRelatorio] = useState(null);
  const [relatorio, setRelatorio] = useState("");
  const [loading, setLoading] = useState(false);

  const gerarRelatorio = async (tipo) => {
    setTipoRelatorio(tipo);
    setLoading(true);
    setRelatorio("");

    try {
      // Monta contexto dos KPIs
      const contexto = {
        data: format(new Date(), "dd/MM/yyyy"),
        usuario: currentUser?.nome_exibicao || currentUser?.full_name,
        equipe: currentUser?.equipe || "Todas",
        ferramentas: { total: kpis.ferramentas, ativas: kpis.ferramentasAtivas },
        calibracoes: { total: kpis.calTotal, ok: kpis.calStatus.ok, vence30: kpis.calStatus.vence30, vence15: kpis.calStatus.vence15, vencido: kpis.calStatus.vencido },
        auditorias: { total: kpis.audTotal, conforme: kpis.audStatus.conforme, naoConforme: kpis.audStatus.naoConforme },
        cincoS: kpis.ultimo5S ? { pontuacao: kpis.ultimo5S.pontuacao_total, totalAvaliacoes: kpis.cincoSTotal } : null,
        atividades: { total: kpis.ativTotal, concluidas: kpis.ativStatus.concluidas, atrasadas: kpis.ativStatus.atrasadas, emAndamento: kpis.ativStatus.emAndamento },
        bancadas: kpis.bancadas,
        etiquetas: { total: kpis.etiquetas, criticas: kpis.etiqCriticas },
        faixas: { total: kpis.faixas, criticas: kpis.faixasCriticas },
      };

      const promptTemplates = {
        diario: `Gere um RELATÓRIO DIÁRIO DE AUDITORIA OPERACIONAL do sistema VW Chefinho GLS com os seguintes dados:

${JSON.stringify(contexto, null, 2)}

Formato exigido (use markdown):
## 📊 Relatório Diário — ${contexto.data}

### ✅ Atividades Realizadas
- Liste atividades concluídas e em andamento

### ⚠️ Pendências e Alertas
- Calibrações vencidas ou próximas
- Não conformidades de auditoria
- Atividades atrasadas

### 🔧 Ferramentas e Equipamentos
- Status das ferramentas ativas
- Calibrações críticas

### 📈 Indicadores do Dia
- Resuma os números principais

Seja direto, objetivo e use linguagem industrial. Destaque itens críticos com ⚠️. Não invente dados.`,

        semanal: `Gere um RELATÓRIO SEMANAL DE CONFORMIDADE do sistema VW Chefinho GLS com os seguintes dados:

${JSON.stringify(contexto, null, 2)}

Formato exigido (use markdown):
## 📊 Relatório Semanal — ${contexto.data}

### 📈 Resumo da Semana
- Visão geral dos indicadores

### ⚠️ Itens Críticos
- Calibrações vencidas
- Não conformidades recorrentes
- Atividades atrasadas

### 📉 Tendências
- Analise padrões

### 🔍 Auditorias Realizadas
- Conformidade geral

### 🎯 Recomendações
- Sugira ações prioritárias

Seja analítico e propositivo. Destaque tendências. Não invente dados.`,

        mensal: `Gere um RELATÓRIO MENSAL CONSOLIDADO do sistema VW Chefinho GLS com os seguintes dados:

${JSON.stringify(contexto, null, 2)}

Formato exigido (use markdown):
## 📊 Relatório Mensal Consolidado — ${contexto.data}

### 📜 Histórico do Período
- Evolução dos indicadores

### ❌ Não Conformidades Recorrentes
- Padrões identificados

### 🌟 Evolução 5S
- Análise da pontuação

### 🔧 Equipamentos Críticos
- Calibrações e vencimentos

### 💡 Sugestões de Melhoria
- Recomendações para o próximo período

### 🎯 Preparação para Auditoria
- Status geral de conformidade

Seja estratégico e focado em melhoria contínua. Não invente dados.`,
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: promptTemplates[tipo],
        add_context_from_internet: false,
      });

      setRelatorio(result.data || result);
    } catch (e) {
      setRelatorio("Erro ao gerar relatório. Tente novamente.");
    }
    setLoading(false);
  };

  const exportarPDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Relatório Chefinho IA</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; color: #1a1a2e; }
        h1 { color: #001e50; font-size: 24px; }
        h2 { color: #0066b1; font-size: 18px; border-bottom: 2px solid #0066b1; padding-bottom: 4px; margin-top: 24px; }
        h3 { font-size: 14px; color: #333; }
        p, li { font-size: 13px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .header p { color: #666; font-size: 12px; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
      </style></head><body>
      <div class="header"><h1>VW Chefinho GLS</h1><p>${tipoRelatorio === "diario" ? "Relatório Diário" : tipoRelatorio === "semanal" ? "Relatório Semanal" : "Relatório Mensal"} — ${format(new Date(), "dd/MM/yyyy")}</p></div>
      ${relatorio}
      <div class="footer">Gerado por Chefinho IA — VW Chefinho GLS</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-violet-900">Chefinho IA</h3>
              <p className="text-[10px] text-violet-500">Inteligência Artificial para Auditoria Operacional</p>
            </div>
          </div>

          {!tipoRelatorio && !loading && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 mb-2">Selecione o tipo de relatório:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tipo: "diario", label: "Diário", icon: Calendar, desc: "Atividades e pendências do dia" },
                  { tipo: "semanal", label: "Semanal", icon: TrendingUp, desc: "Resumo e tendências da semana" },
                  { tipo: "mensal", label: "Mensal", icon: FileText, desc: "Histórico e melhoria contínua" },
                ].map(({ tipo, label, icon: Icon, desc }) => (
                  <button key={tipo} onClick={() => gerarRelatorio(tipo)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-violet-200 hover:border-violet-400 hover:bg-violet-50 active:bg-violet-100 transition-all text-center">
                    <Icon className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold text-violet-900">{label}</span>
                    <span className="text-[9px] text-slate-400 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center py-6 gap-2">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              <p className="text-sm text-violet-700 font-medium">Gerando relatório {tipoRelatorio}...</p>
              <p className="text-[10px] text-slate-400">A IA está analisando todos os dados do sistema</p>
            </div>
          )}

          {relatorio && !loading && (
            <div>
              <div className="flex gap-1.5 mb-3">
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={exportarPDF}>
                  <Download className="w-3 h-3" /> PDF
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setTipoRelatorio(null); setRelatorio(""); }}>
                  Novo Relatório
                </Button>
              </div>
              <div className="bg-white rounded-xl p-4 border border-violet-100 prose prose-sm max-w-none prose-headings:text-[#001e50] prose-h2:text-[#0066b1] prose-h2:border-b prose-h2:border-violet-100 prose-h2:pb-1 prose-p:text-slate-700 prose-li:text-slate-600">
                <ReactMarkdown>{relatorio}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}