import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import Insai from '../../../public/assets/insai.png';
import Perro from '../../../public/assets/perro.png';
import Importancia from '../../../public/assets/impor.png';
import inspecciones from '../../../public/assets/export.png';
import icon from '../../components/iconos/iconos';
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { useMemo } from 'react';
import { registrarInicioSesion} from '../../utils/bitacoraService';


    

// Componente Slider: maneja el carrusel de imágenes
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

// Componente InputGroup: maneja los campos del formulario
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

// Componente PhraseContainer: muestra frases aleatorias
function PhraseContainer({ randomPhrase }) {
    return (
        <div className={styles.phraseContainer}>
            <p className={styles.phrase}>{randomPhrase}</p>
        </div>
    );
}

// Componente principal Login
function Login() {
    // Estados necesarios para manejar la lógica del login
    const [currentSlide, setCurrentSlide] = useState(0); // Slide actual del carrusel
    const [randomPhrase, setRandomPhrase] = useState(''); // Frase aleatoria
    const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
    const [username, setUsername] = useState(''); // Estado para el usuario
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const { notifications, addNotification, removeNotification } = useNotification();
    const [isHovered, setIsHovered] = useState(false); // Pausar el slider al interactuar
    const navigate = useNavigate();

    const phrases = useMemo(() => [
        "La seguridad y eficiencia son nuestra prioridad.",
        "Optimiza tus procesos con SIGENSAI.",
        "SIGENSAI: Facilitamos tu labor.",
        "Tu aliado en la innovación y eficiencia.",
    ], []);

    // Elegir frase aleatoria
    useEffect(() => {

        const randomIndex = Math.floor(Math.random() * phrases.length);
        setRandomPhrase(phrases[randomIndex]);
    }, [phrases]);


    // Slides del carrusel
    const slides = [
        { image: inspecciones, text: 'Inspecciones sanitarias' },
        { image: Insai, text: 'Bienvenido al sistema SIGENSAI' },
        { image: Perro, text: 'Gestión eficiente y segura' },
        { image: Importancia, text: 'Optimiza tus procesos agrícolas' },
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
        if (isHovered) return; // Pausa el slider cuando el usuario interactúa

        const slideInterval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 6000);

        return () => clearInterval(slideInterval); // Limpiar el intervalo al desmontar
    }, [isHovered, slides.length]);

    

    // Manejo del login
    const handleLogin = async (e) => {
        e.preventDefault();

        // Validaciones de los campos
        if (!username.trim()) {
            addNotification('El campo de usuario no puede estar vacío.', 'error');
            return;
        }

        if (!password.trim()) {
            addNotification('El campo de contraseña no puede estar vacío.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/auth/login', {
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
                    tipo_usuario_id: data.user.tipo_usuario_id,
                    tipo_usuario_nombre: data.user.tipo_usuario_nombre
                }));

                localStorage.setItem('permisos', JSON.stringify(data.user.permisos));

                addNotification('Inicio de sesión exitoso', 'success');
                registrarInicioSesion(data.user.id, data.user.username);
                // Retrasa la redirección para mostrar notificación
                setTimeout(() => {
                    navigate('/Home');
                }, 500);
            } else {
                addNotification(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            addNotification('Error al conectar con el servidor', 'error');
        }
    };

    // Renderizado del componente principal
    return (
        <div className={styles.loginContainer}>
            {/* Mostrar notificaciones */}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Formulario */}
            <div className={styles.loginCard}>
                <form onSubmit={handleLogin} id="loginForm">
                    <h1 className={styles.loginTitle}>Iniciar Sesión</h1>

                    {/* Campo de usuario */}
                    <InputGroup
                        iconSrc={icon.user}
                        type="text"
                        placeholder="Usuario"
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

                    <button type="submit" title="Entrar" className={styles.submitButton} >
                        Entrar
                        <img src={icon.llave} alt="Cerrar sesión" className={styles.iconbtn} />
                    </button>
                </form>

                {/* Recuperación de contraseña */}
                <div className={styles.oldpass}>
                    <a href="/terms">¿Has Olvidado la Contraseña?</a>
                </div>

                {/* Frases aleatorias */}
                <div className={styles.frases}>
                    <PhraseContainer randomPhrase={randomPhrase} />
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p>© 2025 SIGENSAI. Todos los derechos reservados.</p>
                    <a href="/terms">Términos de Servicio</a>
                    <a href="/privacy">Política de Privacidad</a>
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
