import { BaseUrl } from './constans';
import axios from 'axios';

export async function getPrimerImagenEmpleado(empleadoId) {
    const res = await axios.get(`${BaseUrl}/empleados/imagenes/${empleadoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const imagenes = res.data;
    if (imagenes.length === 0) return null;
    // Toma la primera imagen del array
    return `${BaseUrl}/uploads/empleados/${imagenes[0].imagen}`;
}