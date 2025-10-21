import '../../main.css';

function BitacoraModal({ registro, onClose }) {
    if (!registro) return null;

    const etiquetas = {
        cedula: 'Cédula',
        nombre: 'Nombres',
        contacto: 'Numero de Contacto',
        apellido: 'Apellidos',
        inspeccion: 'Inspección',
        laboratorio: 'Laboratorio',
        empleado_id: 'Empleado',
        cargo_id: 'Cargo',
        roles_id: 'Tipo de Usuario',
        email: 'Correo',
        username: 'Usuario',
        cultivo_id: 'Cultivo',
        tipo_cultivo_id: 'Tipo de Cultivo',
        nombre_cientifico: 'Nombre Científico',
        tipo_plaga_fito_id: 'Tipo de Plaga',
        observaciones: 'Observaciones',
        tipo_programa_fito_id: 'Tipo de Programa',
        plaga_fito_id: 'Plaga',
        tiempo_duracion: 'Tiempo de Duraciòn',
        parroquia_id: 'Parroquia',
        municipio_id: 'Municipio',
        estado_id: 'Estado',
        sector_id: 'Sector',
        hora_inspeccion: 'Hora de Inspección',
        n_control: 'Número de Control',
        cedula_res: 'Cédula del Responsable que atiende',
        tlf:'Telefono',
        area:'Area',
        este:'Este',
        norte:'Norte',
        zona:'Zona',
        correo:'Correo',
        aspectos:'Aspectos',
        finalidad1:'Finaidad Fitosanitaria',
        finalidad2:'Finaidad Zoosanitaria',
        finalidad3:'Finaidad Agroecológica',
        finalidad4:'Finaidad de Movilización',
        finalidad5:'Finaidad de Buenas Prácticas',
        finalidad6:'Otra Finaidad',
        propiedad: 'Propiedad',
        ordenamientos: 'Ordenamientos',
        responsable_e:'Responsable Encargado',
        aplica_programa: 'Aplica Programa',
        fecha_inspeccion: 'Fecha de Inspección',
        codigo_inspeccion: 'Codigo de Inspección',
        fecha_notificacion: 'Fecha de Notificación',
        tipo_inspeccion_fito_id: 'Tipo de Inspección',
        fecha_proxima_inspeccion: 'Fecha de la proxima Inspección',
        empleados_ids: 'Empleados Responsables',
        programas_ids: 'Programas Aplicados',
        rif: 'Rif',
        c_cultivo: 'Cantidad de Cultivos',
        Hectareas: 'Hectareas',
        ubicación: 'Ubicación',
        productor_id: 'Productor Asociado',
        sitios_asociados:'Sitios Asociados',
        tipo_propiedad_id: 'Tipo de Propiedad',
        plaga_fito_ids: 'Plagas Asociadas',
        descripcion:'Descripción',
        avatar_imagen: 'Avatar',
    

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
            <div className="modal">
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