import styles from './spinner.module.css';

function Spinner({ overlay = true, text = "Cargando..." }) {
    return (
        <div className={overlay ? styles.spinnerOverlay : ''}>
            <div className={styles.spinner}></div>
            {text && <span className={styles.spinnerText}>{text}</span>}
        </div>
    );
}

export default Spinner;