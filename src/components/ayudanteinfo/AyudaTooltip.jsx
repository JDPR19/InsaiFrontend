import React, { useState } from 'react';
import styles from './AyudaTooltip.module.css';
import icon from '../iconos/iconos'; // Usa tu propio SVG o PNG

function AyudaTooltip({ descripcion }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className={styles.ayudaContainer}
            tabIndex={0}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onClick={() => setVisible(v => !v)}
            onBlur={() => setVisible(false)}
        >
            <img src={icon.question} alt="Ayuda" className={styles.iconoAyuda} />
            {visible && (
                <div className={styles.tooltip}>
                    {descripcion}
                </div>
            )}
        </div>
    );
}
// aplicacion comentada
{/* <AyudaTooltip descripcion="Aquí puedes registrar una nueva solicitud. Completa todos los campos obligatorios y guarda para continuar el proceso." /> */}

export default AyudaTooltip;