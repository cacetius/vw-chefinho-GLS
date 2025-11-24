import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, AlertTriangle, CheckCircle, Clock, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LinhaVisual({ carros, onEdit }) {
  const [carrosAnimados, setCarrosAnimados] = useState(carros);

  useEffect(() => {
    setCarrosAnimados(carros);
  }, [carros]);

  const estacoes = [
    { id: "entrada", nome: "Entrada", icon: "🚪", color: "from-gray-500 to-gray-600", categoria: "Recebimento" },
    
    { id: "chaparia_solda", nome: "Chaparia Solda", icon: "⚡", color: "from-slate-400 to-slate-500", categoria: "Chaparia" },
    { id: "chaparia_geometria", nome: "Geometria", icon: "📐", color: "from-slate-500 to-slate-600", categoria: "Chaparia" },
    
    { id: "zp1_piso", nome: "ZP1 - Piso", icon: "🔲", color: "from-blue-400 to-blue-500", categoria: "Montagem ZP" },
    { id: "zp2_lateral", nome: "ZP2 - Lateral", icon: "🔳", color: "from-blue-500 to-blue-600", categoria: "Montagem ZP" },
    { id: "zp3_teto", nome: "ZP3 - Teto", icon: "🏠", color: "from-blue-600 to-indigo-500", categoria: "Montagem ZP" },
    { id: "zp4_portas", nome: "ZP4 - Portas", icon: "🚪", color: "from-indigo-500 to-indigo-600", categoria: "Montagem ZP" },
    { id: "zp5_suspensao_dianteira", nome: "ZP5 - Susp. Diant.", icon: "🔧", color: "from-indigo-600 to-purple-500", categoria: "Montagem ZP" },
    { id: "zp6_motor_cambio", nome: "ZP6 - Motor/Câmbio", icon: "⚙️", color: "from-purple-500 to-purple-600", categoria: "Montagem ZP" },
    { id: "zp7_suspensao_traseira", nome: "ZP7 - Susp. Tras.", icon: "🔩", color: "from-purple-600 to-purple-700", categoria: "Montagem ZP" },
    { id: "zp8_rodas_pneus", nome: "ZP8 - Rodas/Pneus", icon: "⭕", color: "from-purple-700 to-violet-600", categoria: "Montagem ZP" },
    { id: "zp9_parachoque_dianteiro", nome: "ZP9 - Para-choque Diant.", icon: "🛡️", color: "from-violet-600 to-violet-700", categoria: "Montagem ZP" },
    { id: "zp10_parachoque_traseiro", nome: "ZP10 - Para-choque Tras.", icon: "🛡️", color: "from-violet-700 to-fuchsia-600", categoria: "Montagem ZP" },
    { id: "zp11_chicotes_eletricos", nome: "ZP11 - Chicotes", icon: "🔌", color: "from-fuchsia-600 to-fuchsia-700", categoria: "Montagem ZP" },
    { id: "zp12_painel_instrumentos", nome: "ZP12 - Painel", icon: "📊", color: "from-fuchsia-700 to-pink-600", categoria: "Montagem ZP" },
    { id: "zp13_bancos", nome: "ZP13 - Bancos", icon: "💺", color: "from-pink-600 to-pink-700", categoria: "Montagem ZP" },
    { id: "zp14_vidros", nome: "ZP14 - Vidros", icon: "🪟", color: "from-pink-700 to-rose-600", categoria: "Montagem ZP" },
    { id: "zp15_acabamento_interno", nome: "ZP15 - Acab. Interno", icon: "✨", color: "from-rose-600 to-rose-700", categoria: "Montagem ZP" },
    { id: "zp16_capo_tampa", nome: "ZP16 - Capô/Tampa", icon: "📦", color: "from-rose-700 to-red-600", categoria: "Montagem ZP" },
    
    { id: "pintura_fosfatizacao", nome: "Fosfatização", icon: "🧪", color: "from-cyan-400 to-cyan-500", categoria: "Pintura" },
    { id: "pintura_ecoat", nome: "E-Coat", icon: "🔋", color: "from-cyan-500 to-cyan-600", categoria: "Pintura" },
    { id: "pintura_primer", nome: "Primer", icon: "🖌️", color: "from-cyan-600 to-teal-500", categoria: "Pintura" },
    { id: "pintura_base", nome: "Base Coat", icon: "🎨", color: "from-teal-500 to-teal-600", categoria: "Pintura" },
    { id: "pintura_verniz", nome: "Verniz", icon: "✨", color: "from-teal-600 to-emerald-500", categoria: "Pintura" },
    { id: "pintura_secagem", nome: "Secagem", icon: "💨", color: "from-emerald-500 to-emerald-600", categoria: "Pintura" },
    
    { id: "pcp_polimento", nome: "PCP - Polimento", icon: "💎", color: "from-amber-400 to-amber-500", categoria: "PCP" },
    { id: "pcp_retoque", nome: "PCP - Retoque", icon: "🖊️", color: "from-amber-500 to-amber-600", categoria: "PCP" },
    
    { id: "qualidade_auditoria", nome: "Auditoria 100%", icon: "🔍", color: "from-lime-500 to-lime-600", categoria: "Qualidade" },
    { id: "qualidade_agua", nome: "Teste Água", icon: "💧", color: "from-lime-600 to-green-500", categoria: "Qualidade" },
    { id: "teste_dinamometro", nome: "Dinamômetro", icon: "📈", color: "from-green-500 to-green-600", categoria: "Testes" },
    { id: "teste_alinhamento", nome: "Alinhamento", icon: "🎯", color: "from-green-600 to-emerald-500", categoria: "Testes" },
    { id: "teste_luz", nome: "Teste Farol", icon: "💡", color: "from-emerald-500 to-emerald-600", categoria: "Testes" },
    { id: "teste_road", nome: "Road Test", icon: "🛣️", color: "from-emerald-600 to-teal-600", categoria: "Testes" },
    
    { id: "expedicao_limpeza", nome: "Limpeza Final", icon: "🧽", color: "from-sky-500 to-sky-600", categoria: "Expedição" },
    { id: "expedicao_final", nome: "Expedição", icon: "📦", color: "from-sky-600 to-blue-600", categoria: "Expedição" },
    { id: "saida", nome: "Saída", icon: "🏁", color: "from-emerald-500 to-emerald-600", categoria: "Expedição" }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "erro": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "concluido": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "em_processo": return <Clock className="w-5 h-5 text-blue-600" />;
      case "alerta": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Car className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "erro": return "border-red-500 bg-red-50";
      case "concluido": return "border-green-500 bg-green-50";
      case "em_processo": return "border-blue-500 bg-blue-50";
      case "alerta": return "border-yellow-500 bg-yellow-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  // Agrupar estações por categoria para visualização melhor
  const estacoesAgrupadas = estacoes.reduce((acc, estacao) => {
    if (!acc[estacao.categoria]) {
      acc[estacao.categoria] = [];
    }
    acc[estacao.categoria].push(estacao);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Diagrama de Fluxo da Linha */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border-2 border-blue-200">
        {/* Título do Diagrama */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Fluxo de Produção Detalhado - Tempo Real</h3>
              <p className="text-sm text-gray-600">Atualização automática • {carrosAnimados.length} veículos • 16 estações</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
          />
        </div>

        {/* Fluxo por Categorias */}
        <div className="space-y-6">
          {Object.entries(estacoesAgrupadas).map(([categoria, estacoesCategoria], catIndex) => (
            <div key={categoria} className="relative">
              {/* Título da Categoria */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300"></div>
                <h4 className="text-lg font-bold text-gray-700 px-4 py-2 bg-white rounded-full shadow-md border-2 border-gray-200">
                  {categoria}
                </h4>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></div>
              </div>

              {/* Linha de Fluxo da Categoria */}
              <div className="relative">
                <div className="absolute top-10 left-0 right-0 h-1 z-0">
                  <div className="h-full bg-gradient-to-r from-gray-300 via-blue-400 to-blue-600 rounded-full"></div>
                </div>

                {/* Estações da Categoria */}
                <div className="relative z-10 flex justify-start items-start gap-4 overflow-x-auto pb-4">
                  {estacoesCategoria.map((estacao, index) => {
                    const carrosNaEstacao = carrosAnimados.filter(c => c.estacao_atual === estacao.id);
                    const temErro = carrosNaEstacao.some(c => c.status === "erro");
                    const temAlerta = carrosNaEstacao.some(c => c.status === "alerta");
                    
                    return (
                      <React.Fragment key={estacao.id}>
                        {/* Estação */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: catIndex * 0.2 + index * 0.1, type: "spring" }}
                          className="flex flex-col items-center min-w-[100px]"
                        >
                          {/* Ícone da Estação */}
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className={`relative w-20 h-20 bg-gradient-to-br ${estacao.color} rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer border-4 ${
                              temErro ? 'border-red-500 animate-pulse' : 
                              temAlerta ? 'border-yellow-500 animate-pulse' : 
                              'border-white'
                            }`}
                          >
                            <span className="text-3xl mb-1">{estacao.icon}</span>
                            
                            {/* Contador de Carros */}
                            {carrosNaEstacao.length > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-500"
                              >
                                <span className="text-xs font-bold text-blue-600">{carrosNaEstacao.length}</span>
                              </motion.div>
                            )}

                            {/* Indicador de Problema */}
                            {temErro && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 rounded-full shadow-xl flex items-center justify-center"
                              >
                                <AlertTriangle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                            
                            {temAlerta && !temErro && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full shadow-xl flex items-center justify-center"
                              >
                                <AlertTriangle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Nome da Estação */}
                          <p className="font-bold text-xs text-gray-900 text-center mt-2 max-w-[90px]">
                            {estacao.nome}
                          </p>
                          
                          {/* Preview dos Carros */}
                          {carrosNaEstacao.length > 0 && (
                            <div className="mt-2 flex gap-1 flex-wrap justify-center max-w-[90px]">
                              <AnimatePresence>
                                {carrosNaEstacao.slice(0, 2).map((carro, idx) => (
                                  <motion.div
                                    key={carro.id}
                                    initial={{ scale: 0, y: 10 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0, y: -10 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.4, zIndex: 10 }}
                                    onClick={() => onEdit(carro)}
                                    className="cursor-pointer"
                                  >
                                    <div 
                                      className={`w-5 h-5 rounded-md shadow-lg border-2 border-white flex items-center justify-center ${
                                        carro.status === "erro" ? "bg-red-500" :
                                        carro.status === "alerta" ? "bg-yellow-500" :
                                        "bg-blue-500"
                                      }`}
                                      style={{ backgroundColor: carro.status === "ok" || carro.status === "em_processo" ? carro.cor : undefined }}
                                    >
                                      <Car className="w-3 h-3 text-white" />
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              {carrosNaEstacao.length > 2 && (
                                <div className="w-5 h-5 rounded-md bg-gray-300 shadow flex items-center justify-center text-[10px] font-bold">
                                  +{carrosNaEstacao.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>

                        {/* Seta de Fluxo entre estações */}
                        {index < estacoesCategoria.length - 1 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: catIndex * 0.2 + index * 0.1 + 0.2 }}
                            className="flex items-center pt-8"
                          >
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <ArrowRight className="w-6 h-6 text-blue-600" />
                            </motion.div>
                          </motion.div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carros Detalhados - Expandível por Estação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {estacoes.map((estacao, index) => {
          const carrosNaEstacao = carrosAnimados.filter(c => c.estacao_atual === estacao.id);
          
          if (carrosNaEstacao.length === 0) return null;
          
          return (
            <motion.div
              key={estacao.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-xl border-0 hover:shadow-2xl transition-all">
                <CardContent className="pt-6">
                  {/* Header da Estação */}
                  <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${estacao.color} text-white text-center`}>
                    <div className="text-2xl mb-1">{estacao.icon}</div>
                    <p className="font-bold text-sm">{estacao.nome}</p>
                  </div>

                  {/* Lista de Carros */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {carrosNaEstacao.map((carro, carroIdx) => (
                      <motion.div
                        key={carro.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: carroIdx * 0.05 }}
                        whileHover={{ scale: 1.03, x: 5 }}
                        onClick={() => onEdit(carro)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(carro.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            <span className="font-bold text-xs">{carro.modelo}</span>
                          </div>
                          {getStatusIcon(carro.status)}
                        </div>
                        <p className="text-xs text-gray-600 truncate font-mono">
                          {carro.chassi.slice(-8)}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: carro.cor || '#999' }}
                          ></div>
                          <span className="text-xs text-gray-600">{carro.cor}</span>
                        </div>
                        {carro.problemas && carro.problemas.length > 0 && (
                          <Badge className="mt-2 bg-red-100 text-red-800 text-xs w-full">
                            {carro.problemas.length} {carro.problemas.length === 1 ? 'problema' : 'problemas'}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Legenda */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-gray-900">Legenda de Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-red-500 bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium">Erro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-yellow-500 bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-blue-500 bg-blue-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Em Processo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-green-500 bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-gray-300 bg-gray-50 flex items-center justify-center">
                <Car className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium">Aguardando</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}