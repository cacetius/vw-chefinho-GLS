import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  ShoppingCart,
  Users,
  MessageSquare,
  Target,
  Bell,
  Calendar,
  Star,
  Lightbulb,
  FileText,
  Car,
  ClipboardList
} from "lucide-react";
import { motion } from "framer-motion";

export default function AtalhosRapidos() {
  const shortcuts = [
    {
      title: "Linha de Produção",
      icon: Car,
      url: createPageUrl("LinhaProducao"),
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      description: "Monitore a produção"
    },
    {
      title: "Auditoria VDA",
      icon: ClipboardList,
      url: createPageUrl("AuditoriaVDA"),
      gradient: "from-indigo-500 via-purple-600 to-purple-700",
      description: "Checklists e auditorias"
    },
    {
      title: "Logística",
      icon: Truck,
      url: createPageUrl("Logistica"),
      gradient: "from-orange-500 via-red-500 to-red-600",
      description: "Gestão de entregas"
    },
    {
      title: "Pedidos EPI",
      icon: ShoppingCart,
      url: createPageUrl("PedidosEPI"),
      gradient: "from-purple-500 via-pink-500 to-pink-600",
      description: "Equipamentos de proteção"
    },
    {
      title: "Versatilidade",
      icon: Users,
      url: createPageUrl("Versatilidade"),
      gradient: "from-cyan-500 via-blue-500 to-blue-600",
      description: "Habilidades da equipe"
    },
    {
      title: "Chat",
      icon: MessageSquare,
      url: createPageUrl("Chat"),
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      description: "Comunicação rápida"
    },
    {
      title: "Objetivos",
      icon: Target,
      url: createPageUrl("Objetivos"),
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      description: "Metas e resultados"
    },
    {
      title: "Avisos",
      icon: Bell,
      url: createPageUrl("Avisos"),
      gradient: "from-red-500 via-pink-500 to-rose-600",
      description: "Comunicados importantes"
    },
    {
      title: "Feedback 360°",
      icon: Star,
      url: createPageUrl("Feedback360"),
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      description: "Avaliações da equipe"
    },
    {
      title: "Sugestões",
      icon: Lightbulb,
      url: createPageUrl("Sugestoes"),
      gradient: "from-amber-400 via-yellow-500 to-yellow-600",
      description: "Ideias e melhorias"
    },
    {
      title: "Calendário",
      icon: Calendar,
      url: createPageUrl("Calendario"),
      gradient: "from-pink-500 via-rose-500 to-red-500",
      description: "Agenda e eventos"
    },
    {
      title: "Documentos",
      icon: FileText,
      url: createPageUrl("Documentos"),
      gradient: "from-teal-500 via-cyan-600 to-blue-600",
      description: "Arquivos importantes"
    }
  ];

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {shortcuts.map((shortcut, index) => (
        <motion.div key={shortcut.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}>
          <Link to={shortcut.url}>
            <motion.div whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center text-center p-2 md:p-3.5 rounded-2xl border border-slate-200 bg-white hover:shadow-md active:shadow-none transition-all gap-1 md:gap-2 touch-manipulation">
              <div className={`p-2 md:p-2.5 rounded-xl bg-gradient-to-br ${shortcut.gradient} shadow-sm`}>
                <shortcut.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <p className="font-semibold text-slate-700 text-[10px] md:text-[11px] leading-tight">{shortcut.title}</p>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}