import styles from './bitacoraModal.module.css';

function BitacoraModal({ registro, onClose }) {
    if (!registro) return null;

    const etiquetas = {
        cedula: 'Cédula',
        nombre: 'Nombre',
        contacto: 'Contacto',
        apellido: 'Apellido',
        inspeccion: 'Inspeccion',
        laboratorio: 'Laboratorio',
        empleado_id: 'Empleado',
        cargo_id: 'Cargo',
        tipo_usuario_id: 'Tipo de Usuario',
        email: 'Correo',
        username: 'Usuario',
        cultivo_id: 'Cultivo',
    };

    // Filtrar los datos nuevos para excluir los campos no deseados
    const datosNuevos = registro.dato?.nuevos
        ? Object.fromEntries(
            Object.entries(registro.dato.nuevos).filter(
                ([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'estado' && key !== 'password' && key !== 'empleado_id'
            )
        )
        : {};

    // Filtrar los datos antiguos para excluir los campos no deseados
    const datosAntiguos = registro.dato?.antiguos
        ? Object.fromEntries(
            Object.entries(registro.dato.antiguos).filter(
                ([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'estado' && key !== 'password' && key !== 'empleado_id'
            )
        )
        : {};

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Detalles del Registro</h2>
                {/* <p><strong>Fecha:</strong> {registro.fecha || 'No disponible'}</p> */}
                {/* <p><strong>Acción:</strong> {registro.accion || 'No disponible'}</p> */}
                {/* <p><strong>Tabla:</strong> {registro.tabla || 'No disponible'}</p> */}
                <p><strong>Usuario:</strong> {registro.usuario || 'No disponible'}</p>
                <p><strong>Descripción:</strong> {registro.descripcion || 'No disponible'}</p>
                <h3>Datos Antiguos:</h3>
                {Object.keys(datosAntiguos).length > 0 ? (
                    <ul>
                        {Object.entries(datosAntiguos).map(([key, value]) => (
                            <li key={key}><strong>{etiquetas[key] || key}:</strong> {value}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay datos antiguos disponibles.</p>
                )}
                <h3>Datos Nuevos:</h3>
                {Object.keys(datosNuevos).length > 0 ? (
                    <ul>
                        {Object.entries(datosNuevos).map(([key, value]) => (
                            <li key={key}><strong>{etiquetas[key] || key}:</strong> {value}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay datos nuevos disponibles.</p>
                )}
                <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
            </div>
        </div>
    );
}

export default BitacoraModal;