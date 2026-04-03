import AuditoriaVDA from './pages/AuditoriaVDA';
import Dashboard from './pages/Dashboard';
import DashboardProducao from './pages/DashboardProducao';
import Estoque from './pages/Estoque';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import LayoutLinhaPage from './pages/LayoutLinhaPage';
import LiderArea from './pages/LiderArea';
import LinhaProducao from './pages/LinhaProducao';
import MonitorArea from './pages/MonitorArea';
import OperacoesHub from './pages/OperacoesHub';
import PessoasHub from './pages/PessoasHub';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import SegurancaHub from './pages/SegurancaHub';
import __Layout from './Layout.jsx';

export const PAGES = {
    "AuditoriaVDA": AuditoriaVDA,
    "Dashboard": Dashboard,
    "DashboardProducao": DashboardProducao,
    "Estoque": Estoque,
    "GerenciarUsuarios": GerenciarUsuarios,
    "LayoutLinhaPage": LayoutLinhaPage,
    "LiderArea": LiderArea,
    "LinhaProducao": LinhaProducao,
    "MonitorArea": MonitorArea,
    "OperacoesHub": OperacoesHub,
    "PessoasHub": PessoasHub,
    "Perfil": Perfil,
    "Registro": Registro,
    "SegurancaHub": SegurancaHub,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};