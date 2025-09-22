import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import TipoProgramas from '../Programas/TipoPrograma';
import TipoSolicitud from '../Solicitud/TipoSolicitud';
import TipoPermiso from '../Permiso/TipoPermiso';
import TipoPropiedad from '../Propiedad/TipoPropiedad';
import TipoEvento from '../Inspecciones/TipoEvento';
import Tipoinspeccion from '../Inspecciones/TipoInspeccion';
import TipoCultivo from '../Cultivo/TipoCultivo';
import TipoPlaga from '../Plagas/TipoPlaga';
import TipoLaboratorio from '../Labotario/TipoLaboratorio';

function SeccionFour() {
    const tienePermiso = usePermiso();

    // Definición de tabs únicos y con permisos
    const tabs = [
        tienePermiso('tipo_programa', 'ver') && { key: 'tipo_programa', label: 'Tipos de Programa' },
        tienePermiso('tipo_solicitud', 'ver') && { key: 'tipo_solicitud', label: 'Tipos de Solicitud' },
        tienePermiso('tipo_permiso', 'ver') && { key: 'tipo_permiso', label: 'Tipos de Permiso' },
        tienePermiso('tipo_propiedad', 'ver') && { key: 'tipo_propiedad', label: 'Tipos de Propiedad' },
        tienePermiso('tipo_evento', 'ver') && { key: 'tipo_evento', label: 'Tipos de Evento' },
        tienePermiso('tipo_inspeccion', 'ver') && { key: 'tipo_inspeccion', label: 'Tipos de Inspección' },
        tienePermiso('tipo_cultivo', 'ver') && { key: 'tipo_cultivo', label: 'Tipos de Cultivo' },
        tienePermiso('tipo_plaga', 'ver') && { key: 'tipo_plaga', label: 'Tipos de Plaga' },
        tienePermiso('tipo_laboratorio', 'ver') && { key: 'tipo_laboratorio', label: 'Tipos de Laboratorio' },
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
    const getInitialTab = () => {
        const savedTab = localStorage.getItem('seccionFourTab');
        return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0]?.key;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Guarda el tab activo en localStorage al cambiar
    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        localStorage.setItem('seccionFourTab', tab.key);
    };

    // Renderiza el componente según el tab activo
    let tablaRenderizada = null;
    if (activeTab === 'tipo_programa') {
        tablaRenderizada = <TipoProgramas />;
    } else if (activeTab === 'tipo_solicitud') {
        tablaRenderizada = <TipoSolicitud />;
    } else if (activeTab === 'tipo_propiedad') {
        tablaRenderizada = <TipoPropiedad />;
    }else if (activeTab === 'tipo_permiso') {
        tablaRenderizada = <TipoPermiso />;
    }else if (activeTab === 'tipo_inspeccion') {
        tablaRenderizada = <Tipoinspeccion />;
    } else if (activeTab === 'tipo_evento') {
        tablaRenderizada = <TipoEvento />;
    } else if (activeTab === 'tipo_cultivo') {
        tablaRenderizada = <TipoCultivo />;
    } else if (activeTab === 'tipo_plaga') {
        tablaRenderizada = <TipoPlaga />;
    } else if (activeTab === 'tipo_laboratorio') {
        tablaRenderizada = <TipoLaboratorio />;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionFour;