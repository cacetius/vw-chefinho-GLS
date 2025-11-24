import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Search, Download, Eye, Plus, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentoForm from "../components/documentos/DocumentoForm";
import { AnimatePresence, motion } from "framer-motion";

export default function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadDocumentos();
  }, []);

  useEffect(() => {
    filterDocumentos();
  }, [searchTerm, categoriaFilter, documentos]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadDocumentos = async () => {
    const data = await base44.entities.Documento.list("-created_date");
    setDocumentos(data);
  };

  const filterDocumentos = () => {
    let filtered = documentos;

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoriaFilter !== "todos") {
      filtered = filtered.filter(d => d.categoria === categoriaFilter);
    }

    setFilteredDocumentos(filtered);
  };

  const handleVisualizacao = async (doc) => {
    await base44.entities.Documento.update(doc.id, {
      ...doc,
      visualizacoes: (doc.visualizacoes || 0) + 1
    });
    window.open(doc.arquivo_url, '_blank');
    loadDocumentos();
  };

  const handleSubmit = async (docData) => {
    await base44.entities.Documento.create(docData);
    setShowForm(false);
    loadDocumentos();
  };

  const categoriaColors = {
    procedimento: "bg-blue-100 text-blue-800",
    manual: "bg-green-100 text-green-800",
    politica: "bg-purple-100 text-purple-800",
    seguranca: "bg-red-100 text-red-800",
    qualidade: "bg-yellow-100 text-yellow-800",
    treinamento: "bg-indigo-100 text-indigo-800",
    outro: "bg-gray-100 text-gray-800"
  };

  const hasLeaderAccess = currentUser?.cargo === "lider" ||
    (currentUser?.cargo_temporario === "lider" &&
     currentUser?.data_cargo_temporario &&
     new Date(currentUser.data_cargo_temporario) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#001e50] flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#0066b1]" />
              Biblioteca de Documentos
            </h1>
            <p className="text-gray-600 mt-1">Procedimentos, manuais e políticas da empresa</p>
          </div>
          {hasLeaderAccess && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#001e50] to-[#0066b1]">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Documento
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm">Total de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{documentos.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm">Procedimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {documentos.filter(d => d.categoria === "procedimento").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-sm">Manuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {documentos.filter(d => d.categoria === "manual").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-sm">Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {documentos.filter(d => d.categoria === "seguranca").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <DocumentoForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>

        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar documentos, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas Categorias</SelectItem>
                    <SelectItem value="procedimento">Procedimentos</SelectItem>
                    <SelectItem value="manual">Manuais</SelectItem>
                    <SelectItem value="politica">Políticas</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDocumentos.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <FileText className="w-10 h-10 text-[#0066b1]" />
                      <Badge className={categoriaColors[doc.categoria]}>
                        {doc.categoria}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{doc.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {doc.descricao && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{doc.descricao}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {doc.versao && (
                        <div className="text-xs text-gray-500">
                          <span className="font-semibold">Versão:</span> {doc.versao}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Autor:</span> {doc.autor}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Visualizações:</span> {doc.visualizacoes || 0}
                      </div>
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVisualizacao(doc)}
                        className="flex-1 bg-[#0066b1] hover:bg-[#004d82]"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        onClick={() => window.open(doc.arquivo_url, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDocumentos.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum documento encontrado</p>
                <p className="text-sm mt-2">Tente ajustar os filtros ou a busca</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}