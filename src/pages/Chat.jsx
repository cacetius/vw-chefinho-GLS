import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, MessageSquare, Plus, Hash, Paperclip, Pin,
  Trash2, MoreVertical, Pencil, X, Check, Settings,
  Lock, Globe, Search
} from "lucide-react";

export default function Chat() {
  const [canalAtivo, setCanalAtivo] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChannels, setShowChannels] = useState(false);
  const [channelForm, setChannelForm] = useState({ nome: "", descricao: "", tipo: "geral", privado: false });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [canalAtivo]);

  const { data: canais = [] } = useQuery({
    queryKey: ["canais-chat"],
    queryFn: async () => {
      const data = await base44.entities.CanalChat.list();
      if (data.length > 0 && !canalAtivo) setCanalAtivo(data[0]);
      return data;
    },
    refetchInterval: 30000
  });

  const { data: mensagens = [] } = useQuery({
    queryKey: ["mensagens-chat", canalAtivo?.id],
    queryFn: () => base44.entities.MensagemChat.filter({ canal_id: canalAtivo.id }, "created_date"),
    enabled: !!canalAtivo,
    refetchInterval: 3000
  });

  // ── Mutations ──
  const createMsgMut = useMutation({
    mutationFn: (data) => base44.entities.MensagemChat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens-chat", canalAtivo?.id] });
      setNovaMensagem(""); setSending(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  });

  const updateMsgMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MensagemChat.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mensagens-chat", canalAtivo?.id] }); setEditingMsg(null); }
  });

  const deleteMsgMut = useMutation({
    mutationFn: (id) => base44.entities.MensagemChat.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mensagens-chat", canalAtivo?.id] })
  });

  const createCanalMut = useMutation({
    mutationFn: (data) => base44.entities.CanalChat.create(data),
    onSuccess: (novo) => {
      queryClient.invalidateQueries({ queryKey: ["canais-chat"] });
      setShowNewChannel(false);
      setCanalAtivo(novo);
      setChannelForm({ nome: "", descricao: "", tipo: "geral", privado: false });
    }
  });

  const updateCanalMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CanalChat.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canais-chat"] });
      setEditingChannel(null);
    }
  });

  const deleteCanalMut = useMutation({
    mutationFn: (id) => base44.entities.CanalChat.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canais-chat"] });
      setCanalAtivo(null);
    }
  });

  const uploadFileMut = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return { file_url, file };
    },
    onSuccess: ({ file_url, file }) => {
      createMsgMut.mutate({
        canal_id: canalAtivo.id,
        remetente: currentUser.nome_exibicao || currentUser.full_name,
        remetente_id: currentUser.id,
        mensagem: `📎 ${file.name}`,
        cargo_remetente: currentUser.cargo,
        anexos: [{ tipo: file.type.startsWith('image/') ? 'imagem' : 'documento', url: file_url, nome: file.name }]
      });
      setUploading(false);
    }
  });

  // ── Handlers ──
  const handleEnviar = (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || sending || !canalAtivo) return;
    setSending(true);
    createMsgMut.mutate({
      canal_id: canalAtivo.id,
      remetente: currentUser.nome_exibicao || currentUser.full_name,
      remetente_id: currentUser.id,
      mensagem: novaMensagem,
      cargo_remetente: currentUser.cargo,
      mencoes: novaMensagem.match(/@\w+/g) || [],
      anexos: []
    });
  };

  const handleSaveEdit = () => {
    if (!editingMsgText.trim()) return;
    updateMsgMut.mutate({ id: editingMsg.id, data: { ...editingMsg, mensagem: editingMsgText } });
  };

  const handleFixar = (msg) => {
    updateMsgMut.mutate({ id: msg.id, data: { ...msg, fixada: !msg.fixada } });
  };

  const handleSaveChannel = () => {
    if (!channelForm.nome.trim()) return;
    if (editingChannel) {
      updateCanalMut.mutate({ id: editingChannel.id, data: { ...editingChannel, ...channelForm } });
    } else {
      createCanalMut.mutate({ ...channelForm, criado_por: currentUser.id, membros: [currentUser.id] });
    }
  };

  const handleDeleteCanal = (canal) => {
    if (!window.confirm(`Excluir o canal "${canal.nome}"? Todas as mensagens serão perdidas.`)) return;
    deleteCanalMut.mutate(canal.id);
  };

  const openEditChannel = (canal) => {
    setEditingChannel(canal);
    setChannelForm({ nome: canal.nome, descricao: canal.descricao || "", tipo: canal.tipo, privado: canal.privado || false });
    setShowNewChannel(true);
  };

  const mensagensFixadas = mensagens.filter(m => m.fixada);
  const filteredMensagens = mensagens.filter(msg =>
    !searchTerm ||
    msg.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.remetente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar mensagens..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm" />
        </div>
        <Button size="sm" className="h-9 bg-[#0066b1] hover:bg-[#004d82]"
          onClick={() => { setEditingChannel(null); setChannelForm({ nome: "", descricao: "", tipo: "geral", privado: false }); setShowNewChannel(true); }}>
          <Plus className="w-4 h-4 md:mr-1.5" /><span className="hidden md:inline">Novo Canal</span>
        </Button>
      </div>

      <div className="flex flex-1 gap-3 min-h-0">

        {/* ── Sidebar canais (desktop) ── */}
        <div className="hidden md:flex flex-col w-52 flex-shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Canais</span>
            <span className="text-[10px] text-slate-400">{canais.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
            {canais.map(canal => (
              <div key={canal.id}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all ${
                  canalAtivo?.id === canal.id ? "bg-[#0066b1] text-white" : "hover:bg-slate-100 text-slate-700"
                }`}
                onClick={() => setCanalAtivo(canal)}
              >
                {canal.privado ? <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-60" /> : <Hash className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
                <span className="flex-1 text-sm truncate font-medium">{canal.nome}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${canalAtivo?.id === canal.id ? "hover:bg-white/20" : "hover:bg-slate-200"}`}
                      onClick={e => e.stopPropagation()}>
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => openEditChannel(canal)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Editar canal
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteCanal(canal)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir canal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* ── Área de mensagens ── */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden min-w-0">
          {/* Canal header */}
          {canalAtivo ? (
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5 flex-shrink-0">
              {/* Mobile: botão canais */}
              <button className="md:hidden p-1 rounded-lg hover:bg-slate-100"
                onClick={() => setShowChannels(true)}>
                <Hash className="w-4 h-4 text-slate-500" />
              </button>
              {canalAtivo.privado ? <Lock className="w-4 h-4 text-slate-400 hidden md:block" /> : <Hash className="w-4 h-4 text-slate-400 hidden md:block" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{canalAtivo.nome}</p>
                {canalAtivo.descricao && <p className="text-[10px] text-slate-400 truncate">{canalAtivo.descricao}</p>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100"><Settings className="w-4 h-4 text-slate-400" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditChannel(canalAtivo)}>
                    <Pencil className="w-4 h-4 mr-2" /> Editar canal
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCanal(canalAtivo)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir canal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
              <button className="md:hidden p-1 rounded-lg hover:bg-slate-100" onClick={() => setShowChannels(true)}>
                <Hash className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-sm text-slate-400">Selecione um canal</span>
            </div>
          )}

          {/* Mensagens fixadas */}
          {mensagensFixadas.length > 0 && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-start gap-2 flex-shrink-0">
              <Pin className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {mensagensFixadas.slice(0, 2).map(m => (
                  <p key={m.id} className="text-xs text-amber-800 truncate">
                    <strong>{m.remetente}:</strong> {m.mensagem}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Lista de mensagens */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-1">
            {filteredMensagens.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{canalAtivo ? "Nenhuma mensagem ainda" : "Selecione um canal"}</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {filteredMensagens.map((msg) => {
                const isMe = msg.remetente_id === currentUser?.id;
                const isLider = currentUser?.cargo === "lider" || 
                  (currentUser?.cargo_temporario === "lider" && currentUser?.data_cargo_temporario && new Date(currentUser.data_cargo_temporario) >= new Date());
                const isEditing = editingMsg?.id === msg.id;
                return (
                  <motion.div key={msg.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="group"
                  >
                    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                        <AvatarFallback className={`text-white text-xs font-bold ${isMe ? "bg-[#0066b1]" : "bg-slate-500"}`}>
                          {msg.remetente?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`flex items-baseline gap-1.5 mb-0.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-xs font-semibold text-slate-700">{msg.remetente}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {msg.fixada && <Pin className="w-3 h-3 text-amber-500" />}
                        </div>

                        {isEditing ? (
                          <div className="flex gap-1.5 w-full">
                            <Input value={editingMsgText} onChange={e => setEditingMsgText(e.target.value)} autoFocus
                              className="h-8 text-sm flex-1"
                              onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditingMsg(null); }} />
                            <button onClick={handleSaveEdit} className="p-1.5 rounded-lg bg-green-100 text-green-700"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingMsg(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe ? "bg-[#0066b1] text-white rounded-tr-sm" : "bg-slate-100 text-slate-900 rounded-tl-sm"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.mensagem}</p>
                            {msg.anexos?.map((a, i) => (
                              <div key={i} className="mt-1.5">
                                {a.tipo === "imagem"
                                  ? <img src={a.url} alt={a.nome} className="rounded-lg max-w-[180px] cursor-pointer" onClick={() => window.open(a.url, "_blank")} />
                                  : <a href={a.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${isMe ? "bg-white/20" : "bg-white"}`}>
                                      <Paperclip className="w-3 h-3" />{a.nome}
                                    </a>
                                }
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (isMe || isLider) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="self-center p-1.5 rounded-lg md:opacity-0 md:group-hover:opacity-100 active:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-100 flex-shrink-0 touch-manipulation">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isMe ? "end" : "start"} className="w-44">
                            {isMe && (
                              <DropdownMenuItem onClick={() => { setEditingMsg(msg); setEditingMsgText(msg.mensagem); }}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Editar mensagem
                              </DropdownMenuItem>
                            )}
                            {isLider && (
                              <DropdownMenuItem onClick={() => handleFixar(msg)}>
                                <Pin className="w-3.5 h-3.5 mr-2" /> {msg.fixada ? "Desafixar" : "Fixar"}
                              </DropdownMenuItem>
                            )}
                            {(isMe || isLider) && (
                              <DropdownMenuItem className="text-red-600 focus:text-red-600"
                                onClick={() => window.confirm("Excluir mensagem?") && deleteMsgMut.mutate(msg.id)}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 flex-shrink-0">
            <form onSubmit={handleEnviar} className="flex gap-2">
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={e => {
                const file = e.target.files?.[0];
                if (file && canalAtivo) { setUploading(true); uploadFileMut.mutate(file); }
              }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              <Input
                placeholder={canalAtivo ? "Mensagem..." : "Selecione um canal"}
                value={novaMensagem}
                onChange={e => setNovaMensagem(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(e); } }}
                disabled={!canalAtivo || sending}
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" disabled={!novaMensagem.trim() || sending || !canalAtivo}
                className="h-9 w-9 p-0 bg-[#0066b1] hover:bg-[#004d82]">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Mobile: drawer canais ── */}
      <AnimatePresence>
        {showChannels && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setShowChannels(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 md:hidden flex flex-col shadow-xl">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm">Canais</p>
                <button onClick={() => setShowChannels(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-2">
                {canais.map(canal => (
                  <div key={canal.id}
                    className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl mb-1 cursor-pointer active:scale-[0.98] transition-all ${
                      canalAtivo?.id === canal.id ? "bg-[#0066b1] text-white" : "bg-slate-50 text-slate-700"
                    }`}
                    onClick={() => { setCanalAtivo(canal); setShowChannels(false); }}
                  >
                    {canal.privado ? <Lock className="w-4 h-4 flex-shrink-0 opacity-60" /> : <Hash className="w-4 h-4 flex-shrink-0 opacity-60" />}
                    <span className="flex-1 text-sm font-medium truncate">{canal.nome}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { openEditChannel(canal); setShowChannels(false); }}>
                          <Pencil className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCanal(canal)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100">
                <Button className="w-full bg-[#0066b1]"
                  onClick={() => { setEditingChannel(null); setChannelForm({ nome: "", descricao: "", tipo: "geral", privado: false }); setShowNewChannel(true); setShowChannels(false); }}>
                  <Plus className="w-4 h-4 mr-2" /> Novo Canal
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Dialog canal (criar/editar) ── */}
      <Dialog open={showNewChannel} onOpenChange={o => { setShowNewChannel(o); if (!o) setEditingChannel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChannel ? "Editar Canal" : "Novo Canal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Nome *</Label>
              <Input value={channelForm.nome} onChange={e => setChannelForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Equipe Manhã" className="mt-1" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={channelForm.descricao} onChange={e => setChannelForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Propósito do canal" className="mt-1 h-20" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={channelForm.tipo} onValueChange={v => setChannelForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">🌐 Geral</SelectItem>
                  <SelectItem value="equipe">👥 Equipe</SelectItem>
                  <SelectItem value="turno">🕐 Turno</SelectItem>
                  <SelectItem value="projeto">📋 Projeto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={channelForm.privado}
                onChange={e => setChannelForm(f => ({ ...f, privado: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Canal Privado</span>
            </label>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNewChannel(false); setEditingChannel(null); }}>Cancelar</Button>
              <Button className="flex-1 bg-[#0066b1] hover:bg-[#004d82]" onClick={handleSaveChannel}
                disabled={!channelForm.nome.trim()}>
                {editingChannel ? "Salvar" : "Criar Canal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}