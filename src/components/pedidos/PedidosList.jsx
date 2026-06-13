import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, Download, Users, ShoppingCart, ChevronDown, ChevronUp, AlertTriangle, Filter, Search } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pendente:  { label: "Pendente",  className: "bg-amber-100 text-amber-800" },
  aprovado:  { label: "Aprovado",  className: "bg-green-100 text-green-800" },
  reprovado: { label: "Reprovado", className: "bg-red-100 text-red-800" },
  entregue:  { label: "Entregue",  className: "bg-blue-100 text-blue-800" },
};

function PedidoCard({ pedido, hasLeaderAccess, onEdit, onDelete, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`border transition-all active:scale-[0.99] ${pedido.urgencia === "urgente" ? "border-red-200 bg-red-50/20" : "border-slate-200"}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
        pedido.status === "entregue" ? "bg-blue-500" :
        pedido.status === "aprovado" ? "bg-green-500" :
        pedido.status === "reprovado" ? "bg-red-400" : "bg-[#0066b1]"
        }`}>
        <ShoppingCart className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{pedido.item}</h3>
            <p className="text-[11px] text-slate-500">{pedido.solicitante || pedido.solicitante_full_name}</p>
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            {hasLeaderAccess && pedido.status === "pendente" && (
              <>
                <button onClick={() => onUpdateStatus(pedido.id, "aprovado")}
                  className="w-8 h-8 rounded-lg bg-green-50 text-green-600 active:bg-green-200 flex items-center justify-center touch-manipulation" title="Aprovar">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onUpdateStatus(pedido.id, "reprovado")}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 active:bg-red-200 flex items-center justify-center touch-manipulation" title="Reprovar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {hasLeaderAccess && pedido.status === "aprovado" && (
              <button onClick={() => onUpdateStatus(pedido.id, "entregue")}
                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 active:bg-blue-200 flex items-center justify-center touch-manipulation" title="Marcar como entregue">
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => onEdit(pedido)}
              className="w-8 h-8 rounded-lg text-slate-400 active:bg-blue-50 active:text-blue-600 flex items-center justify-center touch-manipulation">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(pedido.id)}
              className="w-8 h-8 rounded-lg text-slate-400 active:bg-red-50 active:text-red-600 flex items-center justify-center touch-manipulation">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_CONFIG[pedido.status]?.className}`}>
                {STATUS_CONFIG[pedido.status]?.label || pedido.status}
              </Badge>
              {pedido.urgencia === "urgente" && (
                <Badge className="text-[10px] px-1.5 py-0 bg-red-500 text-white flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> Urgente
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Qtd: {pedido.quantidade}</Badge>
              {pedido.equipe && <Badge variant="outline" className="text-[10px] px-1.5 py-0"><Users className="w-2.5 h-2.5 mr-0.5" />{pedido.equipe}</Badge>}
            </div>

            <div className="flex items-center justify-between mt-2">
              <button onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Menos" : "Detalhes"}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {pedido.data_solicitacao && (
                      <p><span className="text-slate-400">Data:</span> {format(new Date(pedido.data_solicitacao), "dd/MM/yyyy")}</p>
                    )}
                    {pedido.justificativa && (
                      <p><span className="text-slate-400">Justificativa:</span> {pedido.justificativa}</p>
                    )}
                    {pedido.turno && (
                      <p><span className="text-slate-400">Turno:</span> {pedido.turno}</p>
                    )}
                    {pedido.celula && (
                      <p><span className="text-slate-400">Célula:</span> {pedido.celula}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PedidosList({ pedidos, onEdit, onDelete, onUpdateStatus, currentUser }) {
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const hasLeaderAccess = currentUser?.cargo === "lider" ||
    (currentUser?.cargo_temporario === "lider" && currentUser?.data_cargo_temporario &&
      new Date(currentUser.data_cargo_temporario) >= new Date());

  const exportarCSV = () => {
    if (pedidos.length === 0) return;
    const dados = pedidos.map(p => ({
      'Solicitante': p.solicitante || p.solicitante_full_name,
      'Item': p.item, 'Quantidade': p.quantidade,
      'Status': p.status, 'Urgência': p.urgencia,
      'Equipe': p.equipe || '-', 'Turno': p.turno || '-',
      'Data': p.data_solicitacao ? format(new Date(p.data_solicitacao), "dd/MM/yyyy") : '-',
      'Justificativa': p.justificativa || '-',
    }));
    const header = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_epi_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };

  const [buscaItem, setBuscaItem] = useState("");
  const pedidosFiltradosPorStatus = filtroStatus === "todos" ? pedidos : pedidos.filter(p => p.status === filtroStatus);
  const pedidosFiltrados = !buscaItem.trim() ? pedidosFiltradosPorStatus : pedidosFiltradosPorStatus.filter(p =>
    p.item?.toLowerCase().includes(buscaItem.toLowerCase()) ||
    p.solicitante?.toLowerCase().includes(buscaItem.toLowerCase()) ||
    p.solicitante_full_name?.toLowerCase().includes(buscaItem.toLowerCase()) ||
    p.equipe?.toLowerCase().includes(buscaItem.toLowerCase())
  );
  const contagens = { todos: pedidos.length, pendente: 0, aprovado: 0, reprovado: 0, entregue: 0 };
  pedidos.forEach(p => { if (contagens[p.status] !== undefined) contagens[p.status]++; });

  return (
    <div className="space-y-3">
      {/* Busca rápida */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por item, solicitante ou equipe..."
          value={buscaItem}
          onChange={e => setBuscaItem(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {buscaItem && (
          <button onClick={() => setBuscaItem("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
        )}
      </div>

      {/* Filtros + export */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        {Object.entries({ todos: "Todos", pendente: "Pend.", aprovado: "Aprov.", reprovado: "Reprov.", entregue: "Entreg." }).map(([key, label]) => (
          <button key={key} onClick={() => setFiltroStatus(key)}
            className={`flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border transition-all font-medium touch-manipulation min-h-[32px] ${
              filtroStatus === key ? "bg-[#0066b1] text-white border-[#0066b1]" : "border-slate-200 text-slate-600 bg-white"
            }`}>
            {label} <span className="opacity-70">({contagens[key] ?? 0})</span>
          </button>
        ))}
        <Button onClick={exportarCSV} variant="outline" size="sm"
          className="flex-shrink-0 h-7 text-[11px] bg-green-50 hover:bg-green-100 text-green-700 border-green-200 ml-auto">
          <Download className="w-3 h-3 mr-1" /> CSV
        </Button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">Nenhum pedido {filtroStatus !== "todos" ? `com status "${filtroStatus}"` : "encontrado"}</p>
        </div>
      ) : (
        <AnimatePresence>
          {pedidosFiltrados.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}>
              <PedidoCard pedido={p} hasLeaderAccess={hasLeaderAccess}
                onEdit={onEdit} onDelete={onDelete} onUpdateStatus={onUpdateStatus} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}