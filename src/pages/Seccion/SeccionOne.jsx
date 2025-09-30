import React, { useState } from 'react';
import Productor from '../Productor/Productor';
import Propiedad from '../Propiedad/Propiedad';
import { useSearchParams } from 'react-router-dom';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';

function SeccionOne() {
    const tienePermiso = usePermiso();
    const [searchParams] = useSearchParams();

    const tabs = [
        tienePermiso('productor', 'ver') && { key: 'productores', label: 'Productores' },
        tienePermiso('propiedad', 'ver') && { key: 'propiedades', label: 'Propiedades' },
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
    const getInitialTab = () => {
        const paramTab = searchParams.get('tab');
        const savedTab = paramTab || localStorage.getItem('seccionOneTab');
        return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Si cambia el query (?tab=...), sincroniza pestaña y localStorage
    React.useEffect(() => {
        const paramTab = searchParams.get('tab');
        if (paramTab && tabs.some(t => t.key === paramTab) && paramTab !== activeTab) {
            setActiveTab(paramTab);
            localStorage.setItem('seccionOneTab', paramTab);
        }
    }, [searchParams, tabs, activeTab]);

    // Guarda el tab activo en localStorage al cambiar
    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        localStorage.setItem('seccionOneTab', tab.key);
    };

    let tablaRenderizada;
    if (activeTab === 'productores') {
        tablaRenderizada = <Productor />;
    } else if (activeTab === 'propiedades') {
        tablaRenderizada = <Propiedad />;
    } 

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionOne;