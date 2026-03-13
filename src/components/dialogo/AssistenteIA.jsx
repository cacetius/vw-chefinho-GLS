import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Bot, User, Trash2 } from "lucide-react";

const SUGESTOES = [
  "O que é um DDS e como conduzir?",
  "Quais EPIs são obrigatórios na linha de produção?",
  "Como agir em caso de acidente de trabalho?",
  "Como engajar a equipe nos diálogos de segurança?",
  "Quais são os principais riscos em ambiente industrial?",
  "Como fazer uma análise de risco rápida (APR)?",
];

export default function AssistenteIA() {
  const [mensagens, setMensagens] = useState([
    {
      role: "assistant",
      texto: "Olá! Sou seu assistente de segurança do trabalho. Posso tirar dúvidas sobre diálogos de segurança, EPIs, procedimentos, legislação NR, análise de riscos e muito mais. Como posso ajudar? 👷",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, loading]);

  const enviar = async (texto) => {
    const pergunta = texto || input.trim();
    if (!pergunta) return;
    setInput("");
    setMensagens(prev => [...prev, { role: "user", texto: pergunta }]);
    setLoading(true);

    const historico = mensagens
      .slice(-6)
      .map(m => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.texto}`)
      .join("\n");

    const resposta = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em segurança do trabalho industrial, focado em ambiente de fábrica/linha de produção. Responda de forma clara, prática e objetiva em português brasileiro. Use linguagem acessível para operadores e monitores de produção.

Histórico recente:
${historico}

Nova pergunta: ${pergunta}

Responda de forma direta e útil. Se relevante, cite normas (NR's) ou boas práticas. Máximo 150 palavras.`,
    });

    setMensagens(prev => [...prev, { role: "assistant", texto: resposta }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ minHeight: 420 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0066b1] to-purple-700 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold">Assistente de Segurança</p>
            <p className="text-[10px] text-white/70">IA especializada em segurança do trabalho</p>
          </div>
        </div>
        <button onClick={() => setMensagens([{ role: "assistant", texto: "Conversa reiniciada! Como posso ajudar? 👷" }])}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Limpar conversa">
          <Trash2 className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence initial={false}>
          {mensagens.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === "assistant" ? "bg-gradient-to-br from-[#0066b1] to-purple-700" : "bg-slate-200"
              }`}>
                {m.role === "assistant"
                  ? <Sparkles className="w-3.5 h-3.5 text-white" />
                  : <User className="w-3.5 h-3.5 text-slate-600" />}
              </div>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#0066b1] text-white rounded-tr-sm"
                  : "bg-slate-100 text-slate-800 rounded-tl-sm"
              }`}>
                {m.texto}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0066b1] to-purple-700 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.2 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {mensagens.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-slate-400 mb-1.5 font-medium">SUGESTÕES</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGESTOES.map((s, i) => (
              <button key={i} onClick={() => enviar(s)}
                className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors active:scale-95">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre segurança do trabalho..."
          className="flex-1 min-h-[40px] max-h-24 text-sm resize-none rounded-xl border-slate-200 focus:border-[#0066b1]"
          rows={1}
          disabled={loading}
        />
        <Button onClick={() => enviar()} disabled={!input.trim() || loading}
          className="h-10 w-10 p-0 rounded-xl bg-[#0066b1] hover:bg-[#0055a0] flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}