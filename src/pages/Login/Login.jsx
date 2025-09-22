import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import Insai from '../../../public/assets/insai.png';
import Perro from '../../../public/assets/perro.png';
import Importancia from '../../../public/assets/impor.png';
import inspecciones from '../../../public/assets/export.png';
import Sisic from '../../../public/assets/logo-sisic.png'
import icon from '../../components/iconos/iconos';
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../../components/spinner/Spinner';
import RecuperarModal from '../../components/modalrecuperar/RecuperarModal';
import { BaseUrl } from '../../utils/constans';
import axios from 'axios';

function Slider({ slides, currentSlide, onMouseEnter, onMouseLeave }) {
    return (
        <div
            className={styles.slider}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <img
                src={slides[currentSlide].image}
                alt={`Slide ${currentSlide + 1}`}
                className={styles.sliderImage}
            />
            <p className={styles.sliderText}>{slides[currentSlide].text}</p>
        </div>
    );
}

function InputGroup({ iconSrc, type, placeholder, value, onChange, onClick, error }) {
    return (
        <div className={styles.inputGroup}>
            <img
                src={iconSrc}
                alt="Input Icon"
                className={styles.icon}
                onClick={onClick}
            />
            <input
                type={type}
                className={styles.inputField}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}

function PhraseContainer({ randomPhrase }) {
    return (
        <div className={styles.phraseContainer}>
            <p className={styles.phrase}>{randomPhrase}</p>
        </div>
    );
}

function Login() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [randomPhrase, setRandomPhrase] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { addNotification } = useNotification();
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRecuperar, setShowRecuperar] = useState(false);
    const audioRef = useRef(null);
    const navigate = useNavigate();

    const phrases = useMemo(() => [
        "La seguridad y eficiencia son nuestra prioridad.",
        "Optimiza tus procesos con SISIC-INSAI.",
        "SISIC-INSAI: Facilitamos tu labor.",
        "Tu aliado en la innovación y eficiencia.",
    ], []);

    // Elegir frase aleatoria
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        setRandomPhrase(phrases[randomIndex]);
    }, [phrases]);

    // Slides del carrusel
    const slides = [
        { image: Sisic, text: 'Optimiza tus procesos agrícolas' },
        { image: Perro, text: 'Gestión eficiente y segura' },
        { image: inspecciones, text: 'Inspecciones sanitarias' },
        { image: Importancia, text: 'Optimiza tus procesos agrícolas' },
        { image: Insai, text: 'Bienvenido al sistema SIGENSAI' },
    ];

    // Verificar si ya hay un token de autenticación y redirigir al usuario
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/Home', { replace: true });
        }
    }, [navigate]);

    // Control del slider automático
    useEffect(() => {
        if (isHovered) return;
        const slideInterval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [isHovered, slides.length]);

    // Manejo del login
    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);

        if (!username.trim() && !password.trim()) {
            addNotification('Debes ingresar usuario/correo y contraseña.', 'error');
            setLoading(false);
            return;
        }

        if (!username.trim()) {
            addNotification('El campo de usuario o correo no puede estar vacío.', 'error');
            setLoading(false);
            return;
        }

        if (!password.trim()) {
            addNotification('El campo de contraseña no puede estar vacío.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y redirigir
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    username: data.user.username,
                    roles_id: data.user.roles_id,
                    roles_nombre: data.user.roles_nombre
                }));

                localStorage.setItem('permisos', JSON.stringify(data.user.permisos));

                // Consultar notificaciones pendientes del usuario
                try {
                    const token = data.token;
                    const res = await axios.get(`${BaseUrl}/auth/pendientes?usuario_id=${data.user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const pendientes = res.data;
                    if (pendientes.length > 0) {
                        addNotification(`Revisa tus notificaciones son de importancia`, 'info');
                        addNotification(`Tienes ${pendientes.length} notificaciones pendiente`, 'info');
                    } else {
                        addNotification('No tienes notificaciones pendientes', 'info');
                    }
                } catch (error) {
                    console.error('no se pudo consultar las notificaciones pendientes', error);
                    addNotification('No se pudo consultar tus notificaciones pendientes', 'error');
                }

                // Reproducir sonido de bienvenida usando ref
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(error => {
                        console.warn('No se pudo reproducir el sonido de bienvenida:', error);
                    });
                }

                addNotification('Inicio de sesión exitoso', 'success');
                addNotification('Bienvenido al Sistema SIGENSAI', 'success');
                setTimeout(() => {
                    navigate('/Home');
                }, 800);
            } else {
                addNotification(data.message || 'Error al iniciar sesión ', 'error');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            addNotification('Error al conectar con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.loginContainer}>
            {loading && <Spinner text="Procesando..." />}
            <audio ref={audioRef} src="/sicic/assets/notification.mp3" preload="auto" style={{ display: 'none' }} />
            {showRecuperar && <RecuperarModal onClose={() => setShowRecuperar(false)} />}

            {/* Formulario */}
            <div className={styles.loginCard}>
                <form onSubmit={handleLogin} id="loginForm">
                    <h1 className={styles.loginTitle}>Iniciar Sesión</h1>

                    {/* Campo de usuario */}
                    <InputGroup
                        iconSrc={icon.user}
                        type="text"
                        placeholder="Usuario o correo"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    {/* Campo de contraseña */}
                    <InputGroup
                        iconSrc={showPassword ? icon.ojito : icon.ojitoculto}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onClick={() => setShowPassword(!showPassword)}
                    />

                    <button type="submit" title="Entrar" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Procesando...' : 'Entrar'}
                        <img src={icon.llave} alt="Cerrar sesión" className={styles.iconbtn} />
                    </button>
                </form>

                {/* Recuperación de contraseña */}
                <div className={styles.oldpass}>
                    <button
                        type="button"
                        title="Recuperar contraseña"
                        onClick={() => setShowRecuperar(true)}
                    >
                        ¿Has Olvidado la Contraseña?
                    </button>
                </div>

                {/* Frases aleatorias */}
                <div className={styles.frases}>
                    <PhraseContainer randomPhrase={randomPhrase} />
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p> Gobierno Bolivariano de Venezuela &#x1F1FB;&#x1F1EA;</p>
                    <p>© 2025  Instituto Nacional de Salud Agrícola Integral, INSAI</p>
                    <p>Sistema de Información para el Control de Inspecciones de Campo &#x1F1FB;&#x1F1EA;</p>
                </footer>
            </div>

            {/* Carrusel */}
            <Slider
                slides={slides}
                currentSlide={currentSlide}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    );
}

export default Login;