import QuadroMonitor from './pages/QuadroMonitor';
import Ferramentas from './pages/Ferramentas';
import AuditoriaIndustrial from './pages/AuditoriaIndustrial';
import Calibracao from './pages/Calibracao';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import __Layout from './Layout.jsx';

export const PAGES = {
    "QuadroMonitor": QuadroMonitor,
    "Ferramentas": Ferramentas,
    "AuditoriaIndustrial": AuditoriaIndustrial,
    "Calibracao": Calibracao,
    "Dashboard": Dashboard,
    "Perfil": Perfil,
}

export const pagesConfig = {
    mainPage: "QuadroMonitor",
    Pages: PAGES,
    Layout: __Layout,
};