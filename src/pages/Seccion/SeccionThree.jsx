import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Programas from '../Programas/Programas';
import Cultivo from '../Cultivo/Cultivo';
import Plagas from '../Plagas/Plagas';
import Laboratorio from '../Labotario/Laboratorio';

function SeccionThree () {
    const tienePermiso = usePermiso();

    // Tabs principales según permisos
    const tabs = [
        tienePermiso('programa', 'ver') && { key: 'programa', label: 'Programas' },
        tienePermiso('cultivo', 'ver') && { key: 'cultivo', label: 'Cultivo' },
        tienePermiso('plaga', 'ver') && { key: 'plaga', label: 'Plagas' },
        tienePermiso('laboratorio', 'ver') && { key: 'laboratorio', label: 'Laboratorio' }
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
    const getInitialTab = () => {
        const savedTab = localStorage.getItem('seccionThreeTab');
        return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0]?.key;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Guarda el tab activo en localStorage al cambiar
    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        localStorage.setItem('seccionThreeTab', tab.key);
    };

    // Renderiza el componente según el tab activo
    let tablaRenderizada;
    if (activeTab === 'programa') {
        tablaRenderizada = <Programas />;
    } else if (activeTab === 'cultivo') {
        tablaRenderizada = <Cultivo />;
    } else if (activeTab === 'plaga') {
        tablaRenderizada = <Plagas />;
    } else if (activeTab === 'laboratorio') {
        tablaRenderizada = <Laboratorio />;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionThree;