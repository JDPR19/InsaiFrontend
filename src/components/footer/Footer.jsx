import styles from './footer.module.css';
import { useNavigate } from 'react-router-dom';

function Footer() {
    const navigate = useNavigate();
    return (
        <div className={styles.footer}>
            <p>
                ¿Necesitas ayuda? consulta el{' '}
                <a
                    href="#"
                    onClick={e => {
                        e.preventDefault();
                        navigate('/informativa');
                    }}
                >
                    Soporte de Usuario SICIC-INSAI
                </a>
            </p>
        </div>
    );
}

export default Footer;