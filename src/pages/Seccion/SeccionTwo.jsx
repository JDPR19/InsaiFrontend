import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Solicitud from '../Solicitud/Solicitud';
import Planificacion from '../Planificacion/Planificacion';
import Inspecciones from '../Inspecciones/Inspecciones';
import { useSearchParams } from 'react-router-dom';

function SeccionTwo () {
    const tienePermiso = usePermiso();
    const [searchParams] = useSearchParams();

    // Tabs principales
    const tabs = [
        tienePermiso('solicitud', 'ver') && { key: 'solicitud', label: 'Solicitudes' },
        tienePermiso('planificacion', 'ver') && { key: 'planificacion', label: 'Planificaciones' },
        tienePermiso('inspecciones', 'ver') && { key: 'inspecciones', label: 'Inspecciones' },
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
        const getInitialTab = () => {
            const paramTab = searchParams.get('tab');
            const savedTab = paramTab || localStorage.getItem('seccionTwoTab');
            return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
        };
        
        const [activeTab, setActiveTab] = useState(getInitialTab());

        React.useEffect(() => {
                const paramTab = searchParams.get('tab');
                if (paramTab && tabs.some(t => t.key === paramTab) && paramTab !== activeTab) {
                    setActiveTab(paramTab);
                    localStorage.setItem('seccionTwoTab', paramTab);
                }
            }, [searchParams, tabs, activeTab]);

        
    
        // Guarda el tab activo en localStorage al cambiar
        const handleTabClick = (tab) => {
            setActiveTab(tab.key);
            localStorage.setItem('seccionTwoTab', tab.key);
        };

    let tablaRenderizada;
    if (activeTab === 'solicitud') {
        tablaRenderizada = <Solicitud />;
    } else if (activeTab === 'planificacion') {
        tablaRenderizada = <Planificacion />;
    } else if (activeTab === 'inspecciones'){
        tablaRenderizada = <Inspecciones/>;
    } 

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionTwo;