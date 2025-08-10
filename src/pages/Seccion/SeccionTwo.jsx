import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Solicitud from '../Solicitud/Solicitud';
import Planificacion from '../Planificacion/Planificacion';
import TipoSolicitud from '../Solicitud/TipoSolicitud';
import TablaAsociadaTwo from '../Seccion/TablaAsociadaTwo';

function SeccionTwo () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
    const tabs = [
        { key: 'asociados', label: 'Catalago' },
        tienePermiso('solicitud', 'ver') && { key: 'solicitud', label: 'Solicitudes' },
        tienePermiso('planificacion', 'ver') && { key: 'planificacion', label: 'Planificaciones' },
        tienePermiso('tipo_solicitud', 'ver') && { key: 'tipo_solicitud', label: 'Tipos de Solicitud' }
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
        const getInitialTab = () => {
            const savedTab = localStorage.getItem('seccionTwoTab');
            return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
        };
    
        const [activeTab, setActiveTab] = useState(getInitialTab());
    
        // Guarda el tab activo en localStorage al cambiar
        const handleTabClick = (tab) => {
            setActiveTab(tab.key);
            localStorage.setItem('seccionTwoTab', tab.key);
        };

    let tablaRenderizada;
    if (activeTab === 'asociados') {
        tablaRenderizada = <TablaAsociadaTwo />;
    } else if (activeTab === 'solicitud') {
        tablaRenderizada = <Solicitud />;
    } else if (activeTab === 'planificacion') {
        tablaRenderizada = <Planificacion />;
    } else if (activeTab === 'tipo_solicitud') {
        tablaRenderizada = <TipoSolicitud/>;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionTwo;