import React from 'react';
import Notification from './Notification';
import styles from './notification.module.css';

function NotificationContainer({ notifications, removeNotification }) {
    return (
        <div className={styles.notificationContainer}>
            {notifications.map((notification, idx) => (
                <Notification
                    key={`${notification.id}-${idx}`} 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                    progress={notification.progress}
                />
            ))}
        </div>
    );
}

export default NotificationContainer;