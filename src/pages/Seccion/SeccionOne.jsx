import React, { useState } from 'react';
import Productor from '../Productor/Productor';
import Propiedad from '../Propiedad/Propiedad';
import TablaProductorPropiedad from './TablaAsociada'; 
import TipoPropiedad from '../Propiedad/TipoPropiedad';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';

function SeccionOne() {
    const tienePermiso = usePermiso();

    const tabs = [
        // { key: 'asociados', label: 'Catalago' },
        tienePermiso('productor', 'ver') && { key: 'productores', label: 'Productores' },
        tienePermiso('propiedad', 'ver') && { key: 'propiedades', label: 'Propiedades' },
        tienePermiso('tipo_propiedad', 'ver') && { key: 'tipo_propiedad', label: 'Tipos de Propiedad' }
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
    const getInitialTab = () => {
        const savedTab = localStorage.getItem('seccionOneTab');
        return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Guarda el tab activo en localStorage al cambiar
    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        localStorage.setItem('seccionOneTab', tab.key);
    };

    let tablaRenderizada;
    if (activeTab === 'asociados') {
        tablaRenderizada = <TablaProductorPropiedad />;
    } else if (activeTab === 'productores') {
        tablaRenderizada = <Productor />;
    } else if (activeTab === 'propiedades') {
        tablaRenderizada = <Propiedad />;
    } else if (activeTab === 'tipo_propiedad') {
        tablaRenderizada = <TipoPropiedad />;
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionOne;