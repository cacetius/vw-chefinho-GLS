import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import Logistica from './pages/Logistica';
import PedidosEPI from './pages/PedidosEPI';
import Versatilidade from './pages/Versatilidade';
import Chat from './pages/Chat';
import MonitorArea from './pages/MonitorArea';
import LiderArea from './pages/LiderArea';
import Perfil from './pages/Perfil';
import Avisos from './pages/Avisos';
import Objetivos from './pages/Objetivos';
import Emergencias from './pages/Emergencias';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import Treinamentos from './pages/Treinamentos';
import Ausencias from './pages/Ausencias';
import Estoque from './pages/Estoque';
import Documentos from './pages/Documentos';
import Calendario from './pages/Calendario';
import Feedback360 from './pages/Feedback360';
import Sugestoes from './pages/Sugestoes';
import AuditoriaVDA from './pages/AuditoriaVDA';
import LinhaProducao from './pages/LinhaProducao';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Registro": Registro,
    "Logistica": Logistica,
    "PedidosEPI": PedidosEPI,
    "Versatilidade": Versatilidade,
    "Chat": Chat,
    "MonitorArea": MonitorArea,
    "LiderArea": LiderArea,
    "Perfil": Perfil,
    "Avisos": Avisos,
    "Objetivos": Objetivos,
    "Emergencias": Emergencias,
    "GerenciarUsuarios": GerenciarUsuarios,
    "Treinamentos": Treinamentos,
    "Ausencias": Ausencias,
    "Estoque": Estoque,
    "Documentos": Documentos,
    "Calendario": Calendario,
    "Feedback360": Feedback360,
    "Sugestoes": Sugestoes,
    "AuditoriaVDA": AuditoriaVDA,
    "LinhaProducao": LinhaProducao,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};