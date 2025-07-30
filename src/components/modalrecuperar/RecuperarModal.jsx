import React, { useState } from 'react';
import '../../main.css';
import Spinner from '../spinner/Spinner';
import { useNotification } from '../../utils/NotificationContext';

function RecuperarModal({ onClose }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/solicitar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(data.message, 'success');
                setStep(2);
            } else {
                addNotification(data.message, 'error');
            }
        } catch {
            addNotification('Error enviando el código', 'error');
        }
        setLoading(false);
    };

    // Paso 2: Verificar código
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(data.message, 'success');
                setStep(3);
            } else {
                addNotification(data.message, 'error');
            }
        } catch {
            addNotification('Error verificando el código', 'error');
        }
        setLoading(false);
    };

    // Paso 3: Cambiar contraseña
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/recuperacion/cambiar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(data.message, 'success');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                addNotification(data.message, 'error');
            }
        } catch {
            addNotification('Error cambiando la contraseña', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="modalOverlay">
            <div className="modal_mono">
                <button className="closeButton" onClick={onClose}>&times;</button>
                <h2>Recuperar Contraseña</h2>
                {loading && <Spinner text="Procesando..." />}
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