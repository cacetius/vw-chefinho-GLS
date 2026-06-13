import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Zap, Download, Calendar, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format, differenceInDays } from "date-fns";

export default function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState("");

  const { data: contexto = null } = useQuery({
    queryKey: ["relatorio-contexto"],
    queryFn: async () => {
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const [ferr, cal, auds, cincoS, ativ] = await Promise.all([
        base44.entities.Ferramenta.list(),
        base44.entities.Calibracao.list(),
        base44.entities.AuditoriaProcesso.list("-data", 50),
        base44.entities.CincoS.list("-data", 10),
        base44.entities.AtividadeMonitor.list("-data", 50),
      ]);

      const calVencidas = cal.filter(c => c.data_vencimento && differenceInDays(new Date(c.data_vencimento + "T00:00:00"), hoje) < 0).length;
      const audNC = auds.filter(a => a.conformidade === "nao_conforme").length;
      const ultimo5S = cincoS.length > 0 ? cincoS[0] : null;

      return {
        data: format(hoje, "dd/MM/yyyy"),
        ferramentas: ferr.length,
        calibracoes: cal.length,
        calibracoesVencidas: calVencidas,
        auditorias: auds.length,
        naoConformidades: audNC,
        cincoS: ultimo5S ? `${ultimo5S.pontuacao_total}/50` : "Sem dados",
        atividades: ativ.filter(a => a.status === "concluido").length,
        atividadesTotal: ativ.length,
      };
    },
    refetchInterval: 300000
  });

  const gerar = async (tipo) => {
    setLoading(true);
    setRelatorio("");

    const prompts = {
      diario: `Gere um relatório diário de auditoria operacional VW Chefinho GLS.

Dados atuais: ${JSON.stringify(contexto)}

Formato markdown. Inclua:
- ✅ Atividades concluídas hoje
- ⚠️ Pendências e alertas
- 🔧 Status de ferramentas e calibrações
- 📈 Indicadores do dia

Seja direto e objetivo. Destaque itens críticos com ⚠️.`,

      semanal: `Gere um relatório semanal de conformidade VW Chefinho GLS.

Dados atuais: ${JSON.stringify(contexto)}

Formato markdown. Inclua:
- 📈 Resumo da semana
- ⚠️ Itens críticos
- 📉 Tendências
- 🎯 Recomendações

Seja analítico. Destaque padrões e tendências.`,

      mensal: `Gere um relatório mensal consolidado VW Chefinho GLS.

Dados atuais: ${JSON.stringify(contexto)}

Formato markdown. Inclua:
- 📜 Histórico do período
- ❌ Não conformidades recorrentes
- 🌟 Evolução 5S
- 💡 Sugestões de melhoria
- 🎯 Preparação para auditoria

Seja estratégico. Foco em melhoria contínua.`,
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt: prompts[tipo] });
      setRelatorio(result.data || result);
    } catch (e) {
      setRelatorio("Erro ao gerar. Tente novamente.");
    }
    setLoading(false);
  };

  const imprimir = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Relatório VW Chefinho</title><style>body{font-family:Arial;padding:30px;max-width:700px;margin:auto;color:#1a1a2e}h1{color:#001e50}h2{color:#0066b1;border-bottom:2px solid #0066b1;padding-bottom:4px;margin-top:20px}p,li{font-size:13px;line-height:1.6}.header{text-align:center;margin-bottom:20px}.footer{text-align:center;font-size:10px;color:#999;margin-top:30px;border-top:1px solid #eee;padding-top:15px}</style></head><body><div class="header"><h1>VW Chefinho GLS</h1><p>Relatório — ${format(new Date(), "dd/MM/yyyy")}</p></div>${relatorio}<div class="footer">Gerado por Chefinho IA</div></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="max-w-md mx-auto w-full px-1 space-y-3 pb-4">

      <div className="text-center py-2">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-extrabold text-[#001e50]">Relatórios</h1>
        <p className="text-[10px] text-slate-400">Chefinho IA gera automaticamente</p>
      </div>

      {/* Botões de relatório */}
      {!loading && !relatorio && (
        <div className="space-y-2">
          {[
            { tipo: "diario", label: "Relatório Diário", icon: Calendar, cor: "from-blue-600 to-blue-700", desc: "Atividades e pendências do dia" },
            { tipo: "semanal", label: "Relatório Semanal", icon: TrendingUp, cor: "from-emerald-600 to-teal-700", desc: "Resumo e tendências da semana" },
            { tipo: "mensal", label: "Relatório Mensal", icon: BarChart3, cor: "from-purple-600 to-violet-700", desc: "Histórico e melhoria contínua" },
          ].map(({ tipo, label, icon: Icon, cor, desc }) => (
            <motion.button key={tipo} whileTap={{ scale: 0.98 }}
              onClick={() => gerar(tipo)}
              className={`w-full bg-gradient-to-r ${cor} rounded-2xl p-4 text-white flex items-center gap-3 active:opacity-80 transition-all`}>
              <Icon className="w-6 h-6" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{label}</p>
                <p className="text-[10px] text-white/70">{desc}</p>
              </div>
              <Zap className="w-5 h-5 opacity-60" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-8 gap-2">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          <p className="text-sm font-bold text-violet-700">Gerando relatório...</p>
          <p className="text-[10px] text-slate-400">A IA está analisando todos os dados</p>
        </div>
      )}

      {/* Resultado */}
      {relatorio && !loading && (
        <div>
          <div className="flex gap-2 mb-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={imprimir}
              className="flex-1 py-2.5 bg-[#0066b1] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Imprimir PDF
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setRelatorio("")}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
              Novo Relatório
            </motion.button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 prose prose-sm max-w-none prose-headings:text-[#001e50] prose-h2:text-[#0066b1] prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-1 prose-p:text-slate-700 prose-li:text-slate-600">
            <ReactMarkdown>{relatorio}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}