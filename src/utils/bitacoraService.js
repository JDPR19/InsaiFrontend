import axios from 'axios';

const BASE_URL = 'http://localhost:4000/bitacora'; 

/**
 * Registrar inicio de sesión en la bitácora.
 * @param {number} userId - ID del usuario.
 * @param {string} username - Nombre del usuario.
 */
export const registrarInicioSesion = (userId, username) => {
    axios.post(`${BASE_URL}/inicio-sesion`, { usuario: username, usuario_id: userId }) // Enviar ambos campos
        .then(() => {
            console.log(`Inicio de sesión registrado para el usuario con ID: ${userId}`);
        })
        .catch((error) => {
            console.error('Error al registrar inicio de sesión:', error);
        });
};

/**
 * Registrar cierre de sesión en la bitácora.
 * @param {number} userId - ID del usuario.
 * @param {string} username - Nombre del usuario.
 */
export const registrarCierreSesion = (userId, username) => {
    axios.post(`${BASE_URL}/cierre-sesion`, { usuario: username, usuario_id: userId }) // Enviar ambos campos
        .then(() => {
            console.log(`Cierre de sesión registrado para el usuario con ID: ${userId}`);
        })
        .catch((error) => {
            console.error('Error al registrar cierre de sesión:', error);
        });
};


