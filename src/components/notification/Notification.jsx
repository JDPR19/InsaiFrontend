import React from 'react';
import styles from './notification.module.css';

function Notification({ message, type, onClose, progress }) {
    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <p>{message}</p>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <button className={styles.closeButton} onClick={onClose}>
                &times;
            </button>
        </div>
    );
}

export default Notification;