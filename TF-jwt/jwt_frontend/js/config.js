// Configuración de la aplicación
const CONFIG = {
    // URL base de la API
    API_BASE_URL: 'http://localhost:8080',
    
    // Endpoints de la API
    ENDPOINTS: {
        // Autenticación
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        
        // Usuarios
        USERS: '/api/users',
        
        // Roles
        ROLES: '/api/roles',
        
        // Permisos
        PERMISSIONS: '/api/permissions',
        
        // Alumnos
        ALUMNOS: '/api/alumnos',
        ALUMNOS_ACTIVOS: '/api/alumnos/activos',
        ALUMNOS_BY_DNI: '/api/alumnos/dni',
        ALUMNOS_BY_EMAIL: '/api/alumnos/email',
        ALUMNOS_BY_CURSO: '/api/alumnos/curso',
        ALUMNOS_SEARCH: '/api/alumnos/buscar',
        ALUMNOS_ACTIVAR: '/api/alumnos/{id}/activar',
        ALUMNOS_DESACTIVAR: '/api/alumnos/{id}/desactivar',
        ALUMNOS_INSCRIBIR: '/api/alumnos/{alumnoId}/cursos/{cursoId}',
        ALUMNOS_DESINSCRIBIR: '/api/alumnos/{alumnoId}/cursos/{cursoId}',
        ALUMNOS_CURSOS: '/api/alumnos/{id}/cursos',
        
        // Cursos
        CURSOS: '/api/cursos',
        CURSOS_ACTIVOS: '/api/cursos/activos',
        CURSOS_ACTIVOS_CON_ALUMNOS: '/api/cursos/activos/con-alumnos',
        CURSOS_BY_NOMBRE: '/api/cursos/nombre',
        CURSOS_BY_INSTRUCTOR: '/api/cursos/instructor',
        CURSOS_BY_FECHA_RANGE: '/api/cursos/fechas',
        CURSOS_ACTIVAR: '/api/cursos/{id}/activar',
        CURSOS_DESACTIVAR: '/api/cursos/{id}/desactivar',
        CURSOS_ALUMNOS: '/api/cursos/{id}/alumnos',
        CURSOS_AGREGAR_ALUMNO: '/api/cursos/{cursoId}/alumnos/{alumnoId}',
        CURSOS_REMOVER_ALUMNO: '/api/cursos/{cursoId}/alumnos/{alumnoId}',
        
        // OAuth2
        OAUTH2_GOOGLE: '/oauth2/authorization/google',
        GITHUB_OAUTH: '/oauth2/authorization/github',
        GITHUB_CALLBACK: '/auth/github/callback',
        
        // Hello World
        HELLO: '/hello',
        HELLO_SECURED: '/hello-secured'
    },
    
    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'jwt_token',
        USER_KEY: 'user_info',
        TOKEN_EXPIRY_KEY: 'token_expiry'
    },
    
    // Configuración de UI
    UI: {
        TOAST_DURATION: 5000,
        LOADING_DELAY: 300,
        PAGINATION_SIZE: 10
    },
    
    // Mensajes de la aplicación
    MESSAGES: {
        SUCCESS: {
            LOGIN: 'Inicio de sesión exitoso',
            LOGOUT: 'Sesión cerrada correctamente',
            ALUMNO_CREATED: 'Alumno creado exitosamente',
            ALUMNO_UPDATED: 'Alumno actualizado exitosamente',
            ALUMNO_DELETED: 'Alumno eliminado exitosamente',
            ALUMNO_ACTIVATED: 'Alumno activado exitosamente',
            ALUMNO_DEACTIVATED: 'Alumno desactivado exitosamente',
            CURSO_CREATED: 'Curso creado exitosamente',
            CURSO_UPDATED: 'Curso actualizado exitosamente',
            CURSO_DELETED: 'Curso eliminado exitosamente',
            CURSO_ACTIVATED: 'Curso activado exitosamente',
            CURSO_DEACTIVATED: 'Curso desactivado exitosamente',
            INSCRIPCION_SUCCESS: 'Inscripción realizada exitosamente',
            DESINSCRIPCION_SUCCESS: 'Desinscripción realizada exitosamente'
        },
        ERROR: {
            LOGIN_FAILED: 'Error en el inicio de sesión. Verifique sus credenciales.',
            NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
            UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
            FORBIDDEN: 'Acceso denegado.',
            NOT_FOUND: 'Recurso no encontrado.',
            SERVER_ERROR: 'Error interno del servidor.',
            VALIDATION_ERROR: 'Error de validación en los datos.',
            ALUMNO_EXISTS: 'Ya existe un alumno con ese DNI o email.',
            CURSO_EXISTS: 'Ya existe un curso con ese nombre.',
            INSCRIPCION_EXISTS: 'El alumno ya está inscrito en este curso.',
            INSCRIPCION_NOT_EXISTS: 'El alumno no está inscrito en este curso.',
            GENERIC_ERROR: 'Ha ocurrido un error inesperado.'
        },
        CONFIRM: {
            DELETE_ALUMNO: '¿Está seguro de que desea eliminar este alumno?',
            DELETE_CURSO: '¿Está seguro de que desea eliminar este curso?',
            DEACTIVATE_ALUMNO: '¿Está seguro de que desea desactivar este alumno?',
            DEACTIVATE_CURSO: '¿Está seguro de que desea desactivar este curso?',
            DESINSCRIBIR: '¿Está seguro de que desea desinscribir al alumno de este curso?'
        }
    },
    
    // Configuración de validación
    VALIDATION: {
        DNI_PATTERN: /^\d{7,8}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/,
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 50,
        DESCRIPTION_MAX_LENGTH: 500,
        ADDRESS_MAX_LENGTH: 200
    },
    
    // Estados de la aplicación
    STATUS: {
        LOADING: 'loading',
        SUCCESS: 'success',
        ERROR: 'error',
        IDLE: 'idle'
    }
};

// Función para construir URLs completas
function buildUrl(endpoint, params = {}) {
    let url = CONFIG.API_BASE_URL + endpoint;
    
    // Reemplazar parámetros en la URL
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });
    
    return url;
}

// Función para obtener headers de autenticación
function getAuthHeaders() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    const expiry = localStorage.getItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) {
        return false;
    }
    
    // Verificar si el token ha expirado
    const now = new Date().getTime();
    const expiryTime = parseInt(expiry);
    
    if (now > expiryTime) {
        // Token expirado, limpiar storage
        localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH.USER_KEY);
        localStorage.removeItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY);
        return false;
    }
    
    return true;
}

// Función para formatear fechas
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Función para formatear fecha y hora
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
}

// Función para validar email
function isValidEmail(email) {
    return CONFIG.VALIDATION.EMAIL_PATTERN.test(email);
}

// Función para validar DNI
function isValidDNI(dni) {
    return CONFIG.VALIDATION.DNI_PATTERN.test(dni);
}

// Función para validar teléfono
function isValidPhone(phone) {
    return CONFIG.VALIDATION.PHONE_PATTERN.test(phone);
}

// Función para capitalizar texto
function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para truncar texto
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Función para debounce (evitar múltiples llamadas rápidas)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar configuración para uso global
window.CONFIG = CONFIG;
window.buildUrl = buildUrl;
window.getAuthHeaders = getAuthHeaders;
window.isAuthenticated = isAuthenticated;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.isValidEmail = isValidEmail;
window.isValidDNI = isValidDNI;
window.isValidPhone = isValidPhone;
window.capitalize = capitalize;
window.truncateText = truncateText;
window.debounce = debounce;

