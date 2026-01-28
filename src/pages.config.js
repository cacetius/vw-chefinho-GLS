/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AuditoriaVDA from './pages/AuditoriaVDA';
import Ausencias from './pages/Ausencias';
import Avisos from './pages/Avisos';
import Calendario from './pages/Calendario';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Documentos from './pages/Documentos';
import Emergencias from './pages/Emergencias';
import Estoque from './pages/Estoque';
import Feedback360 from './pages/Feedback360';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import Home from './pages/Home';
import LiderArea from './pages/LiderArea';
import LinhaProducao from './pages/LinhaProducao';
import Logistica from './pages/Logistica';
import MonitorArea from './pages/MonitorArea';
import Objetivos from './pages/Objetivos';
import PedidosEPI from './pages/PedidosEPI';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import Sugestoes from './pages/Sugestoes';
import Treinamentos from './pages/Treinamentos';
import Versatilidade from './pages/Versatilidade';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AuditoriaVDA": AuditoriaVDA,
    "Ausencias": Ausencias,
    "Avisos": Avisos,
    "Calendario": Calendario,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Documentos": Documentos,
    "Emergencias": Emergencias,
    "Estoque": Estoque,
    "Feedback360": Feedback360,
    "GerenciarUsuarios": GerenciarUsuarios,
    "Home": Home,
    "LiderArea": LiderArea,
    "LinhaProducao": LinhaProducao,
    "Logistica": Logistica,
    "MonitorArea": MonitorArea,
    "Objetivos": Objetivos,
    "PedidosEPI": PedidosEPI,
    "Perfil": Perfil,
    "Registro": Registro,
    "Sugestoes": Sugestoes,
    "Treinamentos": Treinamentos,
    "Versatilidade": Versatilidade,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};