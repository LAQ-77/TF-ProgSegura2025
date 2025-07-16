// Módulo de gestión de inscripciones (relación muchos a muchos)
class InscripcionesManager {
    constructor() {
        this.inscripciones = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Selector de alumno para ver cursos
        const selectAlumnoVer = document.getElementById('selectAlumnoVer');
        if (selectAlumnoVer) {
            selectAlumnoVer.addEventListener('change', (e) => this.verCursosAlumno(e.target.value));
        }

        // Selector de curso para ver alumnos
        const selectCursoVer = document.getElementById('selectCursoVer');
        if (selectCursoVer) {
            selectCursoVer.addEventListener('change', (e) => this.verAlumnosCurso(e.target.value));
        }
    }

    // ==================== OPERACIONES DE INSCRIPCIÓN ====================

    // Inscribir alumno en curso
    async inscribirAlumno() {
        const alumnoId = document.getElementById('selectAlumnoInscripcion').value;
        const cursoId = document.getElementById('selectCursoInscripcion').value;

        // Validaciones
        if (!alumnoId) {
            showToast('Por favor, seleccione un alumno', 'warning');
            return;
        }

        if (!cursoId) {
            showToast('Por favor, seleccione un curso', 'warning');
            return;
        }

        // Verificar si ya está inscrito
        if (await this.verificarInscripcionExistente(alumnoId, cursoId)) {
            showToast(CONFIG.MESSAGES.ERROR.INSCRIPCION_EXISTS, 'warning');
            return;
        }

        // Obtener información del alumno y curso para confirmación
        const alumno = window.alumnosManager?.getAlumnoById(parseInt(alumnoId));
        const curso = window.cursosManager?.getCursoById(parseInt(cursoId));

        if (!alumno || !curso) {
            showToast('Error al obtener información del alumno o curso', 'error');
            return;
        }

        // Confirmar inscripción
        const confirmMessage = `¿Está seguro de que desea inscribir a ${alumno.nombre} ${alumno.apellido} en el curso "${curso.nombre}"?`;
        
        uiManager.confirm(confirmMessage, async () => {
            try {
                showLoading(true);
                const response = await apiManager.inscribirAlumnoEnCurso(alumnoId, cursoId);
                
                if (response.success) {
                    showToast(CONFIG.MESSAGES.SUCCESS.INSCRIPCION_SUCCESS, 'success');
                    
                    // Limpiar selectores
                    document.getElementById('selectAlumnoInscripcion').value = '';
                    document.getElementById('selectCursoInscripcion').value = '';
                    
                    // Actualizar datos en los managers
                    await this.actualizarDatos();
                    
                } else {
                    throw new Error('Error al inscribir alumno en curso');
                }
            } catch (error) {
                console.error('Error inscribiendo alumno:', error);
                let errorMessage = error.message;
                
                if (error.message.includes('409') || error.message.includes('Conflict')) {
                    errorMessage = CONFIG.MESSAGES.ERROR.INSCRIPCION_EXISTS;
                }
                
                showToast(errorMessage, 'error');
            } finally {
                showLoading(false);
            }
        });
    }

    // Desinscribir alumno de curso
    async desinscribirAlumno(alumnoId, cursoId) {
        // Obtener información del alumno y curso para confirmación
        const alumno = window.alumnosManager?.getAlumnoById(parseInt(alumnoId));
        const curso = window.cursosManager?.getCursoById(parseInt(cursoId));

        if (!alumno || !curso) {
            showToast('Error al obtener información del alumno o curso', 'error');
            return;
        }

        const confirmMessage = `${CONFIG.MESSAGES.CONFIRM.DESINSCRIBIR}\n\nAlumno: ${alumno.nombre} ${alumno.apellido}\nCurso: ${curso.nombre}`;
        
        uiManager.confirm(confirmMessage, async () => {
            try {
                showLoading(true);
                const response = await apiManager.desinscribirAlumnoDeCurso(alumnoId, cursoId);
                
                if (response.success) {
                    showToast(CONFIG.MESSAGES.SUCCESS.DESINSCRIPCION_SUCCESS, 'success');
                    
                    // Actualizar datos y vistas
                    await this.actualizarDatos();
                    
                    // Actualizar las listas mostradas
                    const selectAlumno = document.getElementById('selectAlumnoVer');
                    const selectCurso = document.getElementById('selectCursoVer');
                    
                    if (selectAlumno.value == alumnoId) {
                        await this.verCursosAlumno(alumnoId);
                    }
                    
                    if (selectCurso.value == cursoId) {
                        await this.verAlumnosCurso(cursoId);
                    }
                    
                } else {
                    throw new Error('Error al desinscribir alumno del curso');
                }
            } catch (error) {
                console.error('Error desinscribiendo alumno:', error);
                let errorMessage = error.message;
                
                if (error.message.includes('404') || error.message.includes('Not Found')) {
                    errorMessage = CONFIG.MESSAGES.ERROR.INSCRIPCION_NOT_EXISTS;
                }
                
                showToast(errorMessage, 'error');
            } finally {
                showLoading(false);
            }
        });
    }

    // ==================== VERIFICACIONES ====================

    // Verificar si ya existe la inscripción
    async verificarInscripcionExistente(alumnoId, cursoId) {
        try {
            const response = await apiManager.getCursosDeAlumno(alumnoId);
            
            if (response.success && response.data) {
                return response.data.some(curso => curso.id == cursoId);
            }
            
            return false;
        } catch (error) {
            console.error('Error verificando inscripción:', error);
            return false;
        }
    }

    // ==================== VISUALIZACIÓN ====================

    // Ver cursos de un alumno
    async verCursosAlumno(alumnoId = null) {
        const selectValue = alumnoId || document.getElementById('selectAlumnoVer').value;
        const container = document.getElementById('cursosAlumnoList');
        
        if (!container) return;

        if (!selectValue) {
            container.innerHTML = '<p class="text-center">Seleccione un alumno para ver sus cursos</p>';
            return;
        }

        try {
            showLoading(true);
            const response = await apiManager.getCursosDeAlumno(selectValue);
            
            if (response.success) {
                const cursos = response.data || [];
                const alumno = window.alumnosManager?.getAlumnoById(parseInt(selectValue));
                
                if (cursos.length === 0) {
                    container.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-info-circle"></i>
                            <p>El alumno ${alumno ? alumno.nombre + ' ' + alumno.apellido : ''} no está inscrito en ningún curso.</p>
                        </div>
                    `;
                } else {
                    container.innerHTML = cursos.map(curso => `
                        <div class="inscripcion-item">
                            <div class="inscripcion-info">
                                <strong>${curso.nombre}</strong>
                                <small>Instructor: ${curso.instructor || 'No asignado'}</small>
                                <small>Duración: ${curso.duracionHoras} horas</small>
                                <small>Período: ${formatDate(curso.fechaInicio)} - ${formatDate(curso.fechaFin)}</small>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="inscripcionesManager.desinscribirAlumno(${selectValue}, ${curso.id})" title="Desinscribir">
                                <i class="fas fa-times"></i> Desinscribir
                            </button>
                        </div>
                    `).join('');
                }
            } else {
                throw new Error('Error al cargar cursos del alumno');
            }
        } catch (error) {
            console.error('Error loading cursos for alumno:', error);
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los cursos del alumno</p>
                </div>
            `;
        } finally {
            showLoading(false);
        }
    }

    // Ver alumnos de un curso
    async verAlumnosCurso(cursoId = null) {
        const selectValue = cursoId || document.getElementById('selectCursoVer').value;
        const container = document.getElementById('alumnosCursoList');
        
        if (!container) return;

        if (!selectValue) {
            container.innerHTML = '<p class="text-center">Seleccione un curso para ver sus alumnos</p>';
            return;
        }

        try {
            showLoading(true);
            const response = await apiManager.getAlumnosDeCurso(selectValue);
            
            if (response.success) {
                const alumnos = response.data || [];
                const curso = window.cursosManager?.getCursoById(parseInt(selectValue));
                
                if (alumnos.length === 0) {
                    container.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-info-circle"></i>
                            <p>No hay alumnos inscritos en el curso ${curso ? '"' + curso.nombre + '"' : ''}.</p>
                        </div>
                    `;
                } else {
                    container.innerHTML = alumnos.map(alumno => `
                        <div class="inscripcion-item">
                            <div class="inscripcion-info">
                                <strong>${alumno.nombre} ${alumno.apellido}</strong>
                                <small>DNI: ${alumno.dni}</small>
                                <small>Email: ${alumno.email}</small>
                                <small>Teléfono: ${alumno.telefono || 'No registrado'}</small>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="inscripcionesManager.desinscribirAlumno(${alumno.id}, ${selectValue})" title="Desinscribir">
                                <i class="fas fa-times"></i> Remover
                            </button>
                        </div>
                    `).join('');
                }
            } else {
                throw new Error('Error al cargar alumnos del curso');
            }
        } catch (error) {
            console.error('Error loading alumnos for curso:', error);
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los alumnos del curso</p>
                </div>
            `;
        } finally {
            showLoading(false);
        }
    }

    // ==================== CARGA DE DATOS ====================

    // Cargar selectores con datos actualizados
    async loadSelectores() {
        try {
            // Asegurar que los managers de alumnos y cursos tengan datos actualizados
            if (window.alumnosManager && window.cursosManager) {
                await Promise.all([
                    window.alumnosManager.loadAlumnos(),
                    window.cursosManager.loadCursos()
                ]);
            }
            
            // Limpiar las listas de visualización
            this.limpiarListas();
            
        } catch (error) {
            console.error('Error loading selectores:', error);
            showToast('Error al cargar datos de alumnos y cursos', 'error');
        }
    }

    // Actualizar datos en todos los managers
    async actualizarDatos() {
        try {
            if (window.alumnosManager) {
                await window.alumnosManager.loadAlumnos();
            }
            
            if (window.cursosManager) {
                await window.cursosManager.loadCursos();
            }
        } catch (error) {
            console.error('Error actualizando datos:', error);
        }
    }

    // Limpiar listas de visualización
    limpiarListas() {
        const cursosAlumnoList = document.getElementById('cursosAlumnoList');
        const alumnosCursoList = document.getElementById('alumnosCursoList');
        
        if (cursosAlumnoList) {
            cursosAlumnoList.innerHTML = '<p class="text-center">Seleccione un alumno para ver sus cursos</p>';
        }
        
        if (alumnosCursoList) {
            alumnosCursoList.innerHTML = '<p class="text-center">Seleccione un curso para ver sus alumnos</p>';
        }
        
        // Limpiar selectores
        const selectAlumnoVer = document.getElementById('selectAlumnoVer');
        const selectCursoVer = document.getElementById('selectCursoVer');
        
        if (selectAlumnoVer) selectAlumnoVer.value = '';
        if (selectCursoVer) selectCursoVer.value = '';
    }

    // ==================== ESTADÍSTICAS ====================

    // Obtener estadísticas de inscripciones
    async getEstadisticas() {
        try {
            const alumnos = window.alumnosManager?.getAllAlumnos() || [];
            const cursos = window.cursosManager?.getAllCursos() || [];
            
            let totalInscripciones = 0;
            let alumnosConCursos = 0;
            let cursosConAlumnos = 0;
            
            // Contar inscripciones
            for (const alumno of alumnos) {
                if (alumno.cursos && alumno.cursos.length > 0) {
                    alumnosConCursos++;
                    totalInscripciones += alumno.cursos.length;
                }
            }
            
            for (const curso of cursos) {
                if (curso.alumnos && curso.alumnos.length > 0) {
                    cursosConAlumnos++;
                }
            }
            
            return {
                totalAlumnos: alumnos.length,
                totalCursos: cursos.length,
                totalInscripciones,
                alumnosConCursos,
                cursosConAlumnos,
                alumnosSinCursos: alumnos.length - alumnosConCursos,
                cursosSinAlumnos: cursos.length - cursosConAlumnos
            };
        } catch (error) {
            console.error('Error getting estadísticas:', error);
            return null;
        }
    }

    // Mostrar estadísticas
    async mostrarEstadisticas() {
        const stats = await this.getEstadisticas();
        
        if (!stats) {
            showToast('Error al obtener estadísticas', 'error');
            return;
        }
        
        const mensaje = `
            📊 ESTADÍSTICAS DE INSCRIPCIONES
            
            👥 Total de Alumnos: ${stats.totalAlumnos}
            📚 Total de Cursos: ${stats.totalCursos}
            🔗 Total de Inscripciones: ${stats.totalInscripciones}
            
            ✅ Alumnos con cursos: ${stats.alumnosConCursos}
            ❌ Alumnos sin cursos: ${stats.alumnosSinCursos}
            
            ✅ Cursos con alumnos: ${stats.cursosConAlumnos}
            ❌ Cursos sin alumnos: ${stats.cursosSinAlumnos}
        `;
        
        alert(mensaje);
    }

    // ==================== BÚSQUEDA AVANZADA ====================

    // Buscar inscripciones por criterios
    async buscarInscripciones(criterio, valor) {
        try {
            showLoading(true);
            let resultados = [];
            
            switch (criterio) {
                case 'alumno_dni':
                    const alumnoResponse = await apiManager.getAlumnoByDni(valor);
                    if (alumnoResponse.success && alumnoResponse.data) {
                        const cursosResponse = await apiManager.getCursosDeAlumno(alumnoResponse.data.id);
                        if (cursosResponse.success) {
                            resultados = cursosResponse.data || [];
                        }
                    }
                    break;
                    
                case 'curso_nombre':
                    const cursoResponse = await apiManager.getCursoByNombre(valor);
                    if (cursoResponse.success && cursoResponse.data) {
                        const alumnosResponse = await apiManager.getAlumnosDeCurso(cursoResponse.data.id);
                        if (alumnosResponse.success) {
                            resultados = alumnosResponse.data || [];
                        }
                    }
                    break;
            }
            
            return resultados;
        } catch (error) {
            console.error('Error en búsqueda de inscripciones:', error);
            return [];
        } finally {
            showLoading(false);
        }
    }
}

// Crear instancia global del manager de inscripciones
const inscripcionesManager = new InscripcionesManager();

// Funciones globales para uso en HTML
window.inscribirAlumno = function() {
    inscripcionesManager.inscribirAlumno();
};

window.verCursosAlumno = function() {
    const alumnoId = document.getElementById('selectAlumnoVer').value;
    inscripcionesManager.verCursosAlumno(alumnoId);
};

window.verAlumnosCurso = function() {
    const cursoId = document.getElementById('selectCursoVer').value;
    inscripcionesManager.verAlumnosCurso(cursoId);
};

// Exportar para uso en otros módulos
window.inscripcionesManager = inscripcionesManager;

