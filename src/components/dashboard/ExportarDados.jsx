import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

function toCSV(rows) {
  if (!rows.length) return "";
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map(r =>
    Object.values(r).map(v => {
      const s = v == null ? "" : String(v).replace(/"/g, '""');
      return `"${s}"`;
    }).join(",")
  );
  return [header, ...body].join("\n");
}

function baixarCSV(nome, dados) {
  const csv = toCSV(dados);
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MODULOS = [
  { key: "PedidoEPI",         nome: "Pedidos_EPI" },
  { key: "TarefaMonitor",     nome: "Tarefas" },
  { key: "Objetivo",          nome: "Objetivos" },
  { key: "Aviso",             nome: "Avisos" },
  { key: "AuditoriaVDA",      nome: "Auditorias_VDA" },
  { key: "PlanoAcaoVDA",      nome: "Planos_Acao" },
  { key: "Versatilidade",     nome: "Versatilidade" },
  { key: "Ausencia",          nome: "Ausencias" },
  { key: "Treinamento",       nome: "Treinamentos" },
  { key: "Orcamento",         nome: "Orcamentos" },
  { key: "EstoqueEPI",        nome: "Estoque_EPI" },
  { key: "AtividadeLogistica",nome: "Logistica" },
];

export default function ExportarDados({ currentUser }) {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState("");

  const isAdmin = currentUser?.role === "admin" || currentUser?.cargo === "supervisor";
  if (!isAdmin) return null;

  const exportarTudo = async () => {
    setLoading(true);
    const hoje = format(new Date(), "yyyy-MM-dd");
    let totalRegistros = 0;

    for (const mod of MODULOS) {
      setProgresso(`Exportando ${mod.nome.replace(/_/g, " ")}...`);
      const dados = await base44.entities[mod.key].list();
      if (dados.length > 0) {
        // Achata arrays/objetos aninhados para CSV legível
        const flat = dados.map(row => {
          const r = {};
          for (const [k, v] of Object.entries(row)) {
            if (Array.isArray(v) || (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date))) {
              r[k] = JSON.stringify(v);
            } else {
              r[k] = v;
            }
          }
          return r;
        });
        baixarCSV(`VW_Chefinho_${mod.nome}_${hoje}.csv`, flat);
        totalRegistros += dados.length;
      }
      // Pequena pausa para não bloquear o navegador
      await new Promise(res => setTimeout(res, 300));
    }

    setProgresso(`✅ ${totalRegistros} registros exportados!`);
    setTimeout(() => { setLoading(false); setProgresso(""); }, 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">Exportar Dados Completos</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Baixa todos os módulos do app em arquivos CSV separados (EPI, Tarefas, Auditorias, Objetivos, Estoque, etc.)
          </p>
          {progresso && (
            <p className="text-[11px] text-[#0066b1] font-medium mt-1.5 flex items-center gap-1.5">
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              {progresso}
            </p>
          )}
        </div>
        <Button
          onClick={exportarTudo}
          disabled={loading}
          className="h-10 px-4 bg-[#0066b1] hover:bg-[#004d82] text-sm font-semibold flex-shrink-0 disabled:opacity-60"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><Download className="w-4 h-4 mr-1.5" /> Exportar</>
          }
        </Button>
      </div>

      {/* Lista de módulos */}
      <div className="mt-3 flex flex-wrap gap-1">
        {MODULOS.map(m => (
          <span key={m.key} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
            {m.nome.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}