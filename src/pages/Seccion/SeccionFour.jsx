import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Cultivo from '../Cultivo/Cultivo';
import Plagas from '../Plagas/Plagas';
import Laboratorio from '../Labotario/Laboratorio';
import TipoCultivo from '../Cultivo/TipoCultivo';
import TipoPlaga from '../Plagas/TipoPlaga';
import TipoLaboratorio from '../Labotario/TipoLaboratorio';



function SeccionFour () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
        const tabs = [
        tienePermiso('cultivo', 'ver') && { key: 'cultivo', label: 'Cultivos' },
        tienePermiso('plaga', 'ver') && { key: 'plaga', label: 'Plagas' },
        tienePermiso('laboratorio', 'ver') && { key: 'laboratorio', label: 'Laboratorios' },
        tienePermiso('tipo_cultivo', 'ver') && { key: 'tipo_cultivo', label: 'Tipos de Cultivo ' },
        tienePermiso('tipo_plaga', 'ver') && { key: 'tipo_plaga', label: 'Tipos de Plaga' },
        tienePermiso('tipo_laboratorio', 'ver') && { key: 'tipo_laboratorio', label: 'Tipos de Laboratorio' },
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
        const getInitialTab = () => {
            const savedTab = localStorage.getItem('seccionFourTab');
            return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
        };
    
        const [activeTab, setActiveTab] = useState(getInitialTab());
    
        // Guarda el tab activo en localStorage al cambiar
        const handleTabClick = (tab) => {
            setActiveTab(tab.key);
            localStorage.setItem('seccionFourTab', tab.key);
        };

    let tablaRenderizada;
    if (activeTab === 'cultivo') {
        tablaRenderizada = <Cultivo />;
    } else if (activeTab === 'plaga') {
        tablaRenderizada = <Plagas />;
    } else if (activeTab === 'laboratorio') {
        tablaRenderizada = <Laboratorio/>;
    } else if (activeTab === 'tipo_cultivo') {
        tablaRenderizada = <TipoCultivo/>;
    } else if (activeTab === 'tipo_plaga') {
        tablaRenderizada = <TipoPlaga/>;
    } else if (activeTab === 'tipo_laboratorio') {
        tablaRenderizada = <TipoLaboratorio/>;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionFour;