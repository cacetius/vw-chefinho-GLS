import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Truck, Users, Shield, LogOut, Bell,
  Menu, X, User, Car, Grid, Home, MoreHorizontal, Activity,
  ClipboardList, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import TurnoGuard, { isTurnoAtivo } from "@/components/shared/TurnoGuard";
import GeoGuard from "@/components/shared/GeoGuard";

// As 6 funções principais
const NAV_SECTIONS = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", url: "Dashboard", icon: LayoutDashboard },
      { title: "Linha de Produção", url: "LinhaProducao", icon: Car },
      { title: "Dashboard Produção", url: "DashboardProducao", icon: Activity },
    ]
  },
  {
    title: "Módulos",
    items: [
      { title: "EPI & Orçamentos", url: "OperacoesHub", icon: Truck },
      { title: "Pessoas & Times", url: "PessoasHub", icon: Users },
      { title: "Segurança & Qualidade", url: "SegurancaHub", icon: Shield },
    ]
  },
  {
    title: "Ferramentas",
    items: [
      { title: "Auditoria VDA", url: "AuditoriaVDA", icon: ClipboardList },
      { title: "Layout das Linhas", url: "LayoutLinhaPage", icon: Grid },
      { title: "Estoque EPI", url: "Estoque", icon: Bell },
    ]
  },
  {
    title: "Gestão",
    items: [
      { title: "Área do Monitor", url: "MonitorArea", icon: ClipboardList },
      { title: "Área do Líder", url: "LiderArea", icon: Shield, liderOnly: true },
      { title: "Gerenciar Usuários", url: "GerenciarUsuarios", icon: Users, liderOnly: true },
    ]
  }
];

// Bottom nav — as 6 funções chave
const BOTTOM_NAV = [
  { title: "Início", url: "Dashboard", icon: Home },
  { title: "Linha", url: "LinhaProducao", icon: Car },
  { title: "EPI & Orçamentos", url: "OperacoesHub", icon: Truck },
  { title: "Pessoas", url: "PessoasHub", icon: Users },
  { title: "Menu", url: null, icon: MoreHorizontal },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ Principal: true, Módulos: true });

  useEffect(() => {
    base44.auth.me().then(u => { setCurrentUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => { await base44.auth.logout(); };
  const toggleSection = (title) => setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));

  const hasLeaderAccess = (user) => {
    if (!user) return false;
    if (user.cargo === "supervisor" || user.role === "admin") return true;
    if (user.cargo === "lider") return true;
    if (user.cargo_temporario === "lider" && user.data_cargo_temporario)
      return new Date(user.data_cargo_temporario) >= new Date();
    return false;
  };

  const filteredSections = currentUser
    ? NAV_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(item => !item.liderOnly || hasLeaderAccess(currentUser))
      })).filter(s => s.items.length > 0)
    : [];

  const isActive = (url) => url && location.pathname === createPageUrl(url);

  // Páginas sem guard de turno (sempre acessíveis)
  const PAGINAS_LIVRES = ["/Registro", "/Perfil"];
  const paginaLivre = PAGINAS_LIVRES.some(p => location.pathname.startsWith(p));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-[#0066b1] rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-2xl">🏭</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <div className="min-h-screen bg-slate-50">{children}</div>;

  // Verificação de turno (exceto páginas livres e supervisores/admins)
  if (!paginaLivre && currentUser.turno && !isTurnoAtivo(currentUser.turno, currentUser)) {
    return <TurnoGuard turno={currentUser.turno}>{children}</TurnoGuard>;
  }

  const displayName = currentUser.nome_exibicao || currentUser.full_name;

  const mainContent = (
    <div className="min-h-screen flex bg-slate-50">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 fixed left-0 top-0 bottom-0 z-30">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🏭</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">VW Chefinho</p>
            <p className="text-[10px] text-slate-400">Gestão Industrial</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filteredSections.map(section => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#0066b1] transition-colors rounded"
              >
                <span>{section.title}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections[section.title] ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {expandedSections[section.title] !== false && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {section.items.map(item => (
                      <Link key={item.url} to={createPageUrl(item.url)}>
                        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          isActive(item.url)
                            ? 'bg-[#0066b1] text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}>
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Avatar className="w-8 h-8 flex-shrink-0">
              {currentUser.foto_perfil
                ? <AvatarImage src={currentUser.foto_perfil} />
                : <AvatarFallback className="bg-[#0066b1] text-white text-xs font-bold">{displayName?.charAt(0)}</AvatarFallback>
              }
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400">{currentUser.cargo === 'supervisor' ? 'Supervisor' : currentUser.cargo === 'lider' ? 'Líder' : 'Monitor'}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link to={createPageUrl("Perfil")} className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-7 text-[11px] hover:border-[#0066b1] hover:text-[#0066b1]">
                <User className="w-3 h-3 mr-1" /> Perfil
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] hover:border-red-300 hover:text-red-600" onClick={handleLogout}>
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center">
                    <span className="text-xl">🏭</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">VW Chefinho</p>
                    <p className="text-[10px] text-slate-400">Gestão Industrial</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {currentUser.foto_perfil
                    ? <AvatarImage src={currentUser.foto_perfil} />
                    : <AvatarFallback className="bg-[#0066b1] text-white font-bold">{displayName?.charAt(0)}</AvatarFallback>
                  }
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
                  <p className="text-xs text-slate-500">{currentUser.cargo === 'supervisor' ? '🎖️ Supervisor' : currentUser.cargo === 'lider' ? '👔 Líder' : '👷 Monitor'} • {currentUser.equipe || ''}</p>
                  {currentUser.turno && (
                    <Badge className="mt-1 text-[9px] bg-[#0066b1]/10 text-[#0066b1] border-transparent">
                      {currentUser.turno === "manha" ? "1º Turno" : currentUser.turno === "tarde" ? "2º Turno" : "3º Turno"}
                    </Badge>
                  )}
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-2">
                {filteredSections.map(section => (
                  <div key={section.title} className="mb-2">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.title}</p>
                    {section.items.map(item => (
                      <Link key={item.url} to={createPageUrl(item.url)} onClick={() => setDrawerOpen(false)}>
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-all active:scale-[0.98] ${
                          isActive(item.url)
                            ? 'bg-[#0066b1] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}>
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.title}</span>
                          {isActive(item.url) && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>

              <div className="border-t border-slate-100 p-3 flex gap-2">
                <Link to={createPageUrl("Perfil")} onClick={() => setDrawerOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full text-sm hover:border-[#0066b1] hover:text-[#0066b1]">
                    <User className="w-4 h-4 mr-2" /> Perfil
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="px-3 hover:border-red-300 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-3 md:px-5 py-2 flex items-center gap-2.5">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors active:scale-95"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">{currentPageName}</h1>
            {(currentUser.equipe || currentUser.turno) && (
              <p className="text-[10px] text-slate-400 leading-tight">
                {[currentUser.equipe, currentUser.turno === "manha" ? "1º Turno" : currentUser.turno === "tarde" ? "2º Turno" : currentUser.turno === "noite" ? "3º Turno" : ""].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {currentUser.cargo_temporario === "lider" && (
              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">Temp.</Badge>
            )}
            <Link to={createPageUrl("Perfil")}>
              <Avatar className="w-8 h-8 ring-2 ring-slate-100 hover:ring-[#0066b1] transition-all">
                {currentUser.foto_perfil
                  ? <AvatarImage src={currentUser.foto_perfil} />
                  : <AvatarFallback className="bg-[#0066b1] text-white text-xs font-bold">{displayName?.charAt(0)}</AvatarFallback>
                }
              </Avatar>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-5 pb-28 lg:pb-6">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-stretch h-16">
          {BOTTOM_NAV.map(item => {
            const active = item.url ? isActive(item.url) : drawerOpen;
            const isMenu = item.url === null;
            return (
              <button
                key={item.title}
                onClick={() => isMenu ? setDrawerOpen(d => !d) : navigate(createPageUrl(item.url))}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative ${
                  active ? 'text-[#0066b1]' : 'text-slate-400'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0066b1] rounded-full"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium ${active ? 'font-bold text-[#0066b1]' : ''}`}>{item.title}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );

  if (!paginaLivre) {
    return (
      <GeoGuard userRole={currentUser.role} userCargo={currentUser.cargo}>
        {mainContent}
      </GeoGuard>
    );
  }

  return mainContent;
}