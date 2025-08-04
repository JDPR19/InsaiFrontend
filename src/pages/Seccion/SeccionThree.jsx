import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Inspecciones from '../Inspecciones/Inspecciones';
import TipoInspecciones from '../Inspecciones/TipoInspeccion';
import TipoEvento from '../Inspecciones/TipoEvento';
import Programas from '../Programas/Programas';
import TipoProgramas from '../Programas/TipoPrograma';



function SeccionThree () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
        const tabs = [
        tienePermiso('inspeccion', 'ver') && { key: 'inspeccion', label: 'Inspecciones' },
        tienePermiso('programa', 'ver') && { key: 'programa', label: 'Programas' },
        tienePermiso('tipo_inspeccion', 'ver') && { key: 'tipo_inspeccion', label: 'Tipos de Inspeccion ' },
        tienePermiso('tipo_programa', 'ver') && { key: 'tipo_programa', label: 'Tipos de Programa' },
        tienePermiso('tipo_evento', 'ver') && { key: 'tipo_evento', label: 'Tipos de Evento' }
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
            const getInitialTab = () => {
                const savedTab = localStorage.getItem('seccionThreeTab');
                return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
            };
        
            const [activeTab, setActiveTab] = useState(getInitialTab());
        
            // Guarda el tab activo en localStorage al cambiar
            const handleTabClick = (tab) => {
                setActiveTab(tab.key);
                localStorage.setItem('seccionThreeTab', tab.key);
            };
    

    let tablaRenderizada;
    if (activeTab === 'inspeccion') {
        tablaRenderizada = <Inspecciones />;
    } else if (activeTab === 'programa') {
        tablaRenderizada = <Programas />;
    } else if (activeTab === 'tipo_inspeccion') {
        tablaRenderizada = <TipoInspecciones/>;
    } else if (activeTab === 'tipo_programa') {
        tablaRenderizada = <TipoProgramas/>;
    } else if (activeTab === 'tipo_evento') {
        tablaRenderizada = <TipoEvento/>;
    } 

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionThree;