import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationCenter({ currentUser }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadNotificacoes();
      const interval = setInterval(loadNotificacoes, 30000); // Atualiza a cada 30s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotificacoes = async () => {
    try {
      const data = await base44.entities.Notificacao.filter(
        { usuario_id: currentUser.id },
        "-created_date",
        10
      );
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  const handleMarcarLida = async (notificacao) => {
    try {
      await base44.entities.Notificacao.update(notificacao.id, {
        ...notificacao,
        lida: true,
        data_leitura: new Date().toISOString()
      });
      loadNotificacoes();
      
      if (notificacao.link) {
        navigate(notificacao.link);
        setOpen(false);
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      const promises = notificacoes
        .filter(n => !n.lida)
        .map(n => base44.entities.Notificacao.update(n.id, {
          ...n,
          lida: true,
          data_leitura: new Date().toISOString()
        }));
      await Promise.all(promises);
      loadNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const getIconByType = (tipo) => {
    switch (tipo) {
      case "sucesso":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "erro":
        return <X className="w-5 h-5 text-red-600" />;
      case "aviso":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "urgente":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorByType = (tipo) => {
    switch (tipo) {
      case "sucesso":
        return "bg-green-50 border-green-200";
      case "erro":
        return "bg-red-50 border-red-200";
      case "aviso":
        return "bg-yellow-50 border-yellow-200";
      case "urgente":
        return "bg-red-100 border-red-300";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notificacoesNaoLidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {notificacoesNaoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notificações</h3>
          {notificacoesNaoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLidas}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarcarLida(notif)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.lida ? "bg-blue-50/50" : ""
                  } ${getColorByType(notif.tipo)} border-l-4`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIconByType(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-900">{notif.titulo}</p>
                        {!notif.lida && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notif.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}