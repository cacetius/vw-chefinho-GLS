import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    emoji: "🏭",
    title: "Bem-vindo ao VW Chefinho!",
    desc: "Sua plataforma completa de gestão industrial. Aqui você gerencia equipes, EPIs, logística, segurança e muito mais — tudo em um só lugar.",
    color: "from-[#001e50] to-[#0066b1]"
  },
  {
    emoji: "📊",
    title: "Dashboard",
    desc: "A tela inicial mostra um resumo de tudo: atividades de logística, pedidos de EPI pendentes, mensagens, objetivos e avisos urgentes.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    emoji: "🚗",
    title: "Linha de Produção",
    desc: "Monitore os carros na linha em tempo real. Registre status de produção e visualize o layout físico da linha com o editor de layout.",
    color: "from-slate-600 to-slate-800"
  },
  {
    emoji: "📋",
    title: "Auditoria VDA",
    desc: "Realize auditorias de qualidade seguindo o padrão VDA. Crie checklists, registre não conformidades e gere planos de ação corretiva.",
    color: "from-indigo-500 to-purple-600"
  },
  {
    emoji: "🦺",
    title: "Pedidos de EPI",
    desc: "Solicite e gerencie equipamentos de proteção individual. Líderes podem aprovar pedidos, definir orçamentos e acompanhar gastos.",
    color: "from-green-500 to-emerald-600"
  },
  {
    emoji: "🚛",
    title: "Logística",
    desc: "Gerencie atividades logísticas da sua equipe. Crie tarefas com prioridades e acompanhe o andamento de cada atividade.",
    color: "from-orange-500 to-red-500"
  },
  {
    emoji: "🧩",
    title: "Versatilidade",
    desc: "Registre e visualize as habilidades da equipe em uma matriz interativa. Identifique quem pode substituir quem em cada operação.",
    color: "from-cyan-500 to-blue-600"
  },
  {
    emoji: "💬",
    title: "Chat e Avisos",
    desc: "Comunique-se com sua equipe em tempo real pelo Chat. Use Avisos para comunicados importantes com diferentes níveis de prioridade.",
    color: "from-blue-400 to-blue-600"
  },
  {
    emoji: "🎯",
    title: "Objetivos e Metas",
    desc: "Defina objetivos diários e mensais para a equipe. Acompanhe o progresso e marque metas como concluídas.",
    color: "from-green-600 to-teal-600"
  },
  {
    emoji: "🛡️",
    title: "Diálogos de Segurança",
    desc: "Crie e apresente diálogos de segurança (DDS) com apoio de IA. A IA gera slides e resumos automaticamente a partir dos seus documentos.",
    color: "from-red-500 to-rose-600"
  },
  {
    emoji: "👤",
    title: "Seu Perfil",
    desc: "Complete seu perfil com foto, cargo e informações da equipe. Quanto mais completo, melhor a experiência personalizada.",
    color: "from-purple-500 to-pink-600"
  },
  {
    emoji: "✅",
    title: "Tudo pronto!",
    desc: "Você já conhece as principais funcionalidades do VW Chefinho. Clique em qualquer atalho no dashboard para começar. Bom trabalho!",
    color: "from-[#001e50] to-[#0066b1]"
  }
];

export default function TutorialApp({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header colorido */}
        <div className={`bg-gradient-to-br ${current.color} p-8 text-center relative`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <motion.div
            key={step}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-3"
          >
            {current.emoji}
          </motion.div>
          <motion.h2
            key={`title-${step}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white font-bold text-xl leading-tight"
          >
            {current.title}
          </motion.h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <motion.p
            key={`desc-${step}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-slate-600 text-sm leading-relaxed text-center"
          >
            {current.desc}
          </motion.p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step ? "w-5 h-2 bg-[#0066b1]" : "w-2 h-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mt-5">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 h-10"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {isLast ? (
              <Button
                size="sm"
                onClick={onClose}
                className="flex-1 h-10 bg-[#0066b1] hover:bg-[#004d82]"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Começar a usar!
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setStep(s => s + 1)}
                className="flex-1 h-10 bg-[#0066b1] hover:bg-[#004d82]"
              >
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {step === 0 && (
            <button onClick={onClose} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors">
              Pular tutorial
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}