import React from 'react';
import Notification from './Notification';
import styles from './notification.module.css';

function NotificationContainer({ notifications, removeNotification }) {
    return (
        <div className={styles.notificationContainer}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
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