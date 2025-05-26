import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Error.module.css';
import icon from '../../components/iconos/iconos'; // Asegúrate de que esta ruta sea correcta

function Error() {
    return (
        <div className={styles.errorContainer}>
            <img src={icon.error} alt="Error" className={styles.errorImage} />
            <h1 className={styles.errorTitle}>404 - Página no encontrada</h1>
            <p className={styles.errorMessage}>
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            <Link to="/Home" className={styles.homeButton}>
                Volver al inicio
            </Link>
        </div>
    );
}

export default Error;