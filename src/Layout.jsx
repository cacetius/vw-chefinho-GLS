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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 fixed left-0 top-0 bottom-0 z-30 shadow-2xl">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-[#001e50] via-[#0066b1] to-[#00b0f0] relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <span className="text-4xl">👔</span>
            </motion.div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-2xl tracking-tight">Chefinho</h2>
              <p className="text-xs text-blue-100 font-medium">VW Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredSections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
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
                    className="space-y-1 mt-2"
                  >
                    {section.items.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        className="group relative"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                            isActive(item.url)
                              ? 'bg-gradient-to-r shadow-lg text-white ' + item.gradient
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
                          }`}
                        >
                          {isActive(item.url) && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-white/10"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <item.icon className="w-5 h-5 relative z-10" />
                          <span className="flex-1 text-sm font-semibold relative z-10">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge className="relative z-10 bg-green-500 text-white text-xs py-0.5 px-2 rounded-full font-bold shadow-lg">
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
        <div className="border-t border-gray-200/50 p-5 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/50 backdrop-blur-sm shadow-lg"
          >
            <Avatar className="w-14 h-14 bg-gradient-to-br from-[#001e50] to-[#0066b1] ring-4 ring-blue-100 shadow-xl">
              {currentUser.foto_perfil ? (
                <AvatarImage src={currentUser.foto_perfil} alt={currentUser.nome_exibicao || currentUser.full_name} />
              ) : (
                <AvatarFallback className="text-white font-bold text-xl bg-gradient-to-br from-[#001e50] to-[#0066b1]">
                  {(currentUser.nome_exibicao || currentUser.full_name)?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {currentUser.nome_exibicao || currentUser.full_name}
              </p>
              <Badge
                variant="outline"
                className={`text-xs mt-1 font-semibold ${
                  currentUser.cargo === 'lider'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {currentUser.cargo === 'lider' ? '🛡️ Líder' : '📋 Monitor'}
              </Badge>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            <Link to={createPageUrl("Perfil")}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all hover:shadow-md"
              >
                <User className="w-3 h-3 mr-1" />
                Perfil
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all hover:shadow-md"
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Logo Header */}
                <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-br from-[#001e50] via-[#0066b1] to-[#00b0f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">👔</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-white text-xl">Chefinho</h2>
                      <p className="text-xs text-blue-100">VW Gestão</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-white hover:bg-white/20">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredSections.map((section) => (
                    <div key={section.title} className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2">
                        {section.title}
                      </p>
                      <nav className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                              isActive(item.url)
                                ? 'bg-gradient-to-r shadow-md text-white ' + item.gradient
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1 text-sm font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge className="ml-auto bg-green-500 text-white text-xs py-0.5 px-2 rounded-full font-bold">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>

                {/* User Profile */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-[#001e50] to-[#0066b1] ring-2 ring-gray-200">
                      {currentUser.foto_perfil ? (
                        <AvatarImage src={currentUser.foto_perfil} alt={currentUser.nome_exibicao || currentUser.full_name} />
                      ) : (
                        <AvatarFallback className="text-white font-semibold text-lg">
                          {(currentUser.nome_exibicao || currentUser.full_name)?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {currentUser.nome_exibicao || currentUser.full_name}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {currentUser.cargo === 'lider' ? 'Líder' : 'Monitor'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={createPageUrl("Perfil")} onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <User className="w-3 h-3 mr-1" />
                        Perfil
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleLogout}>
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
      <main className="flex-1 lg:ml-72">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-blue-50"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#001e50] to-[#0066b1] bg-clip-text text-transparent">
                  {currentPageName}
                </h1>
                {(currentUser.equipe || currentUser.turno) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser.equipe && `Equipe: ${currentUser.equipe}`}
                    {currentUser.equipe && currentUser.turno && ' • '}
                    {currentUser.turno && `Turno: ${currentUser.turno}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser.cargo_temporario === "lider" && currentUser.data_cargo_temporario && (
                <Badge className="hidden md:flex bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  ⚡ Líder Temporário
                </Badge>
              )}
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}