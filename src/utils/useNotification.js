import { useState } from 'react';

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type) => {
        const id = Date.now(); // Generar un ID único
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Eliminar la notificación después de 3 segundos
        setTimeout(() => {
            setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        }, 3000);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    };

    return { notifications, addNotification, removeNotification };
};