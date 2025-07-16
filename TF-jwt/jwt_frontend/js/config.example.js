// Archivo de configuración de ejemplo
// Copia este archivo como config.js y ajusta los valores según tu entorno

const CONFIG = {
    // URL base de tu API (sin la barra final)
    API_BASE_URL: 'http://localhost:8080/api',
    
    // Tiempo de expiración del token en milisegundos (24 horas por defecto)
    TOKEN_EXPIRY_TIME: 24 * 60 * 60 * 1000,
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema de Gestión - Alumnos y Cursos',
    
    // Configuración de paginación
    DEFAULT_PAGE_SIZE: 10,
    
    // Configuración de búsqueda (debounce en milisegundos)
    SEARCH_DEBOUNCE_TIME: 300,
    
    // Configuración de toasts
    TOAST_DURATION: 3000, // 3 segundos
    
    // Configuración de validación
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_NAME_LENGTH: 50,
        MAX_EMAIL_LENGTH: 100,
        DNI_LENGTH: 8
    },
    
    // Configuración de fechas
    DATE_FORMAT: 'DD/MM/YYYY',
    
    // Configuración de desarrollo
    DEBUG: false, // Cambiar a true para ver logs de debug
    
    // URLs de endpoints específicos (se construyen automáticamente)
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh'
        },
        ALUMNOS: {
            BASE: '/alumnos',
            CURSOS: '/alumnos/{id}/cursos',
            ACTIVAR: '/alumnos/{id}/activar',
            DESACTIVAR: '/alumnos/{id}/desactivar'
        },
        CURSOS: {
            BASE: '/cursos',
            ALUMNOS: '/cursos/{id}/alumnos',
            ACTIVAR: '/cursos/{id}/activar',
            DESACTIVAR: '/cursos/{id}/desactivar'
        },
        INSCRIPCIONES: {
            INSCRIBIR: '/alumnos/{alumnoId}/cursos/{cursoId}',
            DESINSCRIBIR: '/alumnos/{alumnoId}/cursos/{cursoId}'
        }
    }
};

// Función para obtener la URL completa de un endpoint
function getEndpointUrl(endpoint, params = {}) {
    let url = CONFIG.API_BASE_URL + endpoint;
    
    // Reemplazar parámetros en la URL
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });
    
    return url;
}

// Función para log de debug
function debugLog(message, data = null) {
    if (CONFIG.DEBUG) {
        console.log(`[DEBUG] ${message}`, data);
    }
}

// Exportar configuración (si usas módulos ES6)
// export { CONFIG, getEndpointUrl, debugLog };

