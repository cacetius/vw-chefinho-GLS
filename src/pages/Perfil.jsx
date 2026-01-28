import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Briefcase, 
  Hash, 
  Save, 
  Camera,
  Calendar,
  Clock,
  Users,
  Award,
  Shield
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function Perfil() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nome_exibicao: "",
    celular: "",
    chapa: "",
    equipe: "",
    turno: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pedidosFeitos: 0,
    tarefasConcluidas: 0,
    diasCadastro: 0
  });

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

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
    try {
      const user = await base44.auth.me();
      const pedidos = await base44.entities.PedidoEPI.filter({ solicitante_id: user.id });
      const tarefas = await base44.entities.TarefaMonitor.filter({ responsavel: user.nome_exibicao || user.full_name, status: "concluida" });
      
      const diasCadastro = Math.floor((new Date() - new Date(user.created_date)) / (1000 * 60 * 60 * 24));
      
      setStats({
        pedidosFeitos: pedidos.length,
        tarefasConcluidas: tarefas.length,
        diasCadastro: diasCadastro
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await base44.auth.updateMe(formData);
      setSuccess(true);
      await loadUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Erro ao atualizar perfil. Tente novamente.");
    }
    setSaving(false);
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ foto_perfil: file_url });
      setSuccess(true);
      await loadUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Erro ao fazer upload da foto. Tente novamente.");
    }
    setUploading(false);
  };

  const displayName = currentUser?.nome_exibicao || currentUser?.full_name || 'Usuário';
  const profileCompleteness = () => {
    let completed = 0;
    const fields = [
      currentUser?.nome_exibicao,
      currentUser?.celular,
      currentUser?.chapa,
      currentUser?.equipe,
      currentUser?.turno,
      currentUser?.foto_perfil
    ];
    fields.forEach(field => { if (field) completed++; });
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header com Foto de Perfil */}
        <div className="relative mb-20">
          <div className="h-40 bg-gradient-to-r from-[#001e50] to-[#0066b1] rounded-b-xl"></div>
          <div className="absolute -bottom-16 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white shadow-xl bg-[#0066b1]">
                {currentUser?.foto_perfil ? (
                  <AvatarImage src={currentUser.foto_perfil} alt={displayName} />
                ) : (
                  <AvatarFallback className="text-white font-bold text-3xl bg-[#0066b1]">
                    {displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <label 
                htmlFor="foto-upload" 
                className="absolute bottom-1 right-1 w-9 h-9 bg-[#0066b1] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#004d82] transition-all shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
                <input
                  id="foto-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="pb-3">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${
                  currentUser?.cargo === 'lider' 
                    ? 'bg-[#0066b1]' 
                    : 'bg-slate-600'
                } text-white`}>
                  {currentUser?.cargo === 'lider' ? (
                    <><Shield className="w-3 h-3 mr-1" /> Líder</>
                  ) : (
                    'Monitor'
                  )}
                </Badge>
                {currentUser?.equipe && (
                  <Badge variant="outline" className="bg-white/80">
                    <Users className="w-3 h-3 mr-1" />
                    {currentUser.equipe}
                  </Badge>
                )}
                {currentUser?.turno && (
                  <Badge variant="outline" className="bg-white/80">
                    <Clock className="w-3 h-3 mr-1" />
                    {currentUser.turno}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800 font-medium">
                ✓ Perfil atualizado com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploading && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Fazendo upload da foto...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Estatísticas Rápidas */}
            <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Pedidos de EPI</p>
                    <p className="text-3xl font-bold mt-1">{stats.pedidosFeitos}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Tarefas Concluídas</p>
                    <p className="text-3xl font-bold mt-1">{stats.tarefasConcluidas}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Dias no Sistema</p>
                    <p className="text-3xl font-bold mt-1">{stats.diasCadastro}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Informações do Perfil */}
            <Card className="lg:col-span-1">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#0066b1]" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Completude do Perfil</p>
                    <div className="flex items-center gap-3">
                      <Progress value={profileCompleteness()} className="flex-1" />
                      <span className="text-sm font-semibold text-gray-700">{profileCompleteness()}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">E-mail</p>
                        <p className="text-sm font-medium truncate">{currentUser?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Hash className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Chapa</p>
                        <p className="text-sm font-medium">{currentUser?.chapa || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Celular</p>
                        <p className="text-sm font-medium">{currentUser?.celular || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Cargo</p>
                        <p className="text-sm font-medium">
                          {currentUser?.cargo === 'lider' ? 'Líder' : 'Monitor'}
                        </p>
                      </div>
                    </div>

                    {currentUser?.equipe && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Equipe</p>
                          <p className="text-sm font-medium">{currentUser.equipe}</p>
                        </div>
                      </div>
                    )}

                    {currentUser?.turno && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Turno</p>
                          <p className="text-sm font-medium capitalize">{currentUser.turno}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de Edição */}
            <Card className="lg:col-span-2">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-[#0066b1]" />
                  Editar Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome_exibicao" className="text-sm font-semibold">
                        Nome de Exibição *
                      </Label>
                      <Input
                        id="nome_exibicao"
                        placeholder="Como você gostaria de ser chamado"
                        value={formData.nome_exibicao}
                        onChange={(e) => setFormData({...formData, nome_exibicao: e.target.value})}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        Este nome aparecerá para outros usuários
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="celular" className="text-sm font-semibold">
                        Número de Celular *
                      </Label>
                      <Input
                        id="celular"
                        placeholder="(00) 00000-0000"
                        value={formData.celular}
                        onChange={(e) => setFormData({...formData, celular: e.target.value})}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chapa" className="text-sm font-semibold">
                        Número de Chapa *
                      </Label>
                      <Input
                        id="chapa"
                        placeholder="Sua chapa"
                        value={formData.chapa}
                        onChange={(e) => setFormData({...formData, chapa: e.target.value})}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipe" className="text-sm font-semibold">
                        Equipe
                      </Label>
                      <Input
                        id="equipe"
                        placeholder="Nome da sua equipe"
                        value={formData.equipe}
                        onChange={(e) => setFormData({...formData, equipe: e.target.value})}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="turno" className="text-sm font-semibold">
                        Turno
                      </Label>
                      <Select
                        value={formData.turno}
                        onValueChange={(value) => setFormData({...formData, turno: value})}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="noite">Noite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="bg-slate-50 h-11"
                    />
                    <p className="text-xs text-gray-500">
                      O e-mail é gerenciado pelo sistema e não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo" className="text-sm font-semibold">
                      Cargo
                    </Label>
                    <Input
                      id="cargo"
                      value={currentUser?.cargo === 'lider' ? 'Líder' : 'Monitor'}
                      disabled
                      className="bg-slate-50 h-11"
                    />
                    <p className="text-xs text-gray-500">
                      O cargo é definido pelo administrador
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-[#0066b1] hover:bg-[#004d82] px-8 h-12 text-base font-semibold"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Dicas e Informações */}
          <Card className="mt-6 border-l-4 border-l-yellow-500">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Dicas para um Perfil Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Adicione uma foto de perfil</p>
                    <p className="text-sm text-gray-600">Facilita a identificação nos chats e avisos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Preencha equipe e turno</p>
                    <p className="text-sm text-gray-600">Ajuda na organização de pedidos e tarefas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mantenha os dados atualizados</p>
                    <p className="text-sm text-gray-600">Garante melhor comunicação com a equipe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Use um nome de exibição claro</p>
                    <p className="text-sm text-gray-600">Facilita que outros te encontrem no sistema</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}