export const validateField = (value, regex, errorMessage) => {
    if (!value.trim()) {
        return { valid: false, message: 'Complete Todos los Campos' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: errorMessage };
    }
    return { valid: true, message: '' };
};

export const validationRules = {
    cedula: {
        regex: /^\d{7,8}$/, // Ejemplo: V-12345678
        errorMessage: 'La cédula debe tener el formato V-12345678 o E-12345678 de ser necesario'
    },
    nombre: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/, // Solo letras y espacios
        errorMessage: 'El nombre solo puede contener letras y espacios'
    },
    apellido: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
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
    cargo: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
        errorMessage: 'El cargo solo puede contener letras y espacios'
    },
    email: {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Formato de correo válido
        errorMessage: 'El correo debe tener un formato válido, por ejemplo: usuario@dominio.com'
    },
    username: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.()%+@#,!;:]+$/,
        errorMessage: 'Debe colocar un nombre de usuario válido'
    },
    // role: {
    //     regex: /^(administrador|moderador|inspector)$/, // Solo acepta estos tres valores
    //     errorMessage: 'Debe seleccionar un rol válido'
    // },
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