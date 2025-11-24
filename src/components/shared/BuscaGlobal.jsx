import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, ShoppingCart, Truck, Target, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BuscaGlobal({ open, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({
    pedidos: [],
    atividades: [],
    colaboradores: [],
    objetivos: [],
    avisos: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setResults({ pedidos: [], atividades: [], colaboradores: [], objetivos: [], avisos: [] });
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      handleSearch();
    } else {
      setResults({ pedidos: [], atividades: [], colaboradores: [], objetivos: [], avisos: [] });
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const [pedidos, atividades, colaboradores, objetivos, avisos] = await Promise.all([
        base44.entities.PedidoEPI.list("-created_date", 5),
        base44.entities.AtividadeLogistica.list("-created_date", 5),
        base44.entities.Versatilidade.list("-created_date", 5),
        base44.entities.Objetivo.list("-created_date", 5),
        base44.entities.Aviso.list("-created_date", 5)
      ]);

      const term = searchTerm.toLowerCase();

      setResults({
        pedidos: pedidos.filter(p => 
          p.item?.toLowerCase().includes(term) || 
          p.solicitante?.toLowerCase().includes(term)
        ).slice(0, 3),
        atividades: atividades.filter(a => 
          a.titulo?.toLowerCase().includes(term) || 
          a.descricao?.toLowerCase().includes(term)
        ).slice(0, 3),
        colaboradores: colaboradores.filter(c => 
          c.colaborador?.toLowerCase().includes(term) || 
          c.chapa?.includes(term)
        ).slice(0, 3),
        objetivos: objetivos.filter(o => 
          o.titulo?.toLowerCase().includes(term) || 
          o.descricao?.toLowerCase().includes(term)
        ).slice(0, 3),
        avisos: avisos.filter(a => 
          a.titulo?.toLowerCase().includes(term) || 
          a.conteudo?.toLowerCase().includes(term)
        ).slice(0, 3)
      });
    } catch (error) {
      console.error("Erro na busca:", error);
    }
    setLoading(false);
  };

  const handleNavigate = (page) => {
    navigate(createPageUrl(page));
    onClose();
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar em todo o app... (digite 3+ caracteres)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg"
              autoFocus
            />
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066b1] mx-auto"></div>
            </div>
          )}

          {!loading && searchTerm.length > 2 && totalResults === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum resultado encontrado</p>
            </div>
          )}

          {!loading && totalResults > 0 && (
            <div className="space-y-6">
              {results.pedidos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Pedidos de EPI ({results.pedidos.length})
                  </h3>
                  <div className="space-y-2">
                    {results.pedidos.map(pedido => (
                      <div
                        key={pedido.id}
                        onClick={() => handleNavigate("PedidosEPI")}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{pedido.item}</p>
                        <p className="text-sm text-gray-500">Por: {pedido.solicitante}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.atividades.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Atividades de Logística ({results.atividades.length})
                  </h3>
                  <div className="space-y-2">
                    {results.atividades.map(atividade => (
                      <div
                        key={atividade.id}
                        onClick={() => handleNavigate("Logistica")}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{atividade.titulo}</p>
                        <p className="text-sm text-gray-500">{atividade.descricao?.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.colaboradores.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Colaboradores ({results.colaboradores.length})
                  </h3>
                  <div className="space-y-2">
                    {results.colaboradores.map(colab => (
                      <div
                        key={colab.id}
                        onClick={() => handleNavigate("Versatilidade")}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{colab.colaborador}</p>
                        <p className="text-sm text-gray-500">Chapa: {colab.chapa} | Equipe: {colab.equipe}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.objetivos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivos ({results.objetivos.length})
                  </h3>
                  <div className="space-y-2">
                    {results.objetivos.map(objetivo => (
                      <div
                        key={objetivo.id}
                        onClick={() => handleNavigate("Objetivos")}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{objetivo.titulo}</p>
                        <p className="text-sm text-gray-500">{objetivo.descricao?.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.avisos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Avisos ({results.avisos.length})
                  </h3>
                  <div className="space-y-2">
                    {results.avisos.map(aviso => (
                      <div
                        key={aviso.id}
                        onClick={() => handleNavigate("Avisos")}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{aviso.titulo}</p>
                        <p className="text-sm text-gray-500">{aviso.conteudo?.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t text-center text-sm text-gray-500">
            Dica: Use <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded">K</kbd> para abrir a busca rapidamente
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}