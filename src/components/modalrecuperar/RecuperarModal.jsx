import React, { useState } from 'react';
import '../../main.css';
import Spinner from '../spinner/Spinner';
import Notification from '../notification/Notification';

function RecuperarModal({ onClose }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/solicitar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setNotification({ message: data.message, type: 'success' });
                setStep(2);
            } else {
                setNotification({ message: data.message, type: 'error' });
            }
        } catch {
            setNotification({ message: 'Error enviando el código', type: 'error' });
        }
        setLoading(false);
    };

    // Paso 2: Verificar código
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await res.json();
            if (res.ok) {
                setNotification({ message: data.message, type: 'success' });
                setStep(3);
            } else {
                setNotification({ message: data.message, type: 'error' });
            }
        } catch {
            setNotification({ message: 'Error verificando el código', type: 'error' });
        }
        setLoading(false);
    };

    // Paso 3: Cambiar contraseña
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/cambiar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setNotification({ message: data.message, type: 'success' });
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setNotification({ message: data.message, type: 'error' });
            }
        } catch {
            setNotification({ message: 'Error cambiando la contraseña', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="modalOverlay">
            <div className="modal_mono">
                <button className="closeButton" onClick={onClose}>&times;</button>
                <h2>Recuperar Contraseña</h2>
                {loading && <Spinner text="Procesando..." />}
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
                {step === 1 && (
                    <form className="modalForm" onSubmit={handleSendCode}>
                        <div className="formGroup">
                            <label htmlFor="recuperar-email">Correo registrado:</label>
                            <input
                                type="email"
                                id="recuperar-email"
                                className="input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                        <button type="submit" className="saveButton" title='Enviar'>Enviar código</button>
                    </form>
                )}
                {step === 2 && (
                    <form className="modalForm" onSubmit={handleVerifyCode}>
                        <div className="formGroup">
                            <label htmlFor="recuperar-codigo">Código recibido:</label>
                            <input
                                type="text"
                                id="recuperar-codigo"
                                className="input"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                required
                                placeholder="Código de 6 dígitos"
                            />
                        </div>
                        <button type="submit" className="saveButton" title='Verificar'>Verificar código</button>
                    </form>
                )}
                {step === 3 && (
                    <form className="modalForm" onSubmit={handleChangePassword}>
                        <div className="formGroup">
                            <label htmlFor="recuperar-nueva">Nueva contraseña:</label>
                            <input
                                type="password"
                                id="recuperar-nueva"
                                className="input"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                placeholder="Nueva contraseña"
                            />
                        </div>
                        <button type="submit" className="saveButton" title='Cambiar'>Cambiar contraseña</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RecuperarModal;