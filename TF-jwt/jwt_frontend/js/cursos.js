// Módulo de gestión de cursos
class CursosManager {
    constructor() {
        this.cursos = [];
        this.filteredCursos = [];
        this.currentCurso = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulario de curso
        const cursoForm = document.getElementById('cursoForm');
        if (cursoForm) {
            cursoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Búsqueda de cursos
        const searchInput = document.getElementById('searchCurso');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => this.handleSearch(e.target.value), 300));
        }

        // Filtro por estado
        const filterEstado = document.getElementById('filterCursoEstado');
        if (filterEstado) {
            filterEstado.addEventListener('change', (e) => this.handleFilter(e.target.value));
        }

        // Validación de fechas
        const fechaInicio = document.getElementById('cursoFechaInicio');
        const fechaFin = document.getElementById('cursoFechaFin');
        
        if (fechaInicio && fechaFin) {
            fechaInicio.addEventListener('change', () => this.validateDateRange());
            fechaFin.addEventListener('change', () => this.validateDateRange());
        }
    }

    // Configurar validación del formulario
    setupFormValidation() {
        const form = document.getElementById('cursoForm');
        if (!form) return;

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input[required], textarea');
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
            case 'nombre':
                if (value.length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
                    isValid = false;
                    errorMessage = `Debe tener al menos ${CONFIG.VALIDATION.NAME_MIN_LENGTH} caracteres`;
                } else if (value.length > CONFIG.VALIDATION.NAME_MAX_LENGTH) {
                    isValid = false;
                    errorMessage = `No puede tener más de ${CONFIG.VALIDATION.NAME_MAX_LENGTH} caracteres`;
                }
                break;
            case 'descripcion':
                if (value.length > CONFIG.VALIDATION.DESCRIPTION_MAX_LENGTH) {
                    isValid = false;
                    errorMessage = `No puede tener más de ${CONFIG.VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`;
                }
                break;
            case 'duracionHoras':
                const horas = parseInt(value);
                if (isNaN(horas) || horas < 1) {
                    isValid = false;
                    errorMessage = 'Debe ser un número mayor a 0';
                } else if (horas > 1000) {
                    isValid = false;
                    errorMessage = 'No puede ser mayor a 1000 horas';
                }
                break;
            case 'instructor':
                if (value && value.length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
                    isValid = false;
                    errorMessage = `Debe tener al menos ${CONFIG.VALIDATION.NAME_MIN_LENGTH} caracteres`;
                }
                break;
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    // Validar rango de fechas
    validateDateRange() {
        const fechaInicio = document.getElementById('cursoFechaInicio');
        const fechaFin = document.getElementById('cursoFechaFin');
        
        if (!fechaInicio || !fechaFin || !fechaInicio.value || !fechaFin.value) {
            return true;
        }

        const inicio = new Date(fechaInicio.value);
        const fin = new Date(fechaFin.value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let isValid = true;
        let errorMessage = '';

        if (inicio < hoy) {
            isValid = false;
            errorMessage = 'La fecha de inicio no puede ser anterior a hoy';
            this.showFieldError(fechaInicio, false, errorMessage);
        } else {
            this.showFieldError(fechaInicio, true, '');
        }

        if (fin <= inicio) {
            isValid = false;
            errorMessage = 'La fecha de fin debe ser posterior a la fecha de inicio';
            this.showFieldError(fechaFin, false, errorMessage);
        } else {
            this.showFieldError(fechaFin, true, '');
        }

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

    // Cargar todos los cursos
    async loadCursos() {
        try {
            showLoading(true);
            const response = await apiManager.getAllCursos();
            
            if (response.success) {
                this.cursos = response.data || [];
                this.filteredCursos = [...this.cursos];
                this.updateTable();
                this.updateSelectores();
            } else {
                throw new Error('Error al cargar cursos');
            }
        } catch (error) {
            console.error('Error loading cursos:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Crear nuevo curso
    async createCurso(cursoData) {
        try {
            showLoading(true);
            const response = await apiManager.createCurso(cursoData);
            
            if (response.success) {
                showToast(CONFIG.MESSAGES.SUCCESS.CURSO_CREATED, 'success');
                hideModal('cursoModal');
                await this.loadCursos();
                return true;
            } else {
                throw new Error('Error al crear curso');
            }
        } catch (error) {
            console.error('Error creating curso:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('409') || error.message.includes('Conflict')) {
                errorMessage = CONFIG.MESSAGES.ERROR.CURSO_EXISTS;
            }
            
            showToast(errorMessage, 'error');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Actualizar curso
    async updateCurso(id, cursoData) {
        try {
            showLoading(true);
            const response = await apiManager.updateCurso(id, cursoData);
            
            if (response.success) {
                showToast(CONFIG.MESSAGES.SUCCESS.CURSO_UPDATED, 'success');
                hideModal('cursoModal');
                await this.loadCursos();
                return true;
            } else {
                throw new Error('Error al actualizar curso');
            }
        } catch (error) {
            console.error('Error updating curso:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('409') || error.message.includes('Conflict')) {
                errorMessage = CONFIG.MESSAGES.ERROR.CURSO_EXISTS;
            }
            
            showToast(errorMessage, 'error');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Eliminar curso
    async deleteCurso(id) {
        const curso = this.cursos.find(c => c.id === id);
        if (!curso) return;

        uiManager.confirm(
            `${CONFIG.MESSAGES.CONFIRM.DELETE_CURSO}\n\nCurso: ${curso.nombre}`,
            async () => {
                try {
                    showLoading(true);
                    const response = await apiManager.deleteCurso(id);
                    
                    if (response.success) {
                        showToast(CONFIG.MESSAGES.SUCCESS.CURSO_DELETED, 'success');
                        await this.loadCursos();
                    } else {
                        throw new Error('Error al eliminar curso');
                    }
                } catch (error) {
                    console.error('Error deleting curso:', error);
                    showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
                } finally {
                    showLoading(false);
                }
            }
        );
    }

    // Cambiar estado del curso (activar/desactivar)
    async toggleStatus(id, activate) {
        const curso = this.cursos.find(c => c.id === id);
        if (!curso) return;

        const action = activate ? 'activar' : 'desactivar';
        const confirmMessage = activate ? 
            `¿Está seguro de que desea activar el curso ${curso.nombre}?` :
            `${CONFIG.MESSAGES.CONFIRM.DEACTIVATE_CURSO}\n\nCurso: ${curso.nombre}`;

        uiManager.confirm(confirmMessage, async () => {
            try {
                showLoading(true);
                const response = activate ? 
                    await apiManager.activarCurso(id) : 
                    await apiManager.desactivarCurso(id);
                
                if (response.success) {
                    const message = activate ? 
                        CONFIG.MESSAGES.SUCCESS.CURSO_ACTIVATED : 
                        CONFIG.MESSAGES.SUCCESS.CURSO_DEACTIVATED;
                    showToast(message, 'success');
                    await this.loadCursos();
                } else {
                    throw new Error(`Error al ${action} curso`);
                }
            } catch (error) {
                console.error(`Error ${action} curso:`, error);
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
        
        const formData = uiManager.getFormData('cursoForm');
        const cursoId = document.getElementById('cursoId').value;
        
        // Validar formulario
        const validation = this.validateCursoForm(formData);
        if (!validation.valid) {
            showToast(validation.errors.join('\n'), 'error');
            return;
        }

        // Validar rango de fechas
        if (!this.validateDateRange()) {
            showToast('Por favor, corrija las fechas del curso', 'error');
            return;
        }

        // Crear o actualizar
        const success = cursoId ? 
            await this.updateCurso(cursoId, formData) : 
            await this.createCurso(formData);
    }

    // Validar formulario de curso
    validateCursoForm(data) {
        const rules = {
            nombre: { required: true, label: 'Nombre', minLength: 2, maxLength: 100 },
            descripcion: { maxLength: 500, label: 'Descripción' },
            fechaInicio: { required: true, label: 'Fecha de Inicio' },
            fechaFin: { required: true, label: 'Fecha de Fin' },
            duracionHoras: { required: true, label: 'Duración en Horas' },
            instructor: { minLength: 2, maxLength: 100, label: 'Instructor' }
        };

        return uiManager.validateForm('cursoForm', rules);
    }

    // Editar curso
    async editCurso(id) {
        try {
            showLoading(true);
            const response = await apiManager.getCursoById(id);
            
            if (response.success && response.data) {
                this.currentCurso = response.data;
                
                // Llenar formulario
                uiManager.fillForm('cursoForm', response.data);
                document.getElementById('cursoId').value = id;
                document.getElementById('cursoModalTitle').textContent = 'Editar Curso';
                
                showModal('cursoModal');
            } else {
                throw new Error('Curso no encontrado');
            }
        } catch (error) {
            console.error('Error loading curso for edit:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Preparar formulario para nuevo curso
    newCurso() {
        this.currentCurso = null;
        document.getElementById('cursoForm').reset();
        document.getElementById('cursoId').value = '';
        document.getElementById('cursoModalTitle').textContent = 'Nuevo Curso';
        document.getElementById('cursoActivo').checked = true;
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('cursoFechaInicio').min = today;
        document.getElementById('cursoFechaFin').min = today;
        
        showModal('cursoModal');
    }

    // ==================== BÚSQUEDA Y FILTROS ====================

    // Manejar búsqueda
    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredCursos = [...this.cursos];
            this.updateTable();
            return;
        }

        // Filtrar localmente por nombre e instructor
        const term = searchTerm.toLowerCase();
        this.filteredCursos = this.cursos.filter(curso => 
            curso.nombre.toLowerCase().includes(term) ||
            (curso.instructor && curso.instructor.toLowerCase().includes(term))
        );
        this.updateTable();
    }

    // Manejar filtro por estado
    handleFilter(estado) {
        if (!estado) {
            this.filteredCursos = [...this.cursos];
        } else {
            const isActive = estado === 'true';
            this.filteredCursos = this.cursos.filter(curso => curso.activo === isActive);
        }
        this.updateTable();
    }

    // ==================== VISUALIZACIÓN ====================

    // Ver alumnos de un curso
    async viewAlumnos(cursoId) {
        try {
            showLoading(true);
            const response = await apiManager.getAlumnosDeCurso(cursoId);
            
            if (response.success) {
                const curso = this.cursos.find(c => c.id === cursoId);
                const alumnos = response.data || [];
                
                this.showAlumnosModal(curso, alumnos);
            } else {
                throw new Error('Error al cargar alumnos del curso');
            }
        } catch (error) {
            console.error('Error loading alumnos for curso:', error);
            showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Mostrar modal con alumnos del curso
    showAlumnosModal(curso, alumnos) {
        const modalHtml = `
            <div id="alumnosCursoModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Alumnos del curso: ${curso.nombre}</h3>
                        <span class="close" onclick="document.getElementById('alumnosCursoModal').remove()">&times;</span>
                    </div>
                    <div style="padding: 25px;">
                        ${alumnos.length === 0 ? 
                            '<p class="text-center"><i class="fas fa-info-circle"></i> No hay alumnos inscritos en este curso.</p>' :
                            `<div class="inscripciones-list">
                                ${alumnos.map(alumno => `
                                    <div class="inscripcion-item">
                                        <div class="inscripcion-info">
                                            <strong>${alumno.nombre} ${alumno.apellido}</strong>
                                            <small>DNI: ${alumno.dni}</small>
                                            <small>Email: ${alumno.email}</small>
                                        </div>
                                        <button class="btn btn-danger btn-sm" onclick="cursosManager.removerAlumno(${curso.id}, ${alumno.id})">
                                            <i class="fas fa-times"></i> Remover
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

    // Remover alumno del curso
    async removerAlumno(cursoId, alumnoId) {
        const curso = this.cursos.find(c => c.id === cursoId);
        if (!curso) return;

        uiManager.confirm(
            CONFIG.MESSAGES.CONFIRM.DESINSCRIBIR,
            async () => {
                try {
                    showLoading(true);
                    const response = await apiManager.removerAlumnoDeCurso(cursoId, alumnoId);
                    
                    if (response.success) {
                        showToast(CONFIG.MESSAGES.SUCCESS.DESINSCRIPCION_SUCCESS, 'success');
                        
                        // Cerrar modal y recargar datos
                        const modal = document.getElementById('alumnosCursoModal');
                        if (modal) modal.remove();
                        
                        await this.loadCursos();
                        
                        // Reabrir modal con datos actualizados
                        setTimeout(() => this.viewAlumnos(cursoId), 500);
                    } else {
                        throw new Error('Error al remover alumno del curso');
                    }
                } catch (error) {
                    console.error('Error removiendo alumno del curso:', error);
                    showToast(error.message || CONFIG.MESSAGES.ERROR.GENERIC_ERROR, 'error');
                } finally {
                    showLoading(false);
                }
            }
        );
    }

    // ==================== ACTUALIZACIÓN DE UI ====================

    // Actualizar tabla de cursos
    updateTable() {
        uiManager.updateTable('cursosTableBody', this.filteredCursos, (curso) => 
            uiManager.createCursoRow(curso)
        );
    }

    // Actualizar selectores en otras secciones
    updateSelectores() {
        // Actualizar selector de inscripciones
        const selectCursoInscripcion = document.getElementById('selectCursoInscripcion');
        const selectCursoVer = document.getElementById('selectCursoVer');
        
        if (selectCursoInscripcion) {
            selectCursoInscripcion.innerHTML = '<option value="">Seleccione un curso...</option>' +
                this.cursos
                    .filter(c => c.activo)
                    .map(c => `<option value="${c.id}">${c.nombre} (${c.instructor || 'Sin instructor'})</option>`)
                    .join('');
        }
        
        if (selectCursoVer) {
            selectCursoVer.innerHTML = '<option value="">Seleccione un curso...</option>' +
                this.cursos
                    .filter(c => c.activo)
                    .map(c => `<option value="${c.id}">${c.nombre} (${c.instructor || 'Sin instructor'})</option>`)
                    .join('');
        }
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    // Obtener curso por ID
    getCursoById(id) {
        return this.cursos.find(c => c.id === id);
    }

    // Obtener todos los cursos
    getAllCursos() {
        return this.cursos;
    }

    // Obtener cursos filtrados
    getFilteredCursos() {
        return this.filteredCursos;
    }

    // Obtener cursos activos
    getActiveCursos() {
        return this.cursos.filter(c => c.activo);
    }
}

// Crear instancia global del manager de cursos
const cursosManager = new CursosManager();

// Funciones globales para uso en HTML
window.searchCursos = function() {
    const searchTerm = document.getElementById('searchCurso').value;
    cursosManager.handleSearch(searchTerm);
};

window.loadCursos = function() {
    cursosManager.loadCursos();
};

// Exportar para uso en otros módulos
window.cursosManager = cursosManager;

