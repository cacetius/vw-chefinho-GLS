import React, { useState, useEffect } from "react";
import { MapPin, Loader2, WifiOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Coordenadas da VW de Taubaté
const VW_TAUBATE = {
  lat: -23.0274,
  lng: -45.5569,
  raioMetros: 1000, // 1km de raio
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

export default function GeoGuard({ children, userRole, userCargo }) {
  const [status, setStatus] = useState("verificando"); // verificando | dentro | fora | sem_gps | erro

  const isAdmin = userRole === "admin" || userCargo === "supervisor";

  useEffect(() => {
    // Admins e supervisores não têm restrição geográfica
    if (isAdmin) { setStatus("dentro"); return; }

    if (!navigator.geolocation) {
      setStatus("sem_gps");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = distanciaMetros(
          pos.coords.latitude,
          pos.coords.longitude,
          VW_TAUBATE.lat,
          VW_TAUBATE.lng
        );
        setStatus(dist <= VW_TAUBATE.raioMetros ? "dentro" : "fora");
      },
      (err) => {
        // Se o usuário negou a localização, bloqueia
        setStatus(err.code === 1 ? "sem_gps" : "erro");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [isAdmin]);

  const tentar = () => {
    setStatus("verificando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = distanciaMetros(
          pos.coords.latitude,
          pos.coords.longitude,
          VW_TAUBATE.lat,
          VW_TAUBATE.lng
        );
        setStatus(dist <= VW_TAUBATE.raioMetros ? "dentro" : "fora");
      },
      () => setStatus("sem_gps"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (status === "dentro") return <>{children}</>;

  if (status === "verificando") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] to-[#0066b1]">
        <div className="text-center text-white p-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="font-bold text-lg">Verificando localização...</p>
          <p className="text-blue-200 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (status === "fora") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] to-[#0066b1] p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600 text-sm mb-4">
            Este aplicativo funciona <strong>apenas dentro da Volkswagen de Taubaté</strong>.
          </p>
          <div className="bg-slate-50 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs text-slate-500 font-semibold mb-1">📍 Local autorizado:</p>
            <p className="text-xs text-slate-700">Volkswagen do Brasil — Taubaté/SP</p>
            <p className="text-xs text-slate-500 mt-0.5">Av. Automóvel Clube, 1666</p>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Você está fora do perímetro autorizado. Conecte-se à rede da VW ou acesse de dentro da fábrica.
          </p>
          <Button onClick={tentar} className="w-full bg-[#0066b1] hover:bg-[#004d82]">
            <MapPin className="w-4 h-4 mr-2" /> Verificar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (status === "sem_gps") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001e50] to-[#0066b1] p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 text-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Localização Necessária</h2>
          <p className="text-slate-600 text-sm mb-4">
            Para usar o VW Chefinho, você precisa <strong>permitir o acesso à localização</strong> do dispositivo.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-1">Como permitir:</p>
            <p className="text-xs text-amber-700">1. Toque no ícone 🔒 na barra de endereço</p>
            <p className="text-xs text-amber-700">2. Selecione "Localização" → "Permitir"</p>
            <p className="text-xs text-amber-700">3. Recarregue a página</p>
          </div>
          <Button onClick={tentar} variant="outline" className="w-full border-[#0066b1] text-[#0066b1]">
            <WifiOff className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // erro genérico — deixa passar para não bloquear em falhas de GPS
  return <>{children}</>;
}