import React, { useState } from 'react';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Sector from '../Ubicacion/Sector';
import Parroquia from '../Ubicacion/Parroquia';
import Municipio from '../Ubicacion/Municipio';
import Estados from '../Ubicacion/Estados';

function SeccionSix () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
        const tabs = [
        tienePermiso('sector', 'ver') && { key: 'sector', label: 'Sectores' },
        tienePermiso('parroquia', 'ver') && { key: 'parroquia', label: 'Parroquias' },
        tienePermiso('municipio', 'ver') && { key: 'municipio', label: 'Municipios' },
        tienePermiso('estado', 'ver') && { key: 'estado', label: 'Estados' }
    ].filter(Boolean);

     // Obtiene el tab guardado y verifica que exista en los tabs permitidos
            const getInitialTab = () => {
                const savedTab = localStorage.getItem('seccionSixTab');
                return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
            };
        
            const [activeTab, setActiveTab] = useState(getInitialTab());
        
            // Guarda el tab activo en localStorage al cambiar
            const handleTabClick = (tab) => {
                setActiveTab(tab.key);
                localStorage.setItem('seccionSixTab', tab.key);
            };

    let tablaRenderizada;
    if (activeTab === 'sector') {
        tablaRenderizada = <Sector />;
    } else if (activeTab === 'parroquia') {
        tablaRenderizada = <Parroquia />;
    } else if (activeTab === 'municipio') {
        tablaRenderizada = <Municipio/>;
    } else if (activeTab === 'estado') {
        tablaRenderizada = <Estados/>;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionSix;