import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Shield, Search, Crown, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataExpiracao, setDataExpiracao] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [searchTerm, usuarios]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Verifica se é líder (permanente ou temporário) OU admin do sistema
      const isLeader = user.role === "admin" || user.cargo === "lider" || 
        (user.cargo_temporario === "lider" && 
         user.data_cargo_temporario && 
         new Date(user.data_cargo_temporario) >= new Date());
      
      setHasAccess(isLeader);
      
      if (isLeader) {
        loadUsuarios();
      } else {
        setLoading(false);
      }
    } catch (error) {
      setError("Erro ao carregar usuário");
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await base44.entities.User.list();
      setUsuarios(data);
      setError("");
    } catch (err) {
      // Líderes não-admin podem não ter permissão de listar todos os usuários
      // Tentamos buscar apenas os dados disponíveis
      setError("Não foi possível carregar todos os usuários. Contate um administrador para conceder permissão.");
    }
    setLoading(false);
  };

  const filterUsuarios = () => {
    if (!searchTerm) {
      setFilteredUsuarios(usuarios);
      return;
    }
    const filtered = usuarios.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.chapa?.includes(searchTerm)
    );
    setFilteredUsuarios(filtered);
  };

  const handleConcederAcesso = async () => {
    if (!selectedUser || !dataExpiracao) {
      setError("Selecione uma data de expiração");
      return;
    }

    try {
      await base44.entities.User.update(selectedUser.id, {
        cargo_temporario: "lider",
        data_cargo_temporario: dataExpiracao
      });
      setSuccess(`Acesso de líder concedido a ${selectedUser.full_name} até ${new Date(dataExpiracao).toLocaleDateString('pt-BR')}`);
      setSelectedUser(null);
      setDataExpiracao("");
      loadUsuarios();
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError("Erro ao conceder acesso");
    }
  };

  const handleRevogarAcesso = async (usuario) => {
    try {
      await base44.entities.User.update(usuario.id, {
        cargo_temporario: "",
        data_cargo_temporario: null
      });
      setSuccess(`Acesso temporário de ${usuario.full_name} foi revogado`);
      loadUsuarios();
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError("Erro ao revogar acesso");
    }
  };

  const hasTemporaryAccess = (usuario) => {
    if (!usuario.cargo_temporario || !usuario.data_cargo_temporario) return false;
    const expiryDate = new Date(usuario.data_cargo_temporario);
    const today = new Date();
    return expiryDate >= today;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066b1]"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-6 h-6" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Área Restrita
                </p>
                <p className="text-gray-600">
                  Esta funcionalidade está disponível apenas para líderes.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Se você precisa gerenciar usuários, entre em contato com seu líder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#001e50] flex items-center gap-3">
            <Users className="w-8 h-8 text-[#0066b1]" />
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-1">Administre colaboradores e conceda acessos temporários</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-[#0066b1]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#001e50]">{usuarios.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Líderes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {usuarios.filter(u => u.cargo === "lider").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-gray-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Monitores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {usuarios.filter(u => u.cargo === "monitor").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Acessos Temporários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {usuarios.filter(u => hasTemporaryAccess(u)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-[#001e50]/5 to-white">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou chapa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {filteredUsuarios.map((usuario) => (
            <Card key={usuario.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 bg-gradient-to-br from-[#001e50] to-[#0066b1]">
                      <AvatarFallback className="text-white font-bold text-lg">
                        {usuario.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-[#001e50]">{usuario.full_name}</h3>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={usuario.cargo === "lider" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                          {usuario.cargo === "lider" ? (
                            <><Shield className="w-3 h-3 mr-1" /> Líder</>
                          ) : (
                            "Monitor"
                          )}
                        </Badge>
                        {usuario.chapa && <Badge variant="outline">Chapa: {usuario.chapa}</Badge>}
                        {hasTemporaryAccess(usuario) && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                            <Crown className="w-3 h-3 mr-1" />
                            Acesso Líder até {new Date(usuario.data_cargo_temporario).toLocaleDateString('pt-BR')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {usuario.cargo === "monitor" && !hasTemporaryAccess(usuario) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            onClick={() => setSelectedUser(usuario)}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Conceder Acesso
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Conceder Acesso de Líder Temporário</DialogTitle>
                            <DialogDescription>
                              Conceda acesso temporário de líder para {usuario.full_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="data_expiracao">Data de Expiração *</Label>
                              <Input
                                id="data_expiracao"
                                type="date"
                                value={dataExpiracao}
                                onChange={(e) => setDataExpiracao(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Atenção:</strong> O monitor terá acesso total às áreas de líder até a data selecionada.
                              </p>
                            </div>
                            <div className="flex justify-end gap-3">
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogTrigger>
                              <Button
                                onClick={handleConcederAcesso}
                                className="bg-gradient-to-r from-purple-600 to-purple-700"
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Conceder Acesso
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {hasTemporaryAccess(usuario) && (
                      <Button
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => handleRevogarAcesso(usuario)}
                      >
                        Revogar Acesso
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsuarios.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}