import React from 'react';
import styles from './tabsFiltro.module.css';

function TabsFiltro({ tabs, activeTab, onTabClick }) {
    return (
        <div>
            <h3 className={styles.tabsTitle}>Secciones principales</h3>
            <div className={styles.tabsContainer}>
                {tabs.map(tab => (
                    <button
                    key={tab.key}
                    className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
                    onClick={() => onTabClick(tab)}
                    type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TabsFiltro;