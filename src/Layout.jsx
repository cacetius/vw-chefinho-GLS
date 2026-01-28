import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Truck,
  ShoppingCart,
  Users,
  MessageSquare,
  ClipboardList,
  Shield,
  LogOut,
  Bell,
  Target,
  PhoneCall,
  Menu,
  X,
  User,
  FileText,
  Calendar,
  Star,
  Lightbulb,
  Settings,
  ChevronDown,
  Sparkles,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.log("Usuário não autenticado");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Dashboard"));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationSections = [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: createPageUrl("Dashboard"),
          icon: LayoutDashboard,
          roles: ["monitor", "lider"],
          gradient: "from-blue-500 to-indigo-600"
        },
        {
          title: "Linha de Produção",
          url: createPageUrl("LinhaProducao"),
          icon: Car,
          roles: ["monitor", "lider"],
          gradient: "from-blue-400 to-cyan-600",
          badge: "Novo"
        },
        {
          title: "Auditoria VDA",
          url: createPageUrl("AuditoriaVDA"),
          icon: ClipboardList,
          roles: ["monitor", "lider"],
          gradient: "from-indigo-500 to-purple-600"
        },
        {
          title: "Objetivos",
          url: createPageUrl("Objetivos"),
          icon: Target,
          roles: ["monitor", "lider"],
          gradient: "from-green-500 to-emerald-600"
        }
      ]
    },
    {
      title: "Operações",
      items: [
        {
          title: "Logística",
          url: createPageUrl("Logistica"),
          icon: Truck,
          roles: ["monitor", "lider"],
          gradient: "from-orange-500 to-red-600"
        },
        {
          title: "Pedidos EPI & Gastos",
          url: createPageUrl("PedidosEPI"),
          icon: ShoppingCart,
          roles: ["monitor", "lider"],
          gradient: "from-purple-500 to-pink-600"
        },
        {
          title: "Versatilidade",
          url: createPageUrl("Versatilidade"),
          icon: Users,
          roles: ["monitor", "lider"],
          gradient: "from-cyan-500 to-blue-600"
        }
      ]
    },
    {
      title: "Comunicação",
      items: [
        {
          title: "Chat",
          url: createPageUrl("Chat"),
          icon: MessageSquare,
          roles: ["monitor", "lider"],
          gradient: "from-blue-400 to-blue-600"
        },
        {
          title: "Quadro de Avisos",
          url: createPageUrl("Avisos"),
          icon: Bell,
          roles: ["monitor", "lider"],
          gradient: "from-red-500 to-pink-600"
        },
        {
          title: "Feedback 360°",
          url: createPageUrl("Feedback360"),
          icon: Star,
          roles: ["monitor", "lider"],
          gradient: "from-yellow-500 to-orange-600"
        },
        {
          title: "Sugestões",
          url: createPageUrl("Sugestoes"),
          icon: Lightbulb,
          roles: ["monitor", "lider"],
          gradient: "from-amber-500 to-yellow-600"
        }
      ]
    },
    {
      title: "Recursos",
      items: [
        {
          title: "Calendário",
          url: createPageUrl("Calendario"),
          icon: Calendar,
          roles: ["monitor", "lider"],
          gradient: "from-pink-500 to-rose-600"
        },
        {
          title: "Documentos",
          url: createPageUrl("Documentos"),
          icon: FileText,
          roles: ["monitor", "lider"],
          gradient: "from-teal-500 to-cyan-600"
        },
        {
          title: "Emergências",
          url: createPageUrl("Emergencias"),
          icon: PhoneCall,
          roles: ["monitor", "lider"],
          gradient: "from-red-600 to-red-700"
        }
      ]
    },
    {
      title: "Gestão",
      items: [
        {
          title: "Área do Monitor",
          url: createPageUrl("MonitorArea"),
          icon: ClipboardList,
          roles: ["monitor", "lider"],
          gradient: "from-slate-600 to-slate-800"
        },
        {
          title: "Área do Líder",
          url: createPageUrl("LiderArea"),
          icon: Shield,
          roles: ["lider"],
          gradient: "from-blue-700 to-indigo-800"
        }
      ]
    }
  ];

  const hasTemporaryLeaderAccess = (user) => {
    if (!user) return false;
    if (user.cargo === "lider") return true;
    if (user.cargo_temporario === "lider" && user.data_cargo_temporario) {
      const expiryDate = new Date(user.data_cargo_temporario);
      const today = new Date();
      return expiryDate >= today;
    }
    return false;
  };

  const filteredSections = currentUser 
    ? navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (item.roles.includes("lider")) {
            return hasTemporaryLeaderAccess(currentUser);
          }
          return item.roles.includes(currentUser.cargo);
        })
      })).filter(section => section.items.length > 0)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-border"></div>
            <div className="absolute top-2 left-2 rounded-full h-16 w-16 bg-white"></div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <p className="text-gray-700 font-semibold text-lg">Carregando...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        {children}
      </div>
    );
  }

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed left-0 top-0 bottom-0 z-30 shadow-sm">
        {/* Logo Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0066b1] rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏭</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900 text-base">VW Chefinho</h2>
              <p className="text-[10px] text-slate-500">Gestão Industrial</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredSections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-[#0066b1] transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections[section.title] ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {(expandedSections[section.title] !== false) && (
                  <motion.nav 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 mt-2"
                  >
                    {section.items.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        className="group relative"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01, x: 2 }}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 ${
                            isActive(item.url)
                              ? 'bg-[#0066b1] text-white shadow-sm'
                              : 'text-slate-700 hover:bg-blue-50 hover:text-[#0066b1]'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1 text-sm font-medium">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge className="bg-[#00b0f0] text-white text-xs px-1.5 py-0 rounded">
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-9 h-9 bg-[#0066b1]">
              {currentUser.foto_perfil ? (
                <AvatarImage src={currentUser.foto_perfil} alt={currentUser.nome_exibicao || currentUser.full_name} />
              ) : (
                <AvatarFallback className="text-white font-semibold text-sm bg-[#0066b1]">
                  {(currentUser.nome_exibicao || currentUser.full_name)?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-xs truncate">
                {currentUser.nome_exibicao || currentUser.full_name}
              </p>
              <p className="text-[10px] text-slate-500">
                {currentUser.cargo === 'lider' ? 'Líder' : 'Monitor'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link to={createPageUrl("Perfil")}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] h-7 hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]"
              >
                <User className="w-3 h-3 mr-1" />
                Perfil
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[10px] h-7 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
              onClick={() => setMobileOpen(false)}
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Logo Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-[#0066b1] rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏭</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-slate-900 text-sm">VW Chefinho</h2>
                      <p className="text-[9px] text-slate-500">Gestão Industrial</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-3">
                  {filteredSections.map((section, idx) => (
                    <div key={section.title} className="mb-4">
                      <button
                        onClick={() => toggleSection(section.title)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                      >
                        <span>{section.title}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections[section.title] ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {(expandedSections[section.title] !== false) && (
                          <motion.nav 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1 mt-1"
                          >
                            {section.items.map((item) => (
                              <Link
                                key={item.title}
                                to={item.url}
                                onClick={() => setMobileOpen(false)}
                              >
                                <motion.div
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                    isActive(item.url)
                                      ? 'bg-gradient-to-r from-[#001e50] to-[#0066b1] text-white shadow-md'
                                      : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100'
                                  }`}
                                >
                                  <item.icon className="w-5 h-5 flex-shrink-0" />
                                  <span className="flex-1 text-sm font-medium">{item.title}</span>
                                  {item.badge && (
                                    <Badge className="bg-[#00b0f0] text-white text-[10px] py-0 px-1.5 rounded">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </motion.div>
                              </Link>
                            ))}
                          </motion.nav>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* User Profile */}
                <div className="border-t border-slate-200 p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-10 h-10 bg-[#0066b1]">
                      {currentUser.foto_perfil ? (
                        <AvatarImage src={currentUser.foto_perfil} alt={currentUser.nome_exibicao || currentUser.full_name} />
                      ) : (
                        <AvatarFallback className="text-white font-semibold bg-[#0066b1]">
                          {(currentUser.nome_exibicao || currentUser.full_name)?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {currentUser.nome_exibicao || currentUser.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.cargo === 'lider' ? 'Líder' : 'Monitor'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={createPageUrl("Perfil")} onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full text-xs hover:bg-blue-50 hover:text-[#0066b1] hover:border-[#0066b1]">
                        <User className="w-3 h-3 mr-1" />
                        Perfil
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300" onClick={handleLogout}>
                      <LogOut className="w-3 h-3 mr-1" />
                      Sair
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </Button>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  {currentPageName}
                </h1>
                {(currentUser.equipe || currentUser.turno) && (
                  <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                    {currentUser.equipe && `Equipe: ${currentUser.equipe}`}
                    {currentUser.equipe && currentUser.turno && ' • '}
                    {currentUser.turno && `Turno: ${currentUser.turno}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser.cargo_temporario === "lider" && currentUser.data_cargo_temporario && (
                <Badge className="hidden md:flex bg-amber-500 text-white border-0">
                  Líder Temporário
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 md:p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}