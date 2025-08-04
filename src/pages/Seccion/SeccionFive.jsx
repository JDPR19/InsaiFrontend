import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Permiso from '../Permiso/Permisos';
import TipoPermiso from '../Permiso/TipoPermiso';


function SeccionFive () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
        const tabs = [
        tienePermiso('permiso', 'ver') && { key: 'permiso', label: 'Permisos' },
        tienePermiso('tipo_permiso', 'ver') && { key: 'tipo_permiso', label: 'Tipos de Permiso' }
    ].filter(Boolean);

     // Obtiene el tab guardado y verifica que exista en los tabs permitidos
            const getInitialTab = () => {
                const savedTab = localStorage.getItem('seccionFiveTab');
                return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
            };
        
            const [activeTab, setActiveTab] = useState(getInitialTab());
        
            // Guarda el tab activo en localStorage al cambiar
            const handleTabClick = (tab) => {
                setActiveTab(tab.key);
                localStorage.setItem('seccionFiveTab', tab.key);
            };

    let tablaRenderizada;
    if (activeTab === 'permiso') {
        tablaRenderizada = <Permiso />;
    } else if (activeTab === 'tipo_permiso') {
        tablaRenderizada = <TipoPermiso />;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionFive;