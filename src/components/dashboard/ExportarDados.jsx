import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

// ─── Todo o código do app embutido ───────────────────────────────────────────
// Cada entrada: [caminho, conteúdo]
const ARQUIVOS = [
["App.jsx", `import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import DashboardProducaoPage from './pages/DashboardProducao';
import OperacoesHubPage from './pages/OperacoesHub';
import PessoasHubPage from './pages/PessoasHub';
import SegurancaHubPage from './pages/SegurancaHub';
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
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }
  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }
  return (
    <Routes>
      <Route path="/" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route key={path} path={\`/\${path}\`} element={<LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>} />
      ))}
      <Route path="/DashboardProducao" element={<LayoutWrapper currentPageName="DashboardProducao"><DashboardProducaoPage /></LayoutWrapper>} />
      <Route path="/OperacoesHub" element={<LayoutWrapper currentPageName="Operações"><OperacoesHubPage /></LayoutWrapper>} />
      <Route path="/PessoasHub" element={<LayoutWrapper currentPageName="Pessoas & Times"><PessoasHubPage /></LayoutWrapper>} />
      <Route path="/SegurancaHub" element={<LayoutWrapper currentPageName="Segurança & Qualidade"><SegurancaHubPage /></LayoutWrapper>} />
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
export default App`],

["pages/Dashboard.jsx", `// Dashboard principal — VW Chefinho
// Exibe módulos, objetivos, alertas, indicadores e histórico.
// Acesso: todos os usuários autenticados com cargo definido.
// Supervisor/admin: vê botão de exportar dados.
// Componentes: PrazoAlertas, GraficosGerais, HistoricoAtividades, ExportarDados`],

["pages/LiderArea.jsx", `// Área do Líder
// Gerencia tarefas da equipe, dashboard de produtividade e ações rápidas.
// Acesso: lider, supervisor, admin.
// Componentes: TarefaForm, TarefasList, DashboardEquipe, ResumoSemanalPDF`],

["pages/MonitorArea.jsx", `// Área do Monitor
// Visualiza e gerencia tarefas atribuídas ao monitor logado.
// Exibe progresso de tarefas e objetivos do dia.
// Componentes: TarefaForm, TarefasList`],

["pages/OperacoesHub.jsx", `// EPI & Orçamentos
// CRUD de pedidos de EPI e orçamentos por equipe/turno.
// Líderes aprovam pedidos e criam orçamentos; monitores fazem pedidos.
// Componentes: PedidoForm, PedidosList, OrcamentoForm, OrcamentosList`],

["pages/PessoasHub.jsx", `// Pessoas & Times
// Gerencia matriz de versatilidade, ausências e treinamentos.
// Componentes: VersatilidadeCards, VersatilidadeGrid, AusenciasList, TreinamentosList`],

["pages/SegurancaHub.jsx", `// Segurança & Qualidade
// Objetivos diários/mensais, avisos e diálogos de segurança (DDS).
// Componentes: ObjetivoForm, ObjetivosDiarios, ObjetivosMensais, AvisoForm, AvisosList, DialogoForm, AssistenteIA`],

["pages/AuditoriaVDA.jsx", `// Auditoria VDA
// Cria e acompanha auditorias de qualidade automotiva com checklist.
// Gera planos de ação para não conformidades.
// Componentes: AuditoriaVDAForm, AuditoriaVDAList, PlanoAcaoList, AuditoriaChart`],

["pages/LinhaProducao.jsx", `// Linha de Produção
// Visualiza veículos em andamento na linha em tempo real.
// Componentes: LinhaVisual, LinhaStats, VelocidadeLinha, AlertasLinha, CarroForm, CarrosList`],

["pages/DashboardProducao.jsx", `// Dashboard Produção
// Métricas e indicadores de produção com gráficos.`],

["pages/Perfil.jsx", `// Perfil do usuário
// Edição de nome, celular/WhatsApp, chapa, equipe, turno e foto.
// O celular é usado para receber a senha diária via WhatsApp.`],

["pages/GerenciarUsuarios.jsx", `// Gerenciar Usuários
// Administração de cargos, permissões temporárias e equipes.
// Acesso: lider, supervisor, admin.`],

["pages/Estoque.jsx", `// Estoque de EPI
// Controle de itens de EPI em estoque, alertas de quantidade mínima.
// Componentes: EstoqueList, EstoqueForm, EstoqueChart, MovimentacaoEPI`],

["components/shared/TurnoGuard.jsx", `// Guard de turno
// Bloqueia acesso fora do horário do turno do usuário.
// Líderes/admins podem solicitar senha diária via e-mail ou WhatsApp.
// A senha diária é determinística (data + salt fixo), válida por 24h.
// isTurnoAtivo(): manha=06:00-14:48 | tarde=14:48-23:36 | noite=23:36-06:00`],

["components/shared/SenhaEmergenciaModal.jsx", `// Modal de senha de emergência
// Gera senha diária de 6 dígitos (hash determinístico da data).
// Envia por e-mail (SendEmail integration) ou WhatsApp (wa.me/55{celular}).
// Se o celular estiver cadastrado no perfil, envia direto para o número do usuário.`],

["components/shared/GeoGuard.jsx", `// Guard geográfico
// Restringe acesso ao raio de ~500m da fábrica VW Taubaté.
// Supervisores/admins podem liberar via senha de emergência.
// Usa navigator.geolocation e sessionStorage para cache de autorização.`],

["components/auditoria/PlanoAcaoList.jsx", `// Lista de planos de ação VDA
// Exibe planos com status, prazo, responsável e botões de validação.
// Líderes/admins podem avançar status (aberto→em_andamento→aguardando→concluído).
// Validação de eficácia marca eficacia_verificada=true no registro.`],

["components/tarefas/TarefasList.jsx", `// Lista de tarefas
// Cards expansíveis com status, prioridade, responsável e ações.
// Monitor pode iniciar tarefa; líder/admin pode validar & concluir.
// Ao validar, tenta fechar também o PlanoAcaoVDA vinculado por título.`],

["components/pedidos/PedidosList.jsx", `// Lista de pedidos EPI
// Cards com status, urgência, valor e integração de orçamento.
// Líder aprova com valor de orçamento; pode reprovar ou marcar entregue.
// Exportação CSV integrada.`],

["components/dialogo/AssistenteIA.jsx", `// Assistente IA (Chefinho)
// Chat com LLM especializado em segurança industrial e gestão de equipes.
// Histórico de conversa mantido em estado local.
// Usa base44.integrations.Core.InvokeLLM com contexto do sistema.`],

["components/dashboard/ExportarDados.jsx", `// Exportar Dados
// Baixa todos os módulos do banco em CSV separados (admin/supervisor).
// Acha e baixa: PedidoEPI, TarefaMonitor, Objetivo, Aviso, AuditoriaVDA,
// PlanoAcaoVDA, Versatilidade, Ausencia, Treinamento, Orcamento, EstoqueEPI, AtividadeLogistica.`],

["entities/README.txt", `Entidades do banco de dados (Base44):

- User              : usuários do sistema (built-in)
- PedidoEPI         : pedidos de equipamentos de proteção individual
- Orcamento         : orçamentos por equipe/turno/categoria
- EstoqueEPI        : controle de estoque de EPIs
- TarefaMonitor     : tarefas atribuídas a monitores ou pela área do líder
- Objetivo          : objetivos diários e mensais por categoria
- Aviso             : avisos gerais, importantes ou urgentes
- DialogoSeguranca  : diálogos DDS com slides gerados por IA
- AuditoriaVDA      : auditorias de qualidade automotiva (checklist VDA)
- PlanoAcaoVDA      : planos de ação para não conformidades de auditoria
- Versatilidade     : matriz de habilidades dos colaboradores
- Ausencia          : registro de ausências (férias, atestado, licença)
- Treinamento       : treinamentos com participantes e status
- PDI               : plano de desenvolvimento individual
- AtividadeLogistica: atividades do setor de logística
- Reconhecimento    : reconhecimentos e badges de colaboradores
- Notificacao       : notificações internas por usuário
- MensagemChat      : mensagens dos canais de chat
- CanalChat         : canais de comunicação (geral, equipe, turno)
- Comentario        : comentários em entidades diversas
- LayoutLinha       : layouts das linhas de produção (editor visual)
- CarroLinha        : veículos em andamento na linha de produção
- EventoCalendario  : eventos do calendário da equipe
- SenhaEmergencia   : senhas diárias de emergência geradas
- ContatoEmergencia : contatos de emergência (bombeiros, ambulatório, etc.)
- ChecklistSeguranca: checklists de segurança
- Sugestao          : sugestões de melhoria dos colaboradores
- Feedback360       : avaliações 360 entre colaboradores
- Documento         : documentos e arquivos gerenciados
- Auditoria         : auditorias gerais (além da VDA)
- PreferenciaUsuario: preferências de configuração por usuário
- AlertaInteligente : alertas gerados automaticamente por IA
- RelatorioCustomizado: relatórios personalizados salvos`],

["config/README.txt", `Configurações técnicas — VW Chefinho

Stack:
  - React 18 + Vite
  - Tailwind CSS + shadcn/ui
  - React Router v6
  - TanStack React Query v5
  - Framer Motion
  - Recharts
  - date-fns
  - jsPDF + html2canvas
  - Base44 SDK (@base44/sdk)

Autenticação:
  - Gerenciada pelo Base44 (token, sessão, e-mail de verificação)
  - Cargos: monitor | lider | supervisor (admin)
  - Guard de turno: TurnoGuard.jsx
  - Guard geográfico: GeoGuard.jsx (raio ~500m VW Taubaté)

Integrações Base44 usadas:
  - Core.InvokeLLM    : IA do assistente Chefinho e geração de slides DDS
  - Core.SendEmail    : envio de senha diária por e-mail
  - Core.UploadFile   : upload de fotos de perfil e documentos
  - Core.GenerateImage: (disponível, não utilizado atualmente)

Roteamento (App.jsx):
  - pagesConfig loop  : páginas antigas
  - Routes explícitos : DashboardProducao, OperacoesHub, PessoasHub, SegurancaHub

Senha Diária:
  - Algoritmo: hash(YYYYMMDD + "VWChefinho2025") % 1000000, 6 dígitos
  - Válida por 1 dia, armazenada em sessionStorage
  - Enviada por e-mail ou WhatsApp (wa.me/55{celular})
`],
];

export default function ExportarDados({ currentUser }) {
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === "admin" || currentUser?.cargo === "supervisor";
  if (!isAdmin) return null;

  const exportarTxt = () => {
    setLoading(true);
    const hoje = format(new Date(), "yyyy-MM-dd HH:mm");
    const separador = "=".repeat(80);

    const linhas = [
      `VW CHEFINHO — CÓDIGO FONTE DO APLICATIVO`,
      `Exportado em: ${hoje}`,
      `Total de arquivos: ${ARQUIVOS.length}`,
      separador,
      "",
    ];

    for (const [caminho, conteudo] of ARQUIVOS) {
      linhas.push(`${separador}`);
      linhas.push(`ARQUIVO: ${caminho}`);
      linhas.push(`${separador}`);
      linhas.push(conteudo);
      linhas.push("");
    }

    const txt = linhas.join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VW_Chefinho_Codigo_${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">Exportar Código do App</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Baixa um arquivo .txt com a documentação técnica e estrutura de todos os módulos do VW Chefinho.
          </p>
        </div>
        <Button
          onClick={exportarTxt}
          disabled={loading}
          className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-sm font-semibold flex-shrink-0"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><FileText className="w-4 h-4 mr-1.5" /> Exportar .txt</>
          }
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {ARQUIVOS.map(([caminho]) => (
          <span key={caminho} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono">
            {caminho.split("/").pop()}
          </span>
        ))}
      </div>
    </div>
  );
}