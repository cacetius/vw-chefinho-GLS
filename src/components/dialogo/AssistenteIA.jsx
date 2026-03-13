import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, User, Trash2, RefreshCw } from "lucide-react";

const SUGESTOES = [
  "O que é um DDS e como conduzir?",
  "Quais EPIs são obrigatórios na linha de produção?",
  "Como agir em caso de acidente de trabalho?",
  "Como engajar a equipe nos diálogos de segurança?",
  "Quais são os principais riscos em ambiente industrial?",
  "Como fazer uma análise de risco rápida (APR)?",
  "Explique a NR-12 de forma simples",
  "Como motivar minha equipe na produção?",
];

const MENSAGEM_INICIAL = "Olá! Sou o **Chefinho** 👷‍♂️, seu assistente virtual especializado em segurança do trabalho e gestão industrial.\n\nPosso te ajudar com diálogos de segurança, EPIs, normas regulamentadoras (NRs), análise de riscos, gestão de equipes e muito mais. Como posso te ajudar hoje?";

function formatarTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function AssistenteIA({ compact = false }) {
  const [mensagens, setMensagens] = useState([{ role: "assistant", texto: MENSAGEM_INICIAL }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, loading]);

  const enviar = async (texto) => {
    const pergunta = texto || input.trim();
    if (!pergunta || loading) return;
    setInput("");
    setMensagens(prev => [...prev, { role: "user", texto: pergunta }]);
    setLoading(true);

    const historico = mensagens
      .slice(-8)
      .map(m => `${m.role === "user" ? "Usuário" : "Chefinho"}: ${m.texto}`)
      .join("\n");

    const resposta = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o Chefinho, um assistente virtual simpático, direto e experiente especializado em segurança do trabalho e gestão industrial de linha de produção automotiva (estilo Volkswagen). 

Seu tom é profissional mas acessível, como um líder experiente que orienta a equipe. Use linguagem clara para operadores e monitores. Quando relevante, cite NRs. Use emojis com moderação. Máximo 180 palavras por resposta.

Histórico:
${historico}

Pergunta: ${pergunta}

Responda de forma direta, prática e útil.`,
    });

    setMensagens(prev => [...prev, { role: "assistant", texto: resposta }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const reiniciar = () => setMensagens([{ role: "assistant", texto: MENSAGEM_INICIAL }]);

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden ${compact ? "" : "shadow-sm"}`}
      style={{ minHeight: compact ? 360 : 480 }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#001e50] to-[#0066b1] text-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <span className="text-xl">👷</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Chefinho</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <p className="text-[10px] text-white/70">Assistente IA · Segurança do Trabalho</p>
            </div>
          </div>
        </div>
        <button onClick={reiniciar} title="Nova conversa"
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group">
          <RefreshCw className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {mensagens.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                m.role === "assistant"
                  ? "bg-gradient-to-br from-[#001e50] to-[#0066b1]"
                  : "bg-slate-300"
              }`}>
                {m.role === "assistant" ? <span className="text-sm">👷</span> : <User className="w-3.5 h-3.5 text-slate-600" />}
              </div>
              <div className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-[#0066b1] text-white rounded-tr-sm"
                  : "bg-white text-slate-800 rounded-tl-sm border border-slate-200"
              }`}
                dangerouslySetInnerHTML={{ __html: formatarTexto(m.texto) }}
              />
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#001e50] to-[#0066b1] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-sm">👷</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center border border-slate-200 shadow-sm">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-[#0066b1] rounded-full"
                    animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.18 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {mensagens.length <= 1 && (
        <div className="px-3 py-2 border-t border-slate-100 bg-white flex-shrink-0">
          <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Perguntas frequentes</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGESTOES.map((s, i) => (
              <button key={i} onClick={() => enviar(s)}
                className="text-[11px] px-2.5 py-1 bg-blue-50 text-[#0066b1] rounded-full border border-blue-100 hover:bg-[#0066b1] hover:text-white transition-all active:scale-95">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white flex gap-2 items-end flex-shrink-0">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte ao Chefinho..."
          className="flex-1 min-h-[40px] max-h-28 text-sm resize-none rounded-xl border-slate-200 focus:border-[#0066b1] bg-slate-50"
          rows={1}
          disabled={loading}
        />
        <Button onClick={() => enviar()} disabled={!input.trim() || loading}
          className="h-10 w-10 p-0 rounded-xl bg-[#0066b1] hover:bg-[#001e50] flex-shrink-0 shadow-sm transition-all active:scale-95">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}