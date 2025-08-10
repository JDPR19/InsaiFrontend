import React, { createContext, useContext, useState } from 'react';
// Importa uuid para generar ids únicos
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type, duration = 5000) => {
        const id = uuidv4(); // Corrección: id único usando uuid
        setNotifications((prev) => [
            ...prev,
            { id, message, type, progress: 100 }
        ]);

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

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}