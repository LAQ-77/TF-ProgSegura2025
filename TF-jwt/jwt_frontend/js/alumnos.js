// Módulo de gestión de alumnos
class AlumnosManager {
    constructor() {
        this.alumnos = [];
        this.filteredAlumnos = [];
        this.currentAlumno = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulario de alumno
        const alumnoForm = document.getElementById('alumnoForm');
        if (alumnoForm) {
            alumnoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Búsqueda de alumnos
        const searchInput = document.getElementById('searchAlumno');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => this.handleSearch(e.target.value), 300));
        }

        // Filtro por estado
        const filterEstado = document.getElementById('filterAlumnoEstado');
        if (filterEstado) {
            filterEstado.addEventListener('change', (e) => this.handleFilter(e.target.value));
        }
    }

    // Configurar validación del formulario
    setupFormValidation() {
        const form = document.getElementById('alumnoForm');
        if (!form) return;

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Validar campo individual
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.name) {
            case 'dni':
                if (!isValidDNI(value)) {
                    isValid = false;
                    errorMessage = 'DNI debe tener 7 u 8 dígitos';
                }
                break;
            case 'email':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Email debe tener un formato válido';
                }
                break;
            case 'telefono':
                if (value && !isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Teléfono debe contener solo números, espacios y guiones';
                }
                break;
            case 'nombre':
            case 'apellido':
                if (value.length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
                    isValid = false;
                    errorMessage = `Debe tener al menos ${CONFIG.VALIDATION.NAME_MIN_LENGTH} caracteres`;
                }
                break;
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    // Mostrar error en campo
    showFieldError(field, isValid, message) {
        field.classList.toggle('error', !isValid);
        
        // Remover mensaje de error previo
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Agregar nuevo mensaje de error si es necesario
        if (!isValid && message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '12px';
            errorDiv.style.marginTop = '5px';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }

    // Limpiar error de campo
    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // ==================== OPERACIONES CRUD ====================

    // Cargar todos los alumnos
    async loadAlumnos() {
        try {
            showLoading(true);
            const response = await apiManager.getAllAlumnos();
            
            if (response.success) {
                this.alumnos = response.data || [];
                this.filteredAlumnos = [...this.alumnos];
                this.updateTable();
                this.updateSelectores();
            } else {
                throw new Error('Error al cargar alumnos');
            }
        } catch (error) {
            console.error('Error loading alumnos:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Crear nuevo alumno
    async createAlumno(alumnoData) {
        try {
            showLoading(true);
            const response = await apiManager.createAlumno(alumnoData);
            
            if (response.success) {
                showToast(CONFIG.MESSAGES.SUCCESS.ALUMNO_CREATED, 'success');
                hideModal('alumnoModal');
                await this.loadAlumnos();
                return true;
            } else {
                throw new Error('Error al crear alumno');
            }
        } catch (error) {
            console.error('Error creating alumno:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('409') || error.message.includes('Conflict')) {
                errorMessage = CONFIG.MESSAGES.ERROR.ALUMNO_EXISTS;
            }
            
            showToast(errorMessage, 'error');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Actualizar alumno
    async updateAlumno(id, alumnoData) {
        try {
            showLoading(true);
            const response = await apiManager.updateAlumno(id, alumnoData);
            
            if (response.success) {
                showToast(CONFIG.MESSAGES.SUCCESS.ALUMNO_UPDATED, 'success');
                hideModal('alumnoModal');
                await this.loadAlumnos();
                return true;
            } else {
                throw new Error('Error al actualizar alumno');
            }
        } catch (error) {
            console.error('Error updating alumno:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('409') || error.message.includes('Conflict')) {
                errorMessage = CONFIG.MESSAGES.ERROR.ALUMNO_EXISTS;
            }
            
            showToast(errorMessage, 'error');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Eliminar alumno
    async deleteAlumno(id) {
        const alumno = this.alumnos.find(a => a.id === id);
        if (!alumno) return;

        uiManager.confirm(
            `${CONFIG.MESSAGES.CONFIRM.DELETE_ALUMNO}\n\nAlumno: ${alumno.nombre} ${alumno.apellido}`,
            async () => {
                try {
                    showLoading(true);
                    const response = await apiManager.deleteAlumno(id);
                    
                    if (response.success) {
                        showToast(CONFIG.MESSAGES.SUCCESS.ALUMNO_DELETED, 'success');
                        await this.loadAlumnos();
                    } else {
                        throw new Error('Error al eliminar alumno');
                    }
                } catch (error) {
                    console.error('Error deleting alumno:', error);
                    showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
                } finally {
                    showLoading(false);
                }
            }
        );
    }

    // Cambiar estado del alumno (activar/desactivar)
    async toggleStatus(id, activate) {
        const alumno = this.alumnos.find(a => a.id === id);
        if (!alumno) return;

        const action = activate ? 'activar' : 'desactivar';
        const confirmMessage = activate ? 
            `¿Está seguro de que desea activar al alumno ${alumno.nombre} ${alumno.apellido}?` :
            `${CONFIG.MESSAGES.CONFIRM.DEACTIVATE_ALUMNO}\n\nAlumno: ${alumno.nombre} ${alumno.apellido}`;

        uiManager.confirm(confirmMessage, async () => {
            try {
                showLoading(true);
                const response = activate ? 
                    await apiManager.activarAlumno(id) : 
                    await apiManager.desactivarAlumno(id);
                
                if (response.success) {
                    const message = activate ? 
                        CONFIG.MESSAGES.SUCCESS.ALUMNO_ACTIVATED : 
                        CONFIG.MESSAGES.SUCCESS.ALUMNO_DEACTIVATED;
                    showToast(message, 'success');
                    await this.loadAlumnos();
                } else {
                    throw new Error(`Error al ${action} alumno`);
                }
            } catch (error) {
                console.error(`Error ${action} alumno:`, error);
                showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
            } finally {
                showLoading(false);
            }
        });
    }

    // ==================== MANEJO DE FORMULARIOS ====================

    // Manejar envío del formulario
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = uiManager.getFormData('alumnoForm');
        const alumnoId = document.getElementById('alumnoId').value;
        
        // Validar formulario
        const validation = this.validateAlumnoForm(formData);
        if (!validation.valid) {
            showToast(validation.errors.join('\n'), 'error');
            return;
        }

        // Crear o actualizar
        const success = alumnoId ? 
            await this.updateAlumno(alumnoId, formData) : 
            await this.createAlumno(formData);
    }

    // Validar formulario de alumno
    validateAlumnoForm(data) {
        const rules = {
            nombre: { required: true, label: 'Nombre', minLength: 2, maxLength: 50 },
            apellido: { required: true, label: 'Apellido', minLength: 2, maxLength: 50 },
            dni: { required: true, label: 'DNI', pattern: CONFIG.VALIDATION.DNI_PATTERN },
            email: { required: true, label: 'Email', pattern: CONFIG.VALIDATION.EMAIL_PATTERN },
            fechaNacimiento: { required: true, label: 'Fecha de Nacimiento' },
            telefono: { pattern: CONFIG.VALIDATION.PHONE_PATTERN, label: 'Teléfono' },
            direccion: { maxLength: 200, label: 'Dirección' }
        };

        return uiManager.validateForm('alumnoForm', rules);
    }

    // Editar alumno
    async editAlumno(id) {
        try {
            showLoading(true);
            const response = await apiManager.getAlumnoById(id);
            
            if (response.success && response.data) {
                this.currentAlumno = response.data;
                
                // Llenar formulario
                uiManager.fillForm('alumnoForm', response.data);
                document.getElementById('alumnoId').value = id;
                document.getElementById('alumnoModalTitle').textContent = 'Editar Alumno';
                
                showModal('alumnoModal');
            } else {
                throw new Error('Alumno no encontrado');
            }
        } catch (error) {
            console.error('Error loading alumno for edit:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Preparar formulario para nuevo alumno
    newAlumno() {
        this.currentAlumno = null;
        document.getElementById('alumnoForm').reset();
        document.getElementById('alumnoId').value = '';
        document.getElementById('alumnoModalTitle').textContent = 'Nuevo Alumno';
        document.getElementById('alumnoActivo').checked = true;
        showModal('alumnoModal');
    }

    // ==================== BÚSQUEDA Y FILTROS ====================

    // Manejar búsqueda
    async handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredAlumnos = [...this.alumnos];
            this.updateTable();
            return;
        }

        try {
            showLoading(true);
            const response = await apiManager.searchAlumnos(searchTerm);
            
            if (response.success) {
                this.filteredAlumnos = response.data || [];
                this.updateTable();
            }
        } catch (error) {
            console.error('Error searching alumnos:', error);
            // En caso de error, filtrar localmente
            this.filterLocal(searchTerm);
        } finally {
            showLoading(false);
        }
    }

    // Filtrar localmente
    filterLocal(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredAlumnos = this.alumnos.filter(alumno => 
            alumno.nombre.toLowerCase().includes(term) ||
            alumno.apellido.toLowerCase().includes(term) ||
            alumno.dni.includes(term) ||
            alumno.email.toLowerCase().includes(term)
        );
        this.updateTable();
    }

    // Manejar filtro por estado
    handleFilter(estado) {
        if (!estado) {
            this.filteredAlumnos = [...this.alumnos];
        } else {
            const isActive = estado === 'true';
            this.filteredAlumnos = this.alumnos.filter(alumno => alumno.activo === isActive);
        }
        this.updateTable();
    }

    // ==================== VISUALIZACIÓN ====================

    // Ver cursos de un alumno
    async viewCursos(alumnoId) {
        try {
            showLoading(true);
            const response = await apiManager.getCursosDeAlumno(alumnoId);
            
            if (response.success) {
                const alumno = this.alumnos.find(a => a.id === alumnoId);
                const cursos = response.data || [];
                
                this.showCursosModal(alumno, cursos);
            } else {
                throw new Error('Error al cargar cursos del alumno');
            }
        } catch (error) {
            console.error('Error loading cursos for alumno:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Mostrar modal con cursos del alumno
    showCursosModal(alumno, cursos) {
        const modalHtml = `
            <div id="cursosAlumnoModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Cursos de ${alumno.nombre} ${alumno.apellido}</h3>
                        <span class="close" onclick="document.getElementById('cursosAlumnoModal').remove()">&times;</span>
                    </div>
                    <div style="padding: 25px;">
                        ${cursos.length === 0 ? 
                            '<p class="text-center"><i class="fas fa-info-circle"></i> El alumno no está inscrito en ningún curso.</p>' :
                            `<div class="inscripciones-list">
                                ${cursos.map(curso => `
                                    <div class="inscripcion-item">
                                        <div class="inscripcion-info">
                                            <strong>${curso.nombre}</strong>
                                            <small>Instructor: ${curso.instructor || 'No asignado'}</small>
                                            <small>Duración: ${curso.duracionHoras} horas</small>
                                        </div>
                                        <button class="btn btn-danger btn-sm" onclick="alumnosManager.desinscribirDeCurso(${alumno.id}, ${curso.id})">
                                            <i class="fas fa-times"></i> Desinscribir
                                        </button>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Desinscribir alumno de curso
    async desinscribirDeCurso(alumnoId, cursoId) {
        const alumno = this.alumnos.find(a => a.id === alumnoId);
        if (!alumno) return;

        uiManager.confirm(
            CONFIG.MESSAGES.CONFIRM.DESINSCRIBIR,
            async () => {
                try {
                    showLoading(true);
                    const response = await apiManager.desinscribirAlumnoDeCurso(alumnoId, cursoId);
                    
                    if (response.success) {
                        showToast(CONFIG.MESSAGES.SUCCESS.DESINSCRIPCION_SUCCESS, 'success');
                        
                        // Cerrar modal y recargar datos
                        const modal = document.getElementById('cursosAlumnoModal');
                        if (modal) modal.remove();
                        
                        await this.loadAlumnos();
                        
                        // Reabrir modal con datos actualizados
                        setTimeout(() => this.viewCursos(alumnoId), 500);
                    } else {
                        throw new Error('Error al desinscribir alumno');
                    }
                } catch (error) {
                    console.error('Error desinscribiendo alumno:', error);
                    showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
                } finally {
                    showLoading(false);
                }
            }
        );
    }

    // ==================== ACTUALIZACIÓN DE UI ====================

    // Actualizar tabla de alumnos
    updateTable() {
        uiManager.updateTable('alumnosTableBody', this.filteredAlumnos, (alumno) => 
            uiManager.createAlumnoRow(alumno)
        );
    }

    // Actualizar selectores en otras secciones
    updateSelectores() {
        // Actualizar selector de inscripciones
        const selectAlumnoInscripcion = document.getElementById('selectAlumnoInscripcion');
        const selectAlumnoVer = document.getElementById('selectAlumnoVer');
        
        if (selectAlumnoInscripcion) {
            selectAlumnoInscripcion.innerHTML = '<option value="">Seleccione un alumno...</option>' +
                this.alumnos
                    .filter(a => a.activo)
                    .map(a => `<option value="${a.id}">${a.nombre} ${a.apellido} (${a.dni})</option>`)
                    .join('');
        }
        
        if (selectAlumnoVer) {
            selectAlumnoVer.innerHTML = '<option value="">Seleccione un alumno...</option>' +
                this.alumnos
                    .filter(a => a.activo)
                    .map(a => `<option value="${a.id}">${a.nombre} ${a.apellido} (${a.dni})</option>`)
                    .join('');
        }
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    // Obtener alumno por ID
    getAlumnoById(id) {
        return this.alumnos.find(a => a.id === id);
    }

    // Obtener todos los alumnos
    getAllAlumnos() {
        return this.alumnos;
    }

    // Obtener alumnos filtrados
    getFilteredAlumnos() {
        return this.filteredAlumnos;
    }
}

// Crear instancia global del manager de alumnos
const alumnosManager = new AlumnosManager();

// Funciones globales para uso en HTML
window.searchAlumnos = function() {
    const searchTerm = document.getElementById('searchAlumno').value;
    alumnosManager.handleSearch(searchTerm);
};

window.loadAlumnos = function() {
    alumnosManager.loadAlumnos();
};

// Exportar para uso en otros módulos
window.alumnosManager = alumnosManager;

