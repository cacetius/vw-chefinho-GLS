import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Plus, Hash, Users, Paperclip, Smile, Pin, Search, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Chat() {
  const [canais, setCanais] = useState([]);
  const [canalAtivo, setCanalAtivo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newChannelData, setNewChannelData] = useState({
    nome: "",
    descricao: "",
    tipo: "geral",
    privado: false
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUser();
    loadCanais();
  }, []);

  useEffect(() => {
    if (canalAtivo) {
      loadMensagens();
      const interval = setInterval(loadMensagens, 3000);
      return () => clearInterval(interval);
    }
  }, [canalAtivo]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadCanais = async () => {
    const data = await base44.entities.CanalChat.list();
    setCanais(data);
    if (data.length > 0 && !canalAtivo) {
      setCanalAtivo(data[0]);
    }
  };

  const loadMensagens = async () => {
    if (!canalAtivo) return;
    const data = await base44.entities.MensagemChat.filter({ canal_id: canalAtivo.id }, "created_date");
    setMensagens(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || sending || !canalAtivo) return;

    setSending(true);
    
    // Detectar menções (@usuario)
    const mencoes = novaMensagem.match(/@\w+/g) || [];
    
    await base44.entities.MensagemChat.create({
      canal_id: canalAtivo.id,
      remetente: currentUser.nome_exibicao || currentUser.full_name,
      remetente_id: currentUser.id,
      mensagem: novaMensagem,
      cargo_remetente: currentUser.cargo,
      mencoes: mencoes,
      anexos: []
    });
    
    setNovaMensagem("");
    await loadMensagens();
    setSending(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !canalAtivo) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.MensagemChat.create({
        canal_id: canalAtivo.id,
        remetente: currentUser.nome_exibicao || currentUser.full_name,
        remetente_id: currentUser.id,
        mensagem: `📎 Compartilhou um arquivo`,
        cargo_remetente: currentUser.cargo,
        anexos: [{
          tipo: file.type.startsWith('image/') ? 'imagem' : 'documento',
          url: file_url,
          nome: file.name
        }]
      });
      
      await loadMensagens();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const handleCreateChannel = async () => {
    if (!newChannelData.nome.trim()) return;

    await base44.entities.CanalChat.create({
      ...newChannelData,
      criado_por: currentUser.id,
      membros: [currentUser.id]
    });

    setShowNewChannel(false);
    setNewChannelData({ nome: "", descricao: "", tipo: "geral", privado: false });
    loadCanais();
  };

  const handleFixMessage = async (mensagem) => {
    await base44.entities.MensagemChat.update(mensagem.id, {
      ...mensagem,
      fixada: !mensagem.fixada
    });
    loadMensagens();
  };

  const handleDeleteMessage = async (mensagemId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    await base44.entities.MensagemChat.delete(mensagemId);
    loadMensagens();
  };

  const filteredMensagens = mensagens.filter(msg =>
    msg.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.remetente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mensagensFixadas = mensagens.filter(m => m.fixada);

  return (
    <div className="h-[calc(100vh-120px)] md:h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <div className="p-3 md:p-6 border-b bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-xs md:text-sm text-gray-500 hidden md:block">Comunicação em tempo real</p>
              </div>
            </div>
            <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-xs md:text-sm px-3 md:px-4">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Novo Canal</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Canal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Nome do Canal</Label>
                    <Input
                      placeholder="Ex: Equipe Manhã, Projeto X"
                      value={newChannelData.nome}
                      onChange={(e) => setNewChannelData({...newChannelData, nome: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva o propósito do canal"
                      value={newChannelData.descricao}
                      onChange={(e) => setNewChannelData({...newChannelData, descricao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newChannelData.tipo}
                      onValueChange={(value) => setNewChannelData({...newChannelData, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="equipe">Equipe</SelectItem>
                        <SelectItem value="turno">Turno</SelectItem>
                        <SelectItem value="projeto">Projeto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newChannelData.privado}
                      onChange={(e) => setNewChannelData({...newChannelData, privado: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label>Canal Privado</Label>
                  </div>
                  <Button onClick={handleCreateChannel} className="w-full">
                    Criar Canal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Lista de Canais - Mobile: horizontal, Desktop: vertical */}
        <div className="md:w-56 bg-white border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto flex-shrink-0">
          <div className="p-2 md:p-4 flex md:flex-col gap-2 md:gap-1">
            <h3 className="hidden md:block text-xs font-semibold text-gray-500 uppercase mb-2">Canais</h3>
            {canais.map((canal) => (
              <button
                key={canal.id}
                onClick={() => setCanalAtivo(canal)}
                className={`flex-shrink-0 md:w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                  canalAtivo?.id === canal.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 md:bg-transparent hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{canal.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header do Canal */}
          {canalAtivo && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-500" />
                <div>
                  <h2 className="font-semibold text-gray-900">{canalAtivo.nome}</h2>
                  {canalAtivo.descricao && (
                    <p className="text-xs text-gray-500">{canalAtivo.descricao}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mensagens Fixadas */}
          {mensagensFixadas.length > 0 && (
            <div className="p-3 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-start gap-2">
                <Pin className="w-4 h-4 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">Mensagens Fixadas</p>
                  {mensagensFixadas.map((msg) => (
                    <p key={msg.id} className="text-sm text-yellow-800">
                      <span className="font-medium">{msg.remetente}:</span> {msg.mensagem}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {filteredMensagens.map((msg) => {
                  const isCurrentUser = msg.remetente_id === currentUser?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="group"
                    >
                      <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className={`${
                            msg.cargo_remetente === 'lider' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-br from-gray-500 to-gray-600'
                          } text-white font-semibold`}>
                            {msg.remetente?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{msg.remetente}</span>
                            <Badge variant="outline" className="text-xs">
                              {msg.cargo_remetente === 'lider' ? 'Líder' : 'Monitor'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.created_date).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            
                            {/* Menu de opções */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {currentUser?.cargo === 'lider' && (
                                  <DropdownMenuItem onClick={() => handleFixMessage(msg)}>
                                    <Pin className={`w-4 h-4 mr-2 ${msg.fixada ? 'text-yellow-600' : ''}`} />
                                    {msg.fixada ? 'Desafixar' : 'Fixar mensagem'}
                                  </DropdownMenuItem>
                                )}
                                {(isCurrentUser || currentUser?.cargo === 'lider') && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir mensagem
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className={`rounded-2xl px-4 py-3 ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm' 
                              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.mensagem}</p>
                            
                            {/* Anexos */}
                            {msg.anexos && msg.anexos.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.anexos.map((anexo, idx) => (
                                  <div key={idx}>
                                    {anexo.tipo === 'imagem' ? (
                                      <img
                                        src={anexo.url}
                                        alt={anexo.nome}
                                        className="rounded-lg max-w-xs cursor-pointer"
                                        onClick={() => window.open(anexo.url, '_blank')}
                                      />
                                    ) : (
                                      <a
                                        href={anexo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-2 rounded ${
                                          isCurrentUser ? 'bg-white/20' : 'bg-white'
                                        }`}
                                      >
                                        <Paperclip className="w-4 h-4" />
                                        <span className="text-sm">{anexo.nome}</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 border-t bg-white">
            <form onSubmit={handleEnviar} className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Input
                placeholder="Digite sua mensagem... (use @ para mencionar alguém)"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                className="flex-1"
                disabled={sending || !canalAtivo}
              />
              
              <Button 
                type="submit" 
                disabled={!novaMensagem.trim() || sending || !canalAtivo}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Dica: Use @ seguido do nome para mencionar alguém
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}