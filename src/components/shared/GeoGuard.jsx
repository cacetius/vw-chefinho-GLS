import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import SenhaEmergenciaModal from "./SenhaEmergenciaModal";

// ── Centro da fábrica VW Taubaté ─────────────────────────────────────────────
// Coordenadas do centro do complexo industrial (Av. Automóvel Clube, 1666)
const VW_TAUBATE = {
  lat: -23.0285,
  lng: -45.5631,
  raioMetros: 1500, // 1.5km cobre o complexo inteiro (~2.5km de extensão)
};

function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isAcessoEmergenciaAtivo() {
  const val = sessionStorage.getItem("vw_acesso_emergencia");
  return val === new Date().toDateString();
}

export default function GeoGuard({ children, userRole, userCargo, currentUser }) {
  const [status, setStatus] = useState("verificando");
  const [distancia, setDistancia] = useState(null);
  const [liberado, setLiberado] = useState(false);

  const isAdmin = userRole === "admin" || userCargo === "supervisor";
  const isLiderOuAdmin = isAdmin || userCargo === "lider";

  const verificar = useCallback(() => {
    // Admin/supervisor: acesso direto sem geo
    if (isAdmin) { setStatus("dentro"); return; }
    // Sessão de emergência ainda válida
    if (isAcessoEmergenciaAtivo()) { setStatus("dentro"); return; }

    if (!navigator.geolocation) { setStatus("sem_gps"); return; }

    setStatus("verificando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = distanciaMetros(
          pos.coords.latitude,
          pos.coords.longitude,
          VW_TAUBATE.lat,
          VW_TAUBATE.lng
        );
        setDistancia(Math.round(dist));
        setStatus(dist <= VW_TAUBATE.raioMetros ? "dentro" : "fora");
      },
      (err) => {
        setStatus(err.code === 1 ? "negado" : "sem_gps");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }, [isAdmin]);

  useEffect(() => {
    verificar();
  }, [verificar]);

  useEffect(() => {
    if (liberado) setStatus("dentro");
  }, [liberado]);

  if (status === "dentro") return <>{children}</>;

  // ── Verificando ───────────────────────────────────────────────────────────
  if (status === "verificando") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] via-[#003080] to-[#0066b1]">
        <div className="text-center text-white p-8 space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
              <Navigation className="w-9 h-9 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <p className="font-bold text-xl">Verificando localização</p>
            <p className="text-blue-200 text-sm mt-1">Aguarde enquanto identificamos sua posição...</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fora do perímetro ─────────────────────────────────────────────────────
  if (status === "fora") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] via-[#003080] to-[#0066b1] p-4">
        <div className="max-w-sm w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-red-500/80 px-6 py-5 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black">Fora do Perímetro</h2>
            <p className="text-red-100 text-sm mt-1">Acesso não autorizado</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-white/10 rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mb-1">📍 Local Autorizado</p>
              <p className="text-sm font-bold text-white">Volkswagen do Brasil — Taubaté</p>
              <p className="text-xs text-white/50">Av. Automóvel Clube, 1666 (raio: 1,5 km)</p>
            </div>
            {distancia && (
              <div className="bg-red-500/20 rounded-xl p-3 border border-red-400/30 text-center">
                <p className="text-xs text-red-300 font-semibold">Sua distância atual</p>
                <p className="text-2xl font-black text-red-300">
                  {distancia >= 1000 ? `${(distancia / 1000).toFixed(1)} km` : `${distancia} m`}
                </p>
                <p className="text-[10px] text-red-400">do centro da fábrica</p>
              </div>
            )}
            <Button onClick={verificar} className="w-full bg-[#0066b1] hover:bg-[#004d82] h-11 font-semibold">
              <RefreshCw className="w-4 h-4 mr-2" /> Verificar novamente
            </Button>

            {isLiderOuAdmin && currentUser && (
              <SenhaEmergenciaModal user={currentUser} onLiberar={() => setLiberado(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Permissão negada ──────────────────────────────────────────────────────
  if (status === "negado") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] via-[#003080] to-[#0066b1] p-4">
        <div className="max-w-sm w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-500/80 px-6 py-5 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black">Localização Necessária</h2>
            <p className="text-amber-100 text-sm mt-1">Permissão não concedida</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-300 mb-2">Como ativar a localização:</p>
              <div className="space-y-1.5">
                {[
                  "Toque no ícone 🔒 na barra de endereço",
                  'Selecione "Localização"',
                  'Escolha "Permitir"',
                  "Recarregue a página",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-xs text-amber-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full bg-amber-500 hover:bg-amber-600 h-11 font-semibold text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Recarregar após permitir
            </Button>

            {isLiderOuAdmin && currentUser && (
              <SenhaEmergenciaModal user={currentUser} onLiberar={() => setLiberado(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // GPS indisponível — deixa passar
  return <>{children}</>;
}