import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Registro() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    celular: "",
    chapa: "",
    cargo: "",
    equipe: "",
    turno: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await base44.auth.me();
      if (user.cargo) {
        navigate(createPageUrl("Dashboard"));
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      await base44.auth.redirectToLogin();
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.celular || !formData.chapa || !formData.cargo) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      await base44.auth.updateMe(formData);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      setError("Erro ao salvar dados. Tente novamente.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🏭</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao VW Chefinho
          </h1>
          <p className="text-gray-600">
            Sistema Volkswagen de Gestão - Complete seu cadastro
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              Registro de Colaborador
            </CardTitle>
            <CardDescription>
              Preencha seus dados para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={currentUser?.full_name || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Número de Celular *</Label>
                <Input
                  id="celular"
                  placeholder="(00) 00000-0000"
                  value={formData.celular}
                  onChange={(e) => setFormData({...formData, celular: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapa">Número de Chapa *</Label>
                <Input
                  id="chapa"
                  placeholder="Digite seu número de chapa"
                  value={formData.chapa}
                  onChange={(e) => setFormData({...formData, chapa: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => setFormData({...formData, cargo: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="lider">Líder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe</Label>
                <Input
                  id="equipe"
                  placeholder="Nome da sua equipe"
                  value={formData.equipe}
                  onChange={(e) => setFormData({...formData, equipe: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={formData.turno}
                  onValueChange={(value) => setFormData({...formData, turno: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#001e50] to-[#0066b1] hover:from-[#001e50] hover:to-[#004d82] text-white py-6 text-lg font-semibold"
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Completar Cadastro"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ao se registrar, você concorda com os termos de uso da plataforma
        </p>
      </div>
    </div>
  );
}