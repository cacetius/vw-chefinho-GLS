import React, { useState } from "react";
import { KeyRound, Mail, Loader2, CheckCircle2, XCircle, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

// Gera senha diária determinística baseada na data + salt fixo
function gerarSenhaDiaria() {
  const hoje = new Date();
  const dateStr = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, "0")}${String(hoje.getDate()).padStart(2, "0")}`;
  const salt = "VWChefinho2025";
  const raw = dateStr + salt;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  const positivo = Math.abs(hash);
  return String(positivo % 1000000).padStart(6, "0");
}

function formatarWhatsApp(telefone) {
  // Remove tudo que não for número
  return telefone?.replace(/\D/g, "") || "";
}

export default function SenhaEmergenciaModal({ user, onLiberar, titulo = "Acesso Restrito" }) {
  const [passo, setPasso] = useState("inicio"); // inicio | canal | enviando | aguardando | verificando | erro
  const [senha, setSenha] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [canal, setCanal] = useState("email"); // email | whatsapp

  const isLiderOuAdmin =
    user?.role === "admin" ||
    user?.cargo === "supervisor" ||
    user?.cargo === "lider";

  if (!isLiderOuAdmin) return null;

  const senhaDiaria = gerarSenhaDiaria();
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const enviarPorEmail = async () => {
    setPasso("enviando");
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🔐 VW Chefinho — Senha de Acesso (${hoje})`,
        body: `Olá, ${user.full_name || user.email}!\n\nSua senha de acesso temporária para hoje (${hoje}) é:\n\n━━━━━━━━━━━━━━━━━━\n        ${senhaDiaria}\n━━━━━━━━━━━━━━━━━━\n\nEsta senha é válida apenas para o dia de hoje.\n\nNão compartilhe esta senha com ninguém.\n\n— VW Chefinho 🏭`.trim(),
      });
      setPasso("aguardando");
    } catch (e) {
      setErrMsg("Erro ao enviar e-mail. Tente novamente.");
      setPasso("erro");
    }
  };

  const enviarPorWhatsApp = () => {
    const telefone = formatarWhatsApp(user.telefone || user.celular || user.whatsapp);
    const mensagem = encodeURIComponent(
      `🔐 *VW Chefinho — Senha de Acesso (${hoje})*\n\nOlá, ${user.full_name || ""}!\n\nSua senha temporária de hoje é:\n\n*${senhaDiaria}*\n\nVálida apenas hoje. Não compartilhe.\n\n_Gerado automaticamente pelo VW Chefinho 🏭_`
    );

    if (telefone) {
      // Envia diretamente pro WhatsApp do próprio usuário (pelo número salvo no perfil)
      window.open(`https://wa.me/55${telefone}?text=${mensagem}`, "_blank");
    } else {
      // Sem número cadastrado: abre WhatsApp para o usuário escolher
      window.open(`https://api.whatsapp.com/send?text=${mensagem}`, "_blank");
    }
    setPasso("aguardando");
  };

  const enviarSenha = () => {
    if (canal === "whatsapp") {
      enviarPorWhatsApp();
    } else {
      enviarPorEmail();
    }
  };

  const verificarSenha = () => {
    setPasso("verificando");
    setTimeout(() => {
      if (senha.trim() === senhaDiaria) {
        sessionStorage.setItem("vw_acesso_emergencia", new Date().toDateString());
        onLiberar();
      } else {
        setErrMsg("Senha incorreta. Verifique e tente novamente.");
        setPasso("erro");
      }
    }, 600);
  };

  const InputSenha = ({ borderClass = "border-white/20" }) => (
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={senha}
      onChange={e => setSenha(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="000000"
      autoFocus
      className={`w-full bg-white/10 border ${borderClass} rounded-xl px-4 py-3 text-white text-center text-3xl font-black tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:border-white/60 tabular-nums`}
    />
  );

  return (
    <div className="mt-4 border-t border-white/20 pt-4">

      {/* INÍCIO — escolha do canal */}
      {passo === "inicio" && (
        <div className="space-y-3">
          <p className="text-white/50 text-xs text-center">
            Líder ou administrador? Solicite acesso temporário.
          </p>
          {/* Seletor de canal */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCanal("email")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                canal === "email"
                  ? "bg-[#0066b1] border-[#0066b1] text-white"
                  : "bg-white/10 border-white/20 text-white/60"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> E-mail
            </button>
            <button
              onClick={() => setCanal("whatsapp")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                canal === "whatsapp"
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white/10 border-white/20 text-white/60"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
          <Button
            onClick={enviarSenha}
            variant="outline"
            size="sm"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20 w-full h-11"
          >
            <KeyRound className="w-3.5 h-3.5 mr-2" />
            Solicitar senha de acesso
          </Button>
        </div>
      )}

      {passo === "enviando" && (
        <div className="text-center space-y-2 py-2">
          <Loader2 className="w-6 h-6 animate-spin text-white/70 mx-auto" />
          <p className="text-white/60 text-xs">
            {canal === "whatsapp" ? "Abrindo WhatsApp..." : `Enviando senha para ${user.email}...`}
          </p>
        </div>
      )}

      {passo === "aguardando" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl p-3">
            {canal === "whatsapp"
              ? <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              : <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
            }
            <p className="text-green-300 text-xs">
              {canal === "whatsapp"
                ? <>Senha enviada para o seu WhatsApp{user.celular ? <> (<strong>{user.celular}</strong>)</> : ""}. Digite o código abaixo.</>
                : <>Senha enviada para <strong>{user.email}</strong></>
              }
            </p>
          </div>
          <InputSenha />
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
          <InputSenha borderClass="border-red-400/30" />
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