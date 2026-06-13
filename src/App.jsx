import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ObjetivosMesPage from './pages/ObjetivosMes';
import GastosEPIPage from './pages/GastosEPI';
import PlanejamentoRotatividadePage from './pages/PlanejamentoRotatividade';
import OperacoesHubPage from './pages/OperacoesHub';
import PessoasHubPage from './pages/PessoasHub';
import SegurancaHubPage from './pages/SegurancaHub';
import FerramentasPage from './pages/Ferramentas';
import CalibracaoPage from './pages/Calibracao';
import CalendarioPage from './pages/Calendario';
import AuditoriaIndustrialPage from './pages/AuditoriaIndustrial';
import BancadasPage from './pages/Bancadas';
import ChecklistPagePage from './pages/ChecklistPage';
import CincoSPagePage from './pages/CincoSPage';
import SaudeAreaPage from './pages/SaudeArea';
import MochilaMonitorPage from './pages/MochilaMonitor';

import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/OperacoesHub" element={<LayoutWrapper currentPageName="Operações"><OperacoesHubPage /></LayoutWrapper>} />
      <Route path="/PessoasHub" element={<LayoutWrapper currentPageName="Pessoas & Times"><PessoasHubPage /></LayoutWrapper>} />
      <Route path="/SegurancaHub" element={<LayoutWrapper currentPageName="Segurança & Qualidade"><SegurancaHubPage /></LayoutWrapper>} />
      <Route path="/ObjetivosMes" element={<LayoutWrapper currentPageName="Objetivos do Mês"><ObjetivosMesPage /></LayoutWrapper>} />
      <Route path="/PlanejamentoRotatividade" element={<LayoutWrapper currentPageName="Planejamento de Rotatividade"><PlanejamentoRotatividadePage /></LayoutWrapper>} />
      <Route path="/GastosEPI" element={<LayoutWrapper currentPageName="Gastos EPI"><GastosEPIPage /></LayoutWrapper>} />
      <Route path="/Ferramentas" element={<LayoutWrapper currentPageName="Ferramentas"><FerramentasPage /></LayoutWrapper>} />
      <Route path="/Calibracao" element={<LayoutWrapper currentPageName="Calibração"><CalibracaoPage /></LayoutWrapper>} />
      <Route path="/AuditoriaIndustrial" element={<LayoutWrapper currentPageName="Auditoria Industrial"><AuditoriaIndustrialPage /></LayoutWrapper>} />
      <Route path="/Bancadas" element={<LayoutWrapper currentPageName="Bancadas"><BancadasPage /></LayoutWrapper>} />
      <Route path="/ChecklistAuditoria" element={<LayoutWrapper currentPageName="Checklist de Auditoria"><ChecklistPagePage /></LayoutWrapper>} />
      <Route path="/CincoS" element={<LayoutWrapper currentPageName="Gestão 5S"><CincoSPagePage /></LayoutWrapper>} />
      <Route path="/SaudeArea" element={<LayoutWrapper currentPageName="Saúde da Área"><SaudeAreaPage /></LayoutWrapper>} />
      <Route path="/MochilaMonitor" element={<LayoutWrapper currentPageName="Mochila do Monitor"><MochilaMonitorPage /></LayoutWrapper>} />
    
      <Route path="/Calendario" element={<LayoutWrapper currentPageName="Calendário"><CalendarioPage /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App