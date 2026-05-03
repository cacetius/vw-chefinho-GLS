import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UserCircle, Mail, Phone, Briefcase, Hash, Save, Camera,
  Calendar, Clock, Users, Award, Shield, CheckCircle2, AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Perfil() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ nome_exibicao: "", celular: "", chapa: "", equipe: "", turno: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ pedidosFeitos: 0, tarefasConcluidas: 0, diasCadastro: 0 });

  useEffect(() => { loadUser(); loadStats(); }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    setFormData({
      nome_exibicao: user.nome_exibicao || user.full_name || "",
      celular: user.celular || "",
      chapa: user.chapa || "",
      equipe: user.equipe || "",
      turno: user.turno || ""
    });
    setLoading(false);
  };

  const loadStats = async () => {
    const user = await base44.auth.me();
    const pedidos = await base44.entities.PedidoEPI.filter({ solicitante_id: user.id });
    const tarefas = await base44.entities.TarefaMonitor.filter({ responsavel: user.nome_exibicao || user.full_name, status: "concluida" });
    const diasCadastro = Math.floor((new Date() - new Date(user.created_date)) / 86400000);
    setStats({ pedidosFeitos: pedidos.length, tarefasConcluidas: tarefas.length, diasCadastro });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);
    await base44.auth.updateMe(formData);
    setSuccess(true);
    await loadUser();
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Selecione uma imagem válida"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Máximo 5MB"); return; }
    setUploading(true); setError("");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ foto_perfil: file_url });
    setSuccess(true);
    await loadUser();
    setTimeout(() => setSuccess(false), 3000);
    setUploading(false);
  };

  const displayName = currentUser?.nome_exibicao || currentUser?.full_name || "Usuário";
  const completeness = () => {
    const fields = [currentUser?.nome_exibicao, currentUser?.celular, currentUser?.chapa, currentUser?.equipe, currentUser?.turno, currentUser?.foto_perfil];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const cargoLabel = (c) => c === "supervisor" ? "🎖️ Supervisor" : c === "lider" ? "👔 Líder" : "👷 Monitor";
  const turnoLabel = (t) => t === "manha" ? "1º Turno" : t === "tarde" ? "2º Turno" : t === "noite" ? "3º Turno" : t;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0066b1] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4 max-w-lg mx-auto lg:max-w-3xl">

      {/* Banner + Avatar */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#001e50] to-[#0066b1]" />
        <div className="px-4 pb-4 bg-white border border-slate-200 rounded-b-2xl">
          <div className="flex items-end gap-3 -mt-10 mb-3">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                {currentUser?.foto_perfil
                  ? <AvatarImage src={currentUser.foto_perfil} />
                  : <AvatarFallback className="bg-[#0066b1] text-white text-2xl font-bold">{displayName?.charAt(0)}</AvatarFallback>
                }
              </Avatar>
              <label htmlFor="foto-upload"
                className="absolute bottom-0.5 right-0.5 w-7 h-7 bg-[#0066b1] rounded-full flex items-center justify-center cursor-pointer shadow-md active:bg-[#004d82] touch-manipulation">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input id="foto-upload" type="file" accept="image/*" className="hidden" onChange={handleFotoChange} disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 min-w-0 mt-10">
              <h1 className="text-base font-bold text-slate-900 truncate">{displayName}</h1>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge className="text-[10px] bg-[#0066b1] text-white border-0">{cargoLabel(currentUser?.cargo)}</Badge>
                {currentUser?.equipe && <Badge variant="outline" className="text-[10px]">{currentUser.equipe}</Badge>}
                {currentUser?.turno && <Badge variant="outline" className="text-[10px]">{turnoLabel(currentUser.turno)}</Badge>}
              </div>
            </div>
          </div>

          {/* Completude */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Perfil completo</span>
              <span className="font-bold text-[#0066b1]">{completeness()}%</span>
            </div>
            <Progress value={completeness()} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Alertas */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Perfil atualizado com sucesso!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {uploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin flex-shrink-0" /> Fazendo upload da foto...
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Pedidos EPI",  value: stats.pedidosFeitos,      color: "from-blue-500 to-blue-600" },
          { label: "Tarefas OK",   value: stats.tarefasConcluidas,  color: "from-green-500 to-green-600" },
          { label: "Dias no App",  value: stats.diasCadastro,       color: "from-purple-500 to-purple-600" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-3 text-white text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Save className="w-4 h-4 text-[#0066b1]" /> Editar Informações
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Nome de Exibição *</Label>
            <Input className="mt-1 h-11" placeholder="Como você quer ser chamado" value={formData.nome_exibicao}
              onChange={e => setFormData({ ...formData, nome_exibicao: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Celular / WhatsApp *</Label>
            <Input className="mt-1 h-11" placeholder="(12) 99999-9999" value={formData.celular} type="tel"
              onChange={e => setFormData({ ...formData, celular: e.target.value })} required />
            <p className="text-[10px] text-slate-400 mt-1">Usado para receber a senha de acesso via WhatsApp</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Chapa *</Label>
              <Input className="mt-1 h-11" placeholder="Sua chapa" value={formData.chapa}
                onChange={e => setFormData({ ...formData, chapa: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Equipe</Label>
              <Input className="mt-1 h-11" placeholder="Sua equipe" value={formData.equipe}
                onChange={e => setFormData({ ...formData, equipe: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Turno</Label>
            <Select value={formData.turno} onValueChange={v => setFormData({ ...formData, turno: v })}>
              <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">1º Turno — Manhã (06:00–14:48)</SelectItem>
                <SelectItem value="tarde">2º Turno — Tarde (14:48–23:36)</SelectItem>
                <SelectItem value="noite">3º Turno — Noite (23:36–06:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos somente leitura */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> E-mail</p>
              <p className="text-xs font-medium text-slate-700 truncate mt-0.5">{currentUser?.email}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Cargo</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{cargoLabel(currentUser?.cargo)}</p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-12 bg-[#0066b1] hover:bg-[#004d82] text-sm font-bold mt-2">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </div>
    </div>
  );
}