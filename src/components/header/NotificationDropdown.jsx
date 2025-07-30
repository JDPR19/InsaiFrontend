import TabsNotificaciones from '../../components/tabsFiltro/TabsNotificaciones';
import styles from './header.module.css';



function NotificationDropdown({ notificaciones, marcarLeida, tabActivo, setTabActivo }) {
    // Filtra las notificaciones según el tab activo
    const filtradas = tabActivo === 'no-leidas'
        ? notificaciones.filter(n => !n.leida)
        : notificaciones;

    const tabsNotificaciones = [
        { key: 'todas', label: 'Todas' },
        { key: 'no-leidas', label: 'No leídas' }
    ];
    return (
        <div className={styles.dropdown}>
            <h4>Notificaciones</h4>
            <TabsNotificaciones
                tabs={tabsNotificaciones}
                activeTab={tabActivo}
                onTabClick={setTabActivo}
            />
            {filtradas.length === 0 && (
                <div className={styles.empty}>Sin notificaciones</div>
            )}
            {filtradas.map(n => (
                <div
                    key={n.id}
                    className={`${styles.notificacionItem} ${n.leida ? styles.leida : ''}`}
                    onClick={() => marcarLeida(n.id)}
                >
                    {n.mensaje}
                    <span className={styles.fecha}>
                        {new Date(n.created_at).toLocaleString('es-VE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </span>
                    {!n.leida && <span className={styles.nueva}>●</span>}
                </div>
            ))}
        </div>
    );
}

export default NotificationDropdown;