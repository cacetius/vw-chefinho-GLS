import React, { useState } from "react";
import { KeyRound, Mail, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

// Gera senha diária determinística baseada na data + salt fixo
// Assim a senha é sempre a mesma para o mesmo dia, sem precisar de banco
function gerarSenhaDiaria() {
  const hoje = new Date();
  const dateStr = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, "0")}${String(hoje.getDate()).padStart(2, "0")}`;
  // Salt fixo da aplicação
  const salt = "VWChefinho2025";
  const raw = dateStr + salt;
  // Hash simples: soma de charCodes com deslocamento
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  // Converte para 6 dígitos numéricos
  const positivo = Math.abs(hash);
  return String(positivo % 1000000).padStart(6, "0");
}

export default function SenhaEmergenciaModal({ user, onLiberar, titulo = "Acesso Restrito" }) {
  const [passo, setPasso] = useState("inicio"); // inicio | enviando | aguardando | verificando | erro
  const [senha, setSenha] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const isLiderOuAdmin =
    user?.role === "admin" ||
    user?.cargo === "supervisor" ||
    user?.cargo === "lider";

  if (!isLiderOuAdmin) return null;

  const enviarSenha = async () => {
    setPasso("enviando");
    const senhaDiaria = gerarSenhaDiaria();
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🔐 VW Chefinho — Senha de Acesso (${hoje})`,
        body: `
Olá, ${user.full_name || user.email}!

Sua senha de acesso temporária para hoje (${hoje}) é:

━━━━━━━━━━━━━━━━━━
        ${senhaDiaria}
━━━━━━━━━━━━━━━━━━

Esta senha é válida apenas para o dia de hoje e permite acesso ao app fora do horário de turno ou fora da área da fábrica.

Não compartilhe esta senha com ninguém.

— VW Chefinho 🏭
        `.trim(),
      });
      setPasso("aguardando");
    } catch (e) {
      setErrMsg("Erro ao enviar e-mail. Tente novamente.");
      setPasso("erro");
    }
  };

  const verificarSenha = () => {
    setPasso("verificando");
    const correta = gerarSenhaDiaria();
    setTimeout(() => {
      if (senha.trim() === correta) {
        // Salva liberação no sessionStorage para não pedir de novo na sessão
        sessionStorage.setItem("vw_acesso_emergencia", new Date().toDateString());
        onLiberar();
      } else {
        setErrMsg("Senha incorreta. Verifique seu e-mail e tente novamente.");
        setPasso("erro");
      }
    }, 600);
  };

  return (
    <div className="mt-4 border-t border-white/20 pt-4">
      {passo === "inicio" && (
        <div className="text-center">
          <p className="text-white/50 text-xs mb-3">
            Líder ou administrador? Solicite acesso temporário.
          </p>
          <Button
            onClick={enviarSenha}
            variant="outline"
            size="sm"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20 w-full"
          >
            <KeyRound className="w-3.5 h-3.5 mr-2" />
            Solicitar senha de acesso
          </Button>
        </div>
      )}

      {passo === "enviando" && (
        <div className="text-center space-y-2 py-2">
          <Loader2 className="w-6 h-6 animate-spin text-white/70 mx-auto" />
          <p className="text-white/60 text-xs">Enviando senha para {user.email}...</p>
        </div>
      )}

      {passo === "aguardando" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl p-3">
            <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-xs">
              Senha enviada para <strong>{user.email}</strong>
            </p>
          </div>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={senha}
            onChange={e => setSenha(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoFocus
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-3xl font-black tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:border-white/60 tabular-nums appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            onClick={verificarSenha}
            disabled={senha.length !== 6}
            className="w-full bg-[#0066b1] hover:bg-[#004d82] h-12 font-semibold text-base disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Confirmar acesso
          </Button>
          <button
            onClick={() => { setSenha(""); setPasso("inicio"); }}
            className="w-full text-white/30 text-xs py-1 hover:text-white/50"
          >
            Reenviar senha
          </button>
        </div>
      )}

      {passo === "verificando" && (
        <div className="text-center py-2 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-white/70 mx-auto" />
          <p className="text-white/60 text-xs">Verificando...</p>
        </div>
      )}

      {passo === "erro" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl p-3">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-xs">{errMsg}</p>
          </div>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={senha}
            onChange={e => setSenha(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full bg-white/10 border border-red-400/30 rounded-xl px-4 py-3 text-white text-center text-3xl font-black tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:border-white/60 tabular-nums appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={verificarSenha}
              disabled={senha.length !== 6}
              className="flex-1 bg-[#0066b1] hover:bg-[#004d82] h-10 font-semibold disabled:opacity-40"
            >
              Tentar novamente
            </Button>
            <Button
              onClick={() => { setSenha(""); setErrMsg(""); setPasso("inicio"); }}
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/10 h-10"
            >
              Reenviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}