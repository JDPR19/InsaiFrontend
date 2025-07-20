import React, { useState } from 'react';
import Productor from '../Productor/Productor';
import Propiedad from '../Propiedad/Propiedad';
import TablaProductorPropiedad from './TablaAsociada'; 
import TipoPropiedad from '../Propiedad/TipoPropiedad';
import TabsFiltro from '../../components/TabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';

function SeccionOne() {
    const [activeTab, setActiveTab] = useState('asociados');
    const tienePermiso = usePermiso();
    // Tabs principales
        const tabs = [
        tienePermiso('asociados', 'ver') && { key: 'asociados', label: 'Asociados' },
        tienePermiso('productor', 'ver') && { key: 'productores', label: 'Productores' },
        tienePermiso('propiedad', 'ver') && { key: 'propiedades', label: 'Propiedades' },
        tienePermiso('tipo_propiedad', 'ver') && { key: 'tipo_propiedad', label: 'Tipos de Propiedad' }
    ].filter(Boolean);

    let tablaRenderizada;
    if (activeTab === 'asociados') {
        tablaRenderizada = <TablaProductorPropiedad />;
    } else if (activeTab === 'productores') {
        tablaRenderizada = <Productor />;
    } else if (activeTab === 'propiedades') {
        tablaRenderizada = <Propiedad />;
    } else if (activeTab === 'tipo_propiedad') {
        tablaRenderizada = <TipoPropiedad/>
    }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={tab => setActiveTab(tab.key)} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionOne;