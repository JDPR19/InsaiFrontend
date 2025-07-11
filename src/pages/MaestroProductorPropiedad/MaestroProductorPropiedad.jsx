import React, { useState } from 'react';
import Productor from '../Productor/Productor';
import Propiedad from '../Propiedad/Propiedad';
import TablaProductorPropiedad from './TablaAsociada'; 
import TipoPropiedad from '../Propiedad/TipoPropiedad';
import TabsFiltro from '../../components/tabsFiltro/TabsFiltro';
import Styles from './maestro.module.css';

function MaestroProductorPropiedad() {
    const [activeTab, setActiveTab] = useState('asociados');

    // Tabs principales
    const tabs = [
        { key: 'asociados', label: 'Asociados' },
        { key: 'productores', label: 'Productores' },
        { key: 'propiedades', label: 'Propiedades' },
        { key: 'tipo_propiedad', label: 'Tipos de Propiedad' }
    ];

    // Renderizado condicional de tablas
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
        <div className={Styles.Container}>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={tab => setActiveTab(tab.key)} />
            {tablaRenderizada}
        </div>
    );
}

export default MaestroProductorPropiedad;