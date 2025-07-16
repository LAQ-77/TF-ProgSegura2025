// Módulo de API para manejar todas las llamadas HTTP
class ApiManager {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
    }

    // Método genérico para realizar peticiones HTTP
    async request(endpoint, options = {}) {
        const url = buildUrl(endpoint, options.params || {});
        const config = {
            method: options.method || 'GET',
            headers: getAuthHeaders(),
            ...options
        };

        // Agregar body si existe y no es GET
        if (options.body && config.method !== 'GET') {
            config.body = typeof options.body === 'string' 
                ? options.body 
                : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Manejar diferentes tipos de respuesta
            if (response.status === 204) {
                // No Content
                return { success: true };
            }
            
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (response.ok) {
                return { success: true, data };
            } else {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`API Error [${config.method} ${url}]:`, error);
            throw this.handleError(error);
        }
    }

    // Manejar errores de API
    handleError(error) {
        if (error.message.includes('fetch')) {
            return new Error(CONFIG.MESSAGES.ERROR.NETWORK_ERROR);
        }
        
        if (error.message.includes('401')) {
            return new Error(CONFIG.MESSAGES.ERROR.UNAUTHORIZED);
        }
        
        if (error.message.includes('403')) {
            return new Error(CONFIG.MESSAGES.ERROR.FORBIDDEN);
        }
        
        if (error.message.includes('404')) {
            return new Error(CONFIG.MESSAGES.ERROR.NOT_FOUND);
        }
        
        if (error.message.includes('409')) {
            return new Error(CONFIG.MESSAGES.ERROR.VALIDATION_ERROR);
        }
        
        if (error.message.includes('500')) {
            return new Error(CONFIG.MESSAGES.ERROR.SERVER_ERROR);
        }
        
        return error;
    }

    // ==================== MÉTODOS DE ALUMNOS ====================
    
    // Obtener todos los alumnos
    async getAllAlumnos() {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS);
    }

    // Obtener alumnos activos
    async getActivosAlumnos() {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_ACTIVOS);
    }

    // Obtener alumno por ID
    async getAlumnoById(id) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS + `/${id}`);
    }

    // Obtener alumno por DNI
    async getAlumnoByDni(dni) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_BY_DNI + `/${dni}`);
    }

    // Obtener alumno por email
    async getAlumnoByEmail(email) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_BY_EMAIL + `/${email}`);
    }

    // Buscar alumnos por término
    async searchAlumnos(termino) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_SEARCH + `/${termino}`);
    }

    // Obtener alumnos por curso
    async getAlumnosByCurso(cursoId) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_BY_CURSO + `/${cursoId}`);
    }

    // Crear alumno
    async createAlumno(alumno) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS, {
            method: 'POST',
            body: alumno
        });
    }

    // Actualizar alumno
    async updateAlumno(id, alumno) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS + `/${id}`, {
            method: 'PUT',
            body: alumno
        });
    }

    // Eliminar alumno
    async deleteAlumno(id) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS + `/${id}`, {
            method: 'DELETE'
        });
    }

    // Activar alumno
    async activarAlumno(id) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_ACTIVAR, {
            method: 'PATCH',
            params: { id }
        });
    }

    // Desactivar alumno
    async desactivarAlumno(id) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_DESACTIVAR, {
            method: 'PATCH',
            params: { id }
        });
    }

    // Inscribir alumno en curso
    async inscribirAlumnoEnCurso(alumnoId, cursoId) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_INSCRIBIR, {
            method: 'POST',
            params: { alumnoId, cursoId }
        });
    }

    // Desinscribir alumno de curso
    async desinscribirAlumnoDeCurso(alumnoId, cursoId) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_DESINSCRIBIR, {
            method: 'DELETE',
            params: { alumnoId, cursoId }
        });
    }

    // Obtener cursos de un alumno
    async getCursosDeAlumno(alumnoId) {
        return await this.request(CONFIG.ENDPOINTS.ALUMNOS_CURSOS, {
            params: { id: alumnoId }
        });
    }

    // ==================== MÉTODOS DE CURSOS ====================
    
    // Obtener todos los cursos
    async getAllCursos() {
        return await this.request(CONFIG.ENDPOINTS.CURSOS);
    }

    // Obtener cursos activos
    async getActivosCursos() {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_ACTIVOS);
    }

    // Obtener cursos activos con alumnos
    async getActivosCursosConAlumnos() {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_ACTIVOS_CON_ALUMNOS);
    }

    // Obtener curso por ID
    async getCursoById(id) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS + `/${id}`);
    }

    // Obtener curso por nombre
    async getCursoByNombre(nombre) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_BY_NOMBRE + `/${nombre}`);
    }

    // Obtener cursos por instructor
    async getCursosByInstructor(instructor) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_BY_INSTRUCTOR + `/${instructor}`);
    }

    // Obtener cursos por rango de fechas
    async getCursosByFechaRange(fechaInicio, fechaFin) {
        const params = new URLSearchParams({
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        });
        return await this.request(CONFIG.ENDPOINTS.CURSOS_BY_FECHA_RANGE + `?${params}`);
    }

    // Crear curso
    async createCurso(curso) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS, {
            method: 'POST',
            body: curso
        });
    }

    // Actualizar curso
    async updateCurso(id, curso) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS + `/${id}`, {
            method: 'PUT',
            body: curso
        });
    }

    // Eliminar curso
    async deleteCurso(id) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS + `/${id}`, {
            method: 'DELETE'
        });
    }

    // Activar curso
    async activarCurso(id) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_ACTIVAR, {
            method: 'PATCH',
            params: { id }
        });
    }

    // Desactivar curso
    async desactivarCurso(id) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_DESACTIVAR, {
            method: 'PATCH',
            params: { id }
        });
    }

    // Obtener alumnos de un curso
    async getAlumnosDeCurso(cursoId) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_ALUMNOS, {
            params: { id: cursoId }
        });
    }

    // Agregar alumno a curso
    async agregarAlumnoACurso(cursoId, alumnoId) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_AGREGAR_ALUMNO, {
            method: 'POST',
            params: { cursoId, alumnoId }
        });
    }

    // Remover alumno de curso
    async removerAlumnoDeCurso(cursoId, alumnoId) {
        return await this.request(CONFIG.ENDPOINTS.CURSOS_REMOVER_ALUMNO, {
            method: 'DELETE',
            params: { cursoId, alumnoId }
        });
    }

    // ==================== MÉTODOS DE USUARIOS ====================
    
    // Obtener todos los usuarios
    async getAllUsers() {
        return await this.request(CONFIG.ENDPOINTS.USERS);
    }

    // Obtener usuario por ID
    async getUserById(id) {
        return await this.request(CONFIG.ENDPOINTS.USERS + `/${id}`);
    }

    // Crear usuario
    async createUser(user) {
        return await this.request(CONFIG.ENDPOINTS.USERS, {
            method: 'POST',
            body: user
        });
    }

    // Actualizar usuario
    async updateUser(id, user) {
        return await this.request(CONFIG.ENDPOINTS.USERS + `/${id}`, {
            method: 'PUT',
            body: user
        });
    }

    // Eliminar usuario
    async deleteUser(id) {
        return await this.request(CONFIG.ENDPOINTS.USERS + `/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== MÉTODOS DE ROLES ====================
    
    // Obtener todos los roles
    async getAllRoles() {
        return await this.request(CONFIG.ENDPOINTS.ROLES);
    }

    // Obtener rol por ID
    async getRoleById(id) {
        return await this.request(CONFIG.ENDPOINTS.ROLES + `/${id}`);
    }

    // Crear rol
    async createRole(role) {
        return await this.request(CONFIG.ENDPOINTS.ROLES, {
            method: 'POST',
            body: role
        });
    }

    // Actualizar rol
    async updateRole(id, role) {
        return await this.request(CONFIG.ENDPOINTS.ROLES + `/${id}`, {
            method: 'PUT',
            body: role
        });
    }

    // Eliminar rol
    async deleteRole(id) {
        return await this.request(CONFIG.ENDPOINTS.ROLES + `/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== MÉTODOS DE PERMISOS ====================
    
    // Obtener todos los permisos
    async getAllPermissions() {
        return await this.request(CONFIG.ENDPOINTS.PERMISSIONS);
    }

    // Obtener permiso por ID
    async getPermissionById(id) {
        return await this.request(CONFIG.ENDPOINTS.PERMISSIONS + `/${id}`);
    }

    // Crear permiso
    async createPermission(permission) {
        return await this.request(CONFIG.ENDPOINTS.PERMISSIONS, {
            method: 'POST',
            body: permission
        });
    }

    // Actualizar permiso
    async updatePermission(id, permission) {
        return await this.request(CONFIG.ENDPOINTS.PERMISSIONS + `/${id}`, {
            method: 'PUT',
            body: permission
        });
    }

    // Eliminar permiso
    async deletePermission(id) {
        return await this.request(CONFIG.ENDPOINTS.PERMISSIONS + `/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== MÉTODOS DE PRUEBA ====================
    
    // Hello World sin autenticación
    async hello() {
        return await this.request(CONFIG.ENDPOINTS.HELLO);
    }

    // Hello World con autenticación
    async helloSecured() {
        return await this.request(CONFIG.ENDPOINTS.HELLO_SECURED);
    }
}

// Crear instancia global del manager de API
const apiManager = new ApiManager();

// Exportar para uso global
window.apiManager = apiManager;

