import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    emoji: "🏭",
    title: "Bem-vindo ao VW Chefinho!",
    color: "from-[#001e50] to-[#0066b1]",
    steps: [
      "Este app é sua central de gestão industrial.",
      "Use o menu lateral (desktop) ou o botão ☰ (mobile) para navegar.",
      "O Dashboard sempre mostra um resumo geral do que está acontecendo.",
      "Você pode voltar a este tutorial clicando em '❓ Tutorial' no banner."
    ]
  },
  {
    emoji: "🚗",
    title: "Linha de Produção",
    color: "from-slate-600 to-slate-800",
    steps: [
      "Acesse 'Linha de Produção' no menu.",
      "Clique em '+ Novo Carro' para registrar um veículo na linha.",
      "Atualize o status de cada carro (Em produção, Concluído, Problema).",
      "Use a aba 'Layout' para visualizar e editar o mapa físico da linha.",
      "No editor de layout, arraste e solte os elementos para posicioná-los."
    ]
  },
  {
    emoji: "📋",
    title: "Auditoria VDA",
    color: "from-indigo-500 to-purple-600",
    steps: [
      "Acesse 'Auditoria VDA' no menu.",
      "Clique em '+ Nova Auditoria' para iniciar um checklist.",
      "Preencha cada item com Conforme / Não Conforme / N/A.",
      "Adicione observações e evidências fotográficas em cada item.",
      "Após salvar, crie Planos de Ação para as não conformidades encontradas."
    ]
  },
  {
    emoji: "🦺",
    title: "Pedidos de EPI",
    color: "from-green-500 to-emerald-600",
    steps: [
      "Acesse 'Pedidos EPI' no menu.",
      "Clique em '+ Novo Pedido' e preencha o item, quantidade e justificativa.",
      "Marque como 'Urgente' se necessário.",
      "Líderes veem todos os pedidos e podem Aprovar ou Reprovar.",
      "Acompanhe o status: Pendente → Aprovado → Entregue.",
      "Na aba 'Orçamentos', líderes definem o budget mensal por categoria."
    ]
  },
  {
    emoji: "🚛",
    title: "Logística",
    color: "from-orange-500 to-red-500",
    steps: [
      "Acesse 'Logística' no menu.",
      "Clique em '+ Nova Atividade' para criar uma tarefa logística.",
      "Defina título, responsável, prioridade e data prevista.",
      "Atualize o status conforme o andamento: Pendente → Em Andamento → Concluída.",
      "Use os filtros no topo para encontrar atividades por status ou prioridade."
    ]
  },
  {
    emoji: "🧩",
    title: "Versatilidade da Equipe",
    color: "from-cyan-500 to-blue-600",
    steps: [
      "Acesse 'Versatilidade' no menu.",
      "Clique em '+ Adicionar Colaborador' para cadastrar um membro.",
      "Para cada colaborador, defina o nível em cada habilidade: Não Treinado, Em Treinamento, Treinado ou Instrutor.",
      "A matriz mostra visualmente quem sabe fazer o quê.",
      "Use para planejar coberturas e identificar gaps de treinamento."
    ]
  },
  {
    emoji: "💬",
    title: "Chat e Avisos",
    color: "from-blue-400 to-blue-600",
    steps: [
      "No 'Chat', selecione ou crie um canal de comunicação.",
      "Digite sua mensagem e pressione Enter ou clique em Enviar.",
      "Use '@' para mencionar um colega específico.",
      "Em 'Avisos', clique em '+ Novo Aviso' para criar um comunicado.",
      "Defina a prioridade (Normal, Importante, Urgente) e a categoria.",
      "Avisos urgentes aparecem em destaque para todos da equipe."
    ]
  },
  {
    emoji: "🎯",
    title: "Objetivos e Metas",
    color: "from-green-600 to-teal-600",
    steps: [
      "Acesse 'Objetivos' no menu.",
      "Clique em '+ Novo' e escolha se é Diário ou Mensal.",
      "Defina o título, categoria (Segurança, Qualidade, Produção) e a meta numérica.",
      "Atualize o valor atual conforme o dia avança.",
      "Marque o objetivo como Concluído quando a meta for atingida.",
      "O dashboard mostra a taxa de conclusão dos objetivos do dia."
    ]
  },
  {
    emoji: "🛡️",
    title: "Diálogos de Segurança (DDS)",
    color: "from-red-500 to-rose-600",
    steps: [
      "Acesse 'Diálogos de Segurança' no menu.",
      "Clique em '+ Novo Diálogo' e preencha o título e tipo (DDS, Treinamento...).",
      "Cole o texto do diálogo ou faça upload de um documento PDF/Word.",
      "Clique em '✨ Gerar com IA' para criar slides automaticamente.",
      "Clique em 'Apresentar' para exibir os slides com narração por voz.",
      "Use a aba 'Assistente IA' para tirar dúvidas sobre NRs e EPIs."
    ]
  },
  {
    emoji: "👤",
    title: "Perfil e Configurações",
    color: "from-purple-500 to-pink-600",
    steps: [
      "Clique no seu avatar (canto superior direito) para acessar o Perfil.",
      "Faça upload de uma foto clicando no ícone de câmera.",
      "Preencha seu nome de exibição, cargo, equipe e turno.",
      "Líderes podem acessar a 'Área do Líder' para gerenciar a equipe.",
      "Monitores têm acesso à 'Área do Monitor' com suas tarefas específicas."
    ]
  },
  {
    emoji: "✅",
    title: "Tudo pronto!",
    color: "from-[#001e50] to-[#0066b1]",
    steps: [
      "Você já sabe como usar as principais funções do VW Chefinho.",
      "Dica: Complete seu perfil primeiro para uma experiência personalizada.",
      "Em caso de dúvidas, clique em '❓ Tutorial' no banner do Dashboard.",
      "Bom trabalho e segurança sempre! 👷"
    ]
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
        {/* Header */}
        <div className={`bg-gradient-to-br ${current.color} p-6 text-center relative`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <motion.div key={step} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl mb-2">
            {current.emoji}
          </motion.div>
          <motion.h2 key={`title-${step}`} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-white font-bold text-lg leading-tight">
            {current.title}
          </motion.h2>
          <p className="text-white/70 text-xs mt-1">{step + 1} de {STEPS.length}</p>
        </div>

        {/* Steps list */}
        <div className="p-5">
          <motion.ul key={`steps-${step}`} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2.5">
            {current.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0066b1]/10 text-[#0066b1] flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </motion.ul>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? "w-5 h-2 bg-[#0066b1]" : "w-2 h-2 bg-slate-200 hover:bg-slate-300"}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="flex-1 h-9">
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={onClose} className="flex-1 h-9 bg-[#0066b1] hover:bg-[#004d82]">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Começar!
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(s => s + 1)} className="flex-1 h-9 bg-[#0066b1] hover:bg-[#004d82]">
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