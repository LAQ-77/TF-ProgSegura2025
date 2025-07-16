// Módulo de UI para manejar la interfaz de usuario
class UIManager {
    constructor() {
        this.activeTab = 'alumnos';
        this.loadingCount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModalEvents();
    }

    // Configurar event listeners globales
    setupEventListeners() {
        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Configurar eventos de modales
    setupModalEvents() {
        // Prevenir que el modal se cierre al hacer clic dentro del contenido
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    // ==================== MANEJO DE TABS ====================
    
    showTab(tabName) {
        // Ocultar todas las tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remover clase active de todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar tab seleccionada
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Activar botón correspondiente
        const targetBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        this.activeTab = tabName;

        // Cargar datos específicos de la tab si es necesario
        this.loadTabData(tabName);
    }

    // Cargar datos específicos de cada tab
    async loadTabData(tabName) {
        try {
            switch (tabName) {
                case 'alumnos':
                    if (window.alumnosManager) {
                        await window.alumnosManager.loadAlumnos();
                    }
                    break;
                case 'cursos':
                    if (window.cursosManager) {
                        await window.cursosManager.loadCursos();
                    }
                    break;
                case 'inscripciones':
                    if (window.inscripcionesManager) {
                        await window.inscripcionesManager.loadSelectores();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error loading data for tab ${tabName}:`, error);
        }
    }

    // ==================== MANEJO DE MODALES ====================
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll del body
            
            // Limpiar formularios dentro del modal
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
            
            // Limpiar campos hidden
            const hiddenInputs = modal.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => input.value = '');
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    // ==================== MANEJO DE LOADING ====================
    
    showLoading(show = true) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            if (show) {
                this.loadingCount++;
                spinner.style.display = 'flex';
            } else {
                this.loadingCount = Math.max(0, this.loadingCount - 1);
                if (this.loadingCount === 0) {
                    spinner.style.display = 'none';
                }
            }
        }
    }

    // ==================== MANEJO DE TOASTS ====================
    
    showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const toastId = 'toast_' + Date.now();
        toast.id = toastId;

        // Determinar icono según el tipo
        let icon = 'fas fa-info-circle';
        let title = 'Información';
        
        switch (type) {
            case 'success':
                icon = 'fas fa-check-circle';
                title = 'Éxito';
                break;
            case 'error':
                icon = 'fas fa-exclamation-circle';
                title = 'Error';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                title = 'Advertencia';
                break;
        }

        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">
                    <i class="${icon}"></i> ${title}
                </span>
                <button class="toast-close" onclick="uiManager.hideToast('${toastId}')">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Auto-ocultar después del tiempo especificado
        setTimeout(() => {
            this.hideToast(toastId);
        }, duration);
    }

    hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // ==================== MANEJO DE TABLAS ====================
    
    // Crear fila de tabla para alumno
    createAlumnoRow(alumno) {
        const cursosCount = alumno.cursos ? alumno.cursos.length : 0;
        const statusClass = alumno.activo ? 'status-active' : 'status-inactive';
        const statusText = alumno.activo ? 'Activo' : 'Inactivo';

        return `
            <tr data-id="${alumno.id}">
                <td>${alumno.id}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellido}</td>
                <td>${alumno.dni}</td>
                <td>${alumno.email}</td>
                <td>${alumno.telefono || '-'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${cursosCount} curso(s)</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="alumnosManager.editAlumno(${alumno.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-info" onclick="alumnosManager.viewCursos(${alumno.id})" title="Ver Cursos">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${alumno.activo ? 
                            `<button class="btn btn-warning" onclick="alumnosManager.toggleStatus(${alumno.id}, false)" title="Desactivar">
                                <i class="fas fa-pause"></i>
                            </button>` :
                            `<button class="btn btn-success" onclick="alumnosManager.toggleStatus(${alumno.id}, true)" title="Activar">
                                <i class="fas fa-play"></i>
                            </button>`
                        }
                        <button class="btn btn-danger" onclick="alumnosManager.deleteAlumno(${alumno.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Crear fila de tabla para curso
    createCursoRow(curso) {
        const alumnosCount = curso.alumnos ? curso.alumnos.length : 0;
        const statusClass = curso.activo ? 'status-active' : 'status-inactive';
        const statusText = curso.activo ? 'Activo' : 'Inactivo';

        return `
            <tr data-id="${curso.id}">
                <td>${curso.id}</td>
                <td>${curso.nombre}</td>
                <td>${curso.instructor || '-'}</td>
                <td>${formatDate(curso.fechaInicio)}</td>
                <td>${formatDate(curso.fechaFin)}</td>
                <td>${curso.duracionHoras}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${alumnosCount} alumno(s)</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="cursosManager.editCurso(${curso.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-info" onclick="cursosManager.viewAlumnos(${curso.id})" title="Ver Alumnos">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${curso.activo ? 
                            `<button class="btn btn-warning" onclick="cursosManager.toggleStatus(${curso.id}, false)" title="Desactivar">
                                <i class="fas fa-pause"></i>
                            </button>` :
                            `<button class="btn btn-success" onclick="cursosManager.toggleStatus(${curso.id}, true)" title="Activar">
                                <i class="fas fa-play"></i>
                            </button>`
                        }
                        <button class="btn btn-danger" onclick="cursosManager.deleteCurso(${curso.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Actualizar tabla con datos
    updateTable(tableBodyId, data, createRowFunction) {
        const tbody = document.getElementById(tableBodyId);
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100%" class="text-center">
                        <i class="fas fa-info-circle"></i> No hay datos para mostrar
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(item => createRowFunction(item)).join('');
    }

    // ==================== MANEJO DE FORMULARIOS ====================
    
    // Llenar formulario con datos
    fillForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form || !data) return;

        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else if (field.type === 'date' && data[key]) {
                    // Formatear fecha para input date
                    const date = new Date(data[key]);
                    field.value = date.toISOString().split('T')[0];
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    }

    // Obtener datos del formulario
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    data[key] = field.checked;
                } else if (field.type === 'number') {
                    data[key] = value ? parseInt(value) : null;
                } else {
                    data[key] = value;
                }
            }
        }

        return data;
    }

    // Validar formulario
    validateForm(formId, rules = {}) {
        const form = document.getElementById(formId);
        if (!form) return { valid: false, errors: ['Formulario no encontrado'] };

        const errors = [];
        const data = this.getFormData(formId);

        // Validaciones básicas
        Object.keys(rules).forEach(fieldName => {
            const rule = rules[fieldName];
            const value = data[fieldName];
            const field = form.querySelector(`[name="${fieldName}"]`);

            if (rule.required && (typeof value === 'string' && value.trim() === '') ) {
                errors.push(`${rule.label || fieldName} es obligatorio`);
                if (field) field.classList.add('error');
            } else if (field) {
                field.classList.remove('error');
            }

            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${rule.label || fieldName} tiene un formato inválido`);
                if (field) field.classList.add('error');
            }

            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || fieldName} debe tener al menos ${rule.minLength} caracteres`);
                if (field) field.classList.add('error');
            }

            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || fieldName} no puede tener más de ${rule.maxLength} caracteres`);
                if (field) field.classList.add('error');
            }
        });

        return { valid: errors.length === 0, errors, data };
    }

    // ==================== UTILIDADES ====================
    
    // Confirmar acción
    confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    }

    // Formatear número con separadores de miles
    formatNumber(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    }

    // Capitalizar primera letra
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    // Obtener tab activa
    getActiveTab() {
        return this.activeTab;
    }
}

// Crear instancia global del manager de UI
const uiManager = new UIManager();

// Funciones globales para uso en HTML
window.showTab = function(tabName) {
    uiManager.showTab(tabName);
};

window.showModal = function(modalId) {
    uiManager.showModal(modalId);
};

window.hideModal = function(modalId) {
    uiManager.hideModal(modalId);
};

window.showLoading = function(show = true) {
    uiManager.showLoading(show);
};

window.showToast = function(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
    uiManager.showToast(message, type, duration);
};

// Exportar para uso en otros módulos
window.uiManager = uiManager;

