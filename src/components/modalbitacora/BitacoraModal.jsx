import '../../main.css';

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
        roles_id: 'Tipo de Usuario',
        email: 'Correo',
        username: 'Usuario',
        cultivo_id: 'Cultivo',
        tipo_cultivo_id: 'Tipo de Cultivo',
        nombre_cientifico: 'Nombre Cientifico',
        tipo_plaga_fito_id: 'Tipo de Plaga',
        observaciones: 'Observaciones',
        tipo_programa_fito_id: 'Tipo de Programa',
        plaga_fito_id: 'Plaga',
        tiempo_duracion: 'Tiempo de Duraciòn',
        parroquia_id: 'Parroquia',
        municipio_id: 'Municipio',
        estado_id: 'Estado',
        sector_id: 'Sector',
    };

    const datosNuevos = registro.dato?.nuevos
        ? Object.fromEntries(
            Object.entries(registro.dato.nuevos).filter(
                ([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'estado' && key !== 'password' && key !== 'empleado_id'
            )
        )
        : {};

    const datosAntiguos = registro.dato?.antiguos
        ? Object.fromEntries(
            Object.entries(registro.dato.antiguos).filter(
                ([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'estado' && key !== 'password' && key !== 'empleado_id'
            )
        )
        : {};

    return (
        <div className="modalOverlay">
            <div className="modalDetalle">
                <button className="closeButton" onClick={onClose}>&times;</button>
                <h2>Detalles del Registro</h2>
                <table className="detalleTable">
                    <tbody>
                        <tr>
                            <th>Fecha</th>
                            <td>{registro.fecha || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Acción</th>
                            <td>{registro.accion || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Tabla</th>
                            <td>{registro.tabla || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Usuario</th>
                            <td>{registro.usuario || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Descripción</th>
                            <td>{registro.descripcion || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Datos Antiguos</th>
                            <td>
                                {Object.keys(datosAntiguos).length > 0 ? (
                                    <ul>
                                        {Object.entries(datosAntiguos).map(([key, value]) => (
                                            <li key={key}><strong>{etiquetas[key] || key}:</strong> {value}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>No hay datos antiguos disponibles.</span>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <th>Datos Nuevos</th>
                            <td>
                                {Object.keys(datosNuevos).length > 0 ? (
                                    <ul>
                                        {Object.entries(datosNuevos).map(([key, value]) => (
                                            <li key={key}><strong>{etiquetas[key] || key}:</strong> {value}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>No hay datos nuevos disponibles.</span>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BitacoraModal;