import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Loader2 } from "lucide-react";

export default function DialogoForm({ dialogo, currentUser, onSave, onCancel }) {
  const [form, setForm] = useState({
    titulo: dialogo?.titulo || "",
    tipo: dialogo?.tipo || "dds",
    conteudo: dialogo?.conteudo || "",
    equipe: dialogo?.equipe || currentUser?.equipe || "",
    turno: dialogo?.turno || currentUser?.turno || "todos",
    data_dialogo: dialogo?.data_dialogo || new Date().toISOString().split("T")[0],
    arquivo_url: dialogo?.arquivo_url || "",
    arquivo_nome: dialogo?.arquivo_nome || "",
    autor: dialogo?.autor || currentUser?.nome_exibicao || currentUser?.full_name || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, arquivo_url: file_url, arquivo_nome: file.name }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-900">{dialogo ? "Editar Diálogo" : "Novo Diálogo"}</h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label className="text-xs font-semibold">Título *</Label>
          <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            placeholder="Ex: DDS - Uso correto de EPI" className="mt-1" required />
        </div>
        <div>
          <Label className="text-xs font-semibold">Tipo</Label>
          <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dds">DDS</SelectItem>
              <SelectItem value="reuniao_seguranca">Reunião de Segurança</SelectItem>
              <SelectItem value="treinamento">Treinamento</SelectItem>
              <SelectItem value="procedimento">Procedimento</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold">Data</Label>
          <Input type="date" value={form.data_dialogo} onChange={e => setForm(f => ({ ...f, data_dialogo: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Equipe</Label>
          <Input value={form.equipe} onChange={e => setForm(f => ({ ...f, equipe: e.target.value }))} placeholder="Ex: Equipe A" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Turno</Label>
          <Select value={form.turno} onValueChange={v => setForm(f => ({ ...f, turno: v }))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="manha">Manhã</SelectItem>
              <SelectItem value="tarde">Tarde</SelectItem>
              <SelectItem value="noite">Noite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold">Conteúdo do Diálogo</Label>
        <Textarea value={form.conteudo} onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
          placeholder="Cole ou digite o conteúdo do diálogo aqui..." className="mt-1 h-28 text-sm" />
      </div>

      <div>
        <Label className="text-xs font-semibold">Anexar Documento (PDF, DOC, TXT)</Label>
        <div className="mt-1">
          {form.arquivo_url ? (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-700 truncate flex-1">{form.arquivo_nome}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, arquivo_url: "", arquivo_nome: "" }))}
                className="text-blue-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4 text-slate-400" />}
              <span className="text-xs text-slate-500">{uploading ? "Enviando..." : "Clique para enviar arquivo"}</span>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1 text-sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving || uploading} className="flex-1 text-sm bg-[#0066b1] hover:bg-[#0055a0]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}