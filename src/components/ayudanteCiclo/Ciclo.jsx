import React from 'react';
import styles from './ciclo.module.css';
import icon from '../iconos/iconos';

const pasos = [
    { key: 'solicitud', label: 'Solicitud', icon: icon.ver },
    { key: 'planificacion', label: 'Planificación', icon: icon.calendario },
    { key: 'inspeccion', label: 'Inspección', icon: icon.user },
    { key: 'seguimiento', label: 'Seguimiento', icon: icon.lupa2 }
];

function Ciclo({ activo }) {
    return (
        <div className={styles.cicloContainer}>
            {pasos.map((paso, idx) => (
                <React.Fragment key={paso.key}>
                    <div className={`${styles.paso} ${activo === paso.key ? styles.activo : ''}`}>
                        <img src={paso.icon} alt={paso.label} className={styles.icono} />
                        <span>{paso.label}</span>
                    </div>
                    {idx < pasos.length - 1 && <span className={styles.flecha}>→</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Ciclo;