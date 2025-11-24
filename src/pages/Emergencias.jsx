import React, { useState, useEffect } from "react";
import { ContatoEmergencia } from "@/entities/ContatoEmergencia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle, Ambulance, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Emergencias() {
  const [contatos, setContatos] = useState([]);

  useEffect(() => {
    loadContatos();
  }, []);

  const loadContatos = async () => {
    const data = await ContatoEmergencia.list();
    setContatos(data);
  };

  const iconMap = {
    bombeiros: <AlertTriangle className="w-8 h-8" />,
    ambulatorio: <Ambulance className="w-8 h-8" />,
    lider: <Shield className="w-8 h-8" />,
    seguranca: <Shield className="w-8 h-8" />,
    outro: <Phone className="w-8 h-8" />
  };

  const colorMap = {
    bombeiros: "from-red-500 to-red-600",
    ambulatorio: "from-green-500 to-green-600",
    lider: "from-[#001e50] to-[#0066b1]",
    seguranca: "from-yellow-500 to-yellow-600",
    outro: "from-gray-500 to-gray-600"
  };

  const handleCall = (telefone) => {
    window.location.href = `tel:${telefone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#001e50]">
              Contatos de Emergência
            </h1>
          </div>
          <p className="text-gray-600 ml-15">Números importantes para situações de emergência</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contatos.map((contato) => (
            <Card key={contato.id} className="shadow-xl hover:shadow-2xl transition-all border-2 hover:border-red-300">
              <CardHeader className={`bg-gradient-to-r ${colorMap[contato.tipo]} text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    {iconMap[contato.tipo]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl">{contato.nome}</CardTitle>
                    <Badge className="mt-2 bg-white/20 text-white border-white/30">
                      {contato.tipo}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {contato.descricao && (
                    <p className="text-gray-600 text-sm">{contato.descricao}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-bold text-2xl text-[#001e50]">{contato.telefone}</span>
                    </div>
                    {contato.ramal && (
                      <div className="text-sm text-gray-600">
                        Ramal: <span className="font-semibold">{contato.ramal}</span>
                      </div>
                    )}
                  </div>

                  {contato.disponibilidade && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>Disponibilidade:</strong> {contato.disponibilidade}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleCall(contato.telefone)}
                    className={`w-full bg-gradient-to-r ${colorMap[contato.tipo]} hover:opacity-90 text-white font-semibold py-6`}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Ligar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contatos.length === 0 && (
          <Card className="shadow-xl">
            <CardContent className="py-12 text-center">
              <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum contato de emergência cadastrado</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 shadow-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Instruções Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#001e50]">Mantenha a Calma</h4>
                  <p className="text-sm text-gray-600">Em situações de emergência, mantenha a calma e avalie a situação</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#001e50]">Informe a Localização</h4>
                  <p className="text-sm text-gray-600">Ao ligar, informe claramente sua localização e o tipo de emergência</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#001e50]">Não Desligue</h4>
                  <p className="text-sm text-gray-600">Aguarde instruções e não desligue até ser autorizado</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#001e50]">Avise o Líder</h4>
                  <p className="text-sm text-gray-600">Sempre que possível, informe seu líder sobre a situação</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}