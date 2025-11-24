import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Truck,
  ShoppingCart,
  Users,
  Bell,
  MessageSquare,
  Calendar,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

export default function AtalhosRapidos() {
  const atalhos = [
    { title: "Objetivos", icon: Target, url: "Objetivos", gradient: "from-green-500 to-emerald-600", color: "text-green-600" },
    { title: "Logística", icon: Truck, url: "Logistica", gradient: "from-orange-500 to-red-600", color: "text-orange-600" },
    { title: "Pedidos EPI", icon: ShoppingCart, url: "PedidosEPI", gradient: "from-purple-500 to-purple-600", color: "text-purple-600" },
    { title: "Versatilidade", icon: Users, url: "Versatilidade", gradient: "from-blue-500 to-indigo-600", color: "text-blue-600" },
    { title: "Avisos", icon: Bell, url: "Avisos", gradient: "from-yellow-500 to-amber-600", color: "text-yellow-600" },
    { title: "Chat", icon: MessageSquare, url: "Chat", gradient: "from-cyan-500 to-blue-600", color: "text-cyan-600" },
    { title: "Calendário", icon: Calendar, url: "Calendario", gradient: "from-pink-500 to-rose-600", color: "text-pink-600" },
    { title: "Documentos", icon: FileText, url: "Documentos", gradient: "from-indigo-500 to-purple-600", color: "text-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {atalhos.map((atalho, index) => (
        <motion.div
          key={atalho.url}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * index }}
        >
          <Link to={createPageUrl(atalho.url)}>
            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 bg-white group overflow-hidden relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${atalho.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <CardContent className="pt-6 pb-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 bg-gradient-to-br ${atalho.gradient} rounded-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <atalho.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={`text-sm font-bold ${atalho.color}`}>
                    {atalho.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}