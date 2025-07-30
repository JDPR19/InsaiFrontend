import React, { useState } from 'react';
import TabsFiltro from '../../components/TabsFiltro/TabsFiltro';
import { usePermiso } from '../../hooks/usePermiso';
import '../../main.css';
import Usuario from '../Usuario/Usuario';
import Empleado from '../Empleados/Empleados';
import Cargo from '../Cargo/Cargo';
import TipoUsuario from '../Usuario/TipoUsuario';

function SeccionSeven () {
    const tienePermiso = usePermiso();
    
    // Tabs principales
        const tabs = [
        tienePermiso('usuarios', 'ver') && { key: 'usuarios', label: 'Usuarios' },
        tienePermiso('empleados', 'ver') && { key: 'empleados', label: 'Empleados' },
        tienePermiso('tipo_usuario', 'ver') && { key: 'tipo_usuario', label: 'Roles & Permisos' },
        tienePermiso('cargos', 'ver') && { key: 'cargo', label: 'Cargos' }
    ].filter(Boolean);

    // Obtiene el tab guardado y verifica que exista en los tabs permitidos
        const getInitialTab = () => {
            const savedTab = localStorage.getItem('seccionSevenTab');
            return tabs.some(tab => tab.key === savedTab) ? savedTab : tabs[0].key;
        };
    
        const [activeTab, setActiveTab] = useState(getInitialTab());
    
        // Guarda el tab activo en localStorage al cambiar
        const handleTabClick = (tab) => {
            setActiveTab(tab.key);
            localStorage.setItem('seccionSevenTab', tab.key);
        };

        let tablaRenderizada;
        if (activeTab === 'usuarios') {
            tablaRenderizada = <Usuario />;
        } else if (activeTab === 'empleados') {
            tablaRenderizada = <Empleado />;
        } else if (activeTab === 'tipo_usuario') {
            tablaRenderizada = <TipoUsuario/>;
        } else if (activeTab === 'cargo') {
            tablaRenderizada = <Cargo/>;
        }

    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionSeven;