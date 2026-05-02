import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

function formatMoeda(val) {
  return `R$ ${(val || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function getInicioSemana() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ResumoSemanalPDF({ currentUser }) {
  const [loading, setLoading] = useState(false);

  const gerar = async () => {
    setLoading(true);

    const inicioSemana = getInicioSemana();
    const equipe = currentUser?.equipe;

    const [tarefas, pedidos, atividades, versatilidades] = await Promise.all([
      base44.entities.TarefaMonitor.list("-created_date"),
      base44.entities.PedidoEPI.list("-created_date"),
      base44.entities.AtividadeLogistica.list("-created_date"),
      base44.entities.Versatilidade.list(),
    ]);

    // Filtra pela semana e equipe
    const filtraSemana = (arr) => arr.filter(x => {
      const d = new Date(x.created_date || x.updated_date);
      return d >= inicioSemana;
    });
    const filtraEquipe = (arr) => equipe ? arr.filter(x => !x.equipe || x.equipe === equipe) : arr;

    const tarefasSemana = filtraSemana(tarefas);
    const pedidosSemana = filtraSemana(filtraEquipe(pedidos));
    const atividadesSemana = filtraSemana(atividades);
    const colabs = filtraEquipe(versatilidades);

    const gastosSemana = pedidosSemana
      .filter(p => p.status === "aprovado" || p.status === "entregue")
      .reduce((s, p) => s + (p.valor_total || 0), 0);

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 0;

    // ── Header ────────────────────────────────────────────────────────
    doc.setFillColor(0, 30, 80);
    doc.rect(0, 0, W, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("VW Chefinho — Resumo Semanal", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    doc.text(`Equipe: ${equipe || "Geral"}  |  Gerado em: ${hoje}`, 14, 22);
    y = 36;

    // ── Seção helper ─────────────────────────────────────────────────
    const secao = (titulo, corHex) => {
      doc.setFillColor(...hexToRgb(corHex));
      doc.roundedRect(10, y, W - 20, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(titulo, 14, y + 5.5);
      doc.setTextColor(30, 30, 30);
      y += 12;
    };

    const linha = (label, valor, negrito = false) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", negrito ? "bold" : "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(label, 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(String(valor), 100, y);
      y += 6;
    };

    const separador = () => {
      doc.setDrawColor(220, 220, 220);
      doc.line(10, y, W - 10, y);
      y += 4;
    };

    // ── Tarefas ───────────────────────────────────────────────────────
    secao("📋  Tarefas da Semana", "#0066b1");
    linha("Total de tarefas:", tarefasSemana.length);
    linha("Concluídas:", tarefasSemana.filter(t => t.status === "concluida").length);
    linha("Em andamento:", tarefasSemana.filter(t => t.status === "em_andamento").length);
    linha("Pendentes:", tarefasSemana.filter(t => t.status === "pendente").length);
    const produtiv = tarefasSemana.length > 0
      ? Math.round((tarefasSemana.filter(t => t.status === "concluida").length / tarefasSemana.length) * 100)
      : 0;
    linha("Produtividade:", `${produtiv}%`, true);
    separador();

    // ── Gastos EPI ────────────────────────────────────────────────────
    secao("🛡️  Pedidos EPI da Semana", "#059669");
    linha("Total de pedidos:", pedidosSemana.length);
    linha("Aprovados:", pedidosSemana.filter(p => p.status === "aprovado").length);
    linha("Pendentes:", pedidosSemana.filter(p => p.status === "pendente").length);
    linha("Reprovados:", pedidosSemana.filter(p => p.status === "reprovado").length);
    linha("Gastos aprovados:", formatMoeda(gastosSemana), true);
    separador();

    // ── Logística ─────────────────────────────────────────────────────
    secao("🚚  Logística da Semana", "#d97706");
    linha("Total de atividades:", atividadesSemana.length);
    linha("Concluídas:", atividadesSemana.filter(a => a.status === "concluida").length);
    linha("Urgentes:", atividadesSemana.filter(a => a.prioridade === "urgente").length);
    separador();

    // ── Equipe ────────────────────────────────────────────────────────
    secao("👷  Equipe", "#7c3aed");
    linha("Colaboradores cadastrados:", colabs.length);
    linha("Disponíveis:", colabs.filter(c => c.disponibilidade === "disponivel").length);
    linha("Em treinamento:", colabs.filter(c => c.disponibilidade !== "disponivel").length);
    separador();

    // ── Top pedidos ───────────────────────────────────────────────────
    if (pedidosSemana.length > 0) {
      y += 2;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Detalhes dos Pedidos EPI:", 14, y);
      y += 6;
      pedidosSemana.slice(0, 8).forEach(p => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const status = { pendente: "⏳", aprovado: "✅", reprovado: "❌", entregue: "📦" }[p.status] || "";
        doc.text(`${status} ${p.item} — ${p.solicitante || p.solicitante_full_name || ""} — ${formatMoeda(p.valor_total)}`, 16, y);
        y += 5;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    // ── Rodapé ────────────────────────────────────────────────────────
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`VW Chefinho — Página ${i}/${pages}`, W / 2, 290, { align: "center" });
    }

    const filename = `resumo_semanal_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    setLoading(false);
  };

  return (
    <Button
      onClick={gerar}
      disabled={loading}
      variant="outline"
      size="sm"
      className="h-8 text-xs border-green-300 text-green-700 bg-green-50 hover:bg-green-100 gap-1.5"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
      {loading ? "Gerando..." : "PDF Semanal"}
    </Button>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}