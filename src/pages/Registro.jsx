import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, AlertCircle } from "lucide-react";
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

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    try {
      const user = await base44.auth.me();
      if (user.cargo) {
        navigate(createPageUrl("Dashboard"));
        return;
      }
      setCurrentUser(user);
    } catch {
      await base44.auth.redirectToLogin();
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.celular || !formData.chapa || !formData.cargo || !formData.turno) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await base44.auth.updateMe(formData);
      navigate(createPageUrl("Dashboard"));
    } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-[#001e50] via-[#003080] to-[#0066b1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-xl">
            <span className="text-3xl">🏭</span>
          </div>
          <h1 className="text-2xl font-bold text-white">VW Chefinho</h1>
          <p className="text-white/60 text-sm mt-1">Complete seu cadastro para acessar o sistema</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <UserPlus className="w-5 h-5 text-[#0066b1]" />
              Registro de Colaborador
            </CardTitle>
            <CardDescription className="text-xs">
              Preencha seus dados para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados auto-preenchidos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={currentUser?.full_name || ""} disabled className="bg-slate-50 text-xs h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input value={currentUser?.email || ""} disabled className="bg-slate-50 text-xs h-8" />
                </div>
              </div>

              {/* Celular e Chapa */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Celular *</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chapa *</Label>
                  <Input
                    placeholder="Nº de chapa"
                    value={formData.chapa}
                    onChange={(e) => setFormData({ ...formData, chapa: e.target.value })}
                    className="text-xs h-8"
                    required
                  />
                </div>
              </div>

              {/* Cargo, Turno, Equipe */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Cargo *</Label>
                  <Select value={formData.cargo} onValueChange={(v) => setFormData({ ...formData, cargo: v })}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="lider">Líder</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Turno *</Label>
                  <Select value={formData.turno} onValueChange={(v) => setFormData({ ...formData, turno: v })}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">1º Turno — Manhã (06h-15h)</SelectItem>
                      <SelectItem value="tarde">2º Turno — Tarde (14h50-00h)</SelectItem>
                      <SelectItem value="noite">3º Turno — Noite (21h50-06h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Equipe</Label>
                <Input
                  placeholder="Nome da equipe (opcional)"
                  value={formData.equipe}
                  onChange={(e) => setFormData({ ...formData, equipe: e.target.value })}
                  className="text-xs h-8"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0066b1] hover:bg-[#004d82] text-white py-5 text-sm font-semibold mt-2"
                disabled={submitting}
              >
                {submitting ? "Salvando dados..." : "Completar Cadastro e Entrar"}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/40 mt-5">
          VW Chefinho — Sistema de Gestão Industrial Volkswagen
        </p>
      </div>
    </div>
  );
}