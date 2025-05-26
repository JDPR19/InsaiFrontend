import React, { useState } from 'react';
import styles from '../../components/modalpermiso/permisomodal.module.css';
import { PANTALLAS, ACCIONES} from '../../utils/permisouser'


    function PermisosModal({ tipoUsuario, onSave, onClose }) {
    // Estado inicial: asegúrate de que cada pantalla tenga un objeto de acciones
    const [permisos, setPermisos] = useState(() => {
        const base = {};
        PANTALLAS.forEach(p => {
        base[p.key] = { ver: false, crear: false, editar: false, eliminar: false, ...(tipoUsuario.permisos?.[p.key] || {}) };
        });
        return base;
    });

    const handleSwitch = (pantallaKey, accionKey) => {
        setPermisos(prev => ({
        ...prev,
        [pantallaKey]: {
            ...prev[pantallaKey],
            [accionKey]: !prev[pantallaKey][accionKey]
        }
        }));
    };

    const handleSave = () => {
        onSave(permisos);
    };

    return (
        <div className={styles.modalOverlay}>
        <div className={styles.modal}>
            <button className='closeButton' onClick={onClose}>&times;</button>
            <h2>Permisos para {tipoUsuario.nombre}</h2>
        <div className={styles.tableScroll}>

            <table style={{ width: '100%', marginTop: 16, marginBottom: 16 }}>
            <thead>
                <tr>
                <th>Pantalla</th>
                {ACCIONES.map(a => (
                    <th key={a.key}>{a.label}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {PANTALLAS.map(pantalla => (
                <tr key={pantalla.key}>
                    <td>{pantalla.label}</td>
                    {ACCIONES.map(accion => (
                    <td key={accion.key} style={{ textAlign: 'center' }}>
                        <input
                        type="checkbox"
                        checked={!!permisos[pantalla.key][accion.key]}
                        onChange={() => handleSwitch(pantalla.key, accion.key)}
                        />
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
            <div style={{ marginTop: 16 }}>
            <button onClick={handleSave} className={styles.saveButton}>Guardar</button>
            </div>
        </div>
        </div>
    );
    }

export default PermisosModal;