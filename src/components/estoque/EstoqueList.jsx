import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle, MapPin, DollarSign } from "lucide-react";

export default function EstoqueList({ itens, onEdit, onDelete, hasLeaderAccess }) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {itens.map((item) => {
          const estoqueBaixo = item.quantidade_atual <= item.quantidade_minima;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`shadow-lg hover:shadow-xl transition-shadow ${estoqueBaixo ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{item.item}</h3>
                      {estoqueBaixo && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.categoria}</Badge>
                      <Badge variant="outline">
                        {item.quantidade_atual} {item.unidade}
                      </Badge>
                      {item.localizacao && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.localizacao}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {hasLeaderAccess && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Estoque Mínimo</p>
                      <p className="font-semibold">{item.quantidade_minima} {item.unidade}</p>
                    </div>
                    {item.preco_atual > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Preço Unitário
                        </p>
                        <p className="font-semibold">R$ {item.preco_atual.toFixed(2)}</p>
                      </div>
                    )}
                    {item.fornecedor && (
                      <div>
                        <p className="text-sm text-gray-500">Fornecedor</p>
                        <p className="font-semibold">{item.fornecedor}</p>
                      </div>
                    )}
                    {item.validade && (
                      <div>
                        <p className="text-sm text-gray-500">Validade</p>
                        <p className="font-semibold">
                          {new Date(item.validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {item.preco_atual > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Valor Total em Estoque</span>
                        <span className="text-xl font-bold text-green-600">
                          R$ {(item.quantidade_atual * item.preco_atual).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {itens.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Nenhum item cadastrado no estoque</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}