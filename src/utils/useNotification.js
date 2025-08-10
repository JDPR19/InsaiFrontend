import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Importa uuid para ids únicos

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type, duration = 8000) => {
        const id = uuidv4(); 
        setNotifications((prev) => [
            ...prev,
            { id, message, type, progress: 100 }
        ]);

        // Barra de progreso animada
        let progress = 100;
        const interval = setInterval(() => {
            progress -= 100 / (duration / 100);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, progress: Math.max(progress, 0) } : n
                )
            );
        }, 100);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            clearInterval(interval);
        }, duration);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return { notifications, addNotification, removeNotification };
};