export const validateField = (value, regex, errorMessage) => {
    // Si el valor no es string, no lo valides aquí (deja que el handleSave lo valide)
    if (typeof value !== 'string') return { valid: true, message: '' };
    if (!value.trim()) {
        return { valid: false, message: 'No Puede Dejar El Campo Vacío' };
    }
    if (typeof value === 'string' && value.length > 40) {
        return { valid: false, message: 'No puede ingresar más de 40 caracteres' };
    }
    // if (!regex.test(value)) {
    //     return { valid: false, message: 'El formato ingresado no es válido' };
    // }
    if (!regex.test(value)) {
        return { valid: false, message: errorMessage };
    }
    return { valid: true, message: '' };
};

export const campos = [
    { id: 'nombre_propiedad', tipo: 'letras' },
    { id: 'rif', tipo: 'rif' },
    {id: 'sitios_asociados', tipo: 'codigo'},
    {id: 'ubicación', tipo: 'codigo'},
];

// Función para obtener la regla de validación por campo
export const getValidationRule = (field) => {
    // Busca el campo en el arreglo campos
    const campo = campos.find(c => c.id === field);
    if (campo && validationRules[campo.tipo]) {
        return validationRules[campo.tipo];
    }
    // Si no está en campos, busca si hay una regla directa
    if (validationRules[field]) {
        return validationRules[field];
    }
    return null;
};

export const validationRules = {
    cedula: {
        regex: /^(V-|E-)?\d{7,8}$/, // Ejemplo: V-12345678, E-12345678, 12345678
        errorMessage: 'La cédula debe tener 7 u 8 dígitos, con o sin prefijo V- o E-'
    },
    nuevo: {
        regex: /^[VJEGP]-\d{8}-\d$/,
        errorMessage: 'El RIF debe tener el formato: V-12345678-9, J-12345678-9, E-12345678-9, G-12345678-9 o P-12345678-9'
    },
    rif: {
        regex: /^[VJEGP]-\d{8}-\d$/,
        errorMessage: 'El RIF debe tener el formato: V-12345678-9, J-12345678-9, E-12345678-9, G-12345678-9 o P-12345678-9'
    },
    nombre: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        errorMessage: 'El nombre solo puede contener letras y espacios'
    },
    apellido: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        errorMessage: 'El apellido solo puede contener letras y espacios'
    },
    contacto: {
        regex: /^04\d{2}-\d{7}$/, // Ejemplo: 0412-1234567
        errorMessage: 'El contacto debe tener el formato 04XX-XXXXXXX'
    },
    profesion: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
        errorMessage: 'La profesión solo puede contener letras y espacios'
    },
    email: {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Formato de correo válido
        errorMessage: 'El correo debe tener un formato válido, por ejemplo: usuario@dominio.com'
    },
    username: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.()%+@#,!;:]+$/,
        errorMessage: 'Debe colocar un nombre de usuario válido'
    },
    letras: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ-]+$/,
        errorMessage: 'Solo se permiten letras, guiones y sin espacios'
    },
    codigo: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ-]+$/,
        errorMessage: 'Debe escribir un formato válido'
    },
    numeros: {
        regex: /^\d+$/,
        errorMessage: 'Solo se permiten números'
    },
    fecha: {
        regex: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
        errorMessage: 'La fecha debe tener el formato dd/mm/yyyy'
    },
    direccion: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#.,-]+$/,
        errorMessage: 'La dirección solo puede contener letras, números y los símbolos # . , -'
    },
    password: {
        // regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        regex: /^.{6,}$/,
        errorMessage: 'La contraseña debe tener al menos 6 caracteres'
    },
    confirmarpassword: {
        validate: (value, originalPassword) => {
            if (!value.trim()) {
                return { valid: false, message: 'Debe confirmar la contraseña' };
            }
            if (value !== originalPassword) {
                return { valid: false, message: 'Las contraseñas no coinciden' };
            }
            return { valid: true, message: '' };
        }
    }
};