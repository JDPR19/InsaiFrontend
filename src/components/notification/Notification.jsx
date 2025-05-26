import React, { useEffect } from 'react';
import  styles from './notification.module.css'; // Archivo CSS para estilos personalizados

function Notification({ message, type, onClose }) {
    useEffect(() => {
        // Cerrar automáticamente la notificación después de 3 segundos
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }, [onClose]);

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <p>{message}</p>
            <button className={styles.closeButton} onClick={onClose}>
                &times;
            </button>
        </div>
    );
}

export default Notification;