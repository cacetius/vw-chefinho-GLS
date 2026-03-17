import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Bell, BellOff, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Armazena IDs já notificados para evitar spam
const notificadosRef = new Set();

export default function AlertasLinha({ carros, currentUser }) {
  const [alertas, setAlertas] = useState([]);
  const [silenciado, setSilenciado] = useState(false);
  const [expandido, setExpandido] = useState(true);
  const prevCarrosRef = useRef([]);

  const isLider = currentUser?.cargo === "lider" ||
    (currentUser?.cargo_temporario === "lider" && currentUser?.data_cargo_temporario &&
      new Date(currentUser.data_cargo_temporario) >= new Date());

  useEffect(() => {
    if (!carros || carros.length === 0) return;

    const novosAlertas = [];

    carros.forEach(carro => {
      if (carro.status === "erro" || carro.status === "alerta") {
        const key = `${carro.id}-${carro.status}-${carro.updated_date}`;
        if (!notificadosRef.has(key)) {
          notificadosRef.add(key);
          novosAlertas.push({
            id: key,
            carroId: carro.id,
            modelo: carro.modelo,
            chassi: carro.chassi,
            estacao: carro.estacao_atual?.replace(/_/g, " "),
            status: carro.status,
            problemas: carro.problemas?.length || 0,
            timestamp: new Date(),
          });
        }
      }
    });

    if (novosAlertas.length > 0) {
      setAlertas(prev => [...novosAlertas, ...prev].slice(0, 20));
    }

    prevCarrosRef.current = carros;
  }, [carros]);

  const alertasAtivos = alertas.filter(a => {
    const carro = carros.find(c => c.id === a.carroId);
    return carro && (carro.status === "erro" || carro.status === "alerta");
  });

  const dismissAlerta = (id) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  if (alertasAtivos.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Linha operando normalmente — sem alertas ativos
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${alertasAtivos.some(a => a.status === "erro") ? "border-red-400" : "border-amber-400"}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 ${alertasAtivos.some(a => a.status === "erro") ? "bg-red-500" : "bg-amber-500"}`}>
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
          <AlertTriangle className="w-4 h-4 text-white" />
        </motion.div>
        <span className="text-white text-xs font-bold flex-1">
          {alertasAtivos.length} alerta{alertasAtivos.length > 1 ? "s" : ""} ativo{alertasAtivos.length > 1 ? "s" : ""} na linha
        </span>
        <button onClick={() => setSilenciado(s => !s)}
          className="p-1 text-white/80 hover:text-white">
          {silenciado ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setExpandido(e => !e)}
          className="p-1 text-white/80 hover:text-white">
          {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Lista de alertas */}
      <AnimatePresence>
        {expandido && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden bg-white">
            <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto">
              {alertasAtivos.map(alerta => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className={`flex items-start gap-2 p-2 rounded-lg border ${
                    alerta.status === "erro" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${alerta.status === "erro" ? "bg-red-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">{alerta.modelo}</span>
                      <Badge className={`text-[9px] px-1 py-0 ${alerta.status === "erro" ? "bg-red-500" : "bg-amber-500"} text-white`}>
                        {alerta.status === "erro" ? "ERRO" : "ALERTA"}
                      </Badge>
                      {alerta.problemas > 0 && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{alerta.problemas} prob.</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {alerta.chassi?.slice(-8)} · {alerta.estacao}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {alerta.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => dismissAlerta(alerta.id)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}