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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {shortcuts.map((shortcut, index) => (
        <motion.div
          key={shortcut.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={shortcut.url}>
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
              <CardContent className="p-5">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${shortcut.gradient} shadow-lg group-hover:shadow-xl transition-all`}>
                    <shortcut.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#0066b1] transition-colors">
                      {shortcut.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-tight">
                      {shortcut.description}
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}