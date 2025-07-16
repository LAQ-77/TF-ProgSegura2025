package ar.edu.centro8.ps.jwt.controller;

import ar.edu.centro8.ps.jwt.model.Curso;
import ar.edu.centro8.ps.jwt.service.ICursoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
public class CursoController {

    @Autowired
    private ICursoService cursoService;

    // GET - Obtener todos los cursos
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<Curso>> getAllCursos() {
        List<Curso> cursos = cursoService.findAll();
        return ResponseEntity.ok(cursos);
    }

    // GET - Obtener cursos activos
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<Curso>> getActiveCursos() {
        List<Curso> cursos = cursoService.findActiveCursos();
        return ResponseEntity.ok(cursos);
    }

    // GET - Obtener cursos activos con alumnos
    @GetMapping("/activos/con-alumnos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<Curso>> getActiveCursosWithAlumnos() {
        List<Curso> cursos = cursoService.findActiveCursosWithAlumnos();
        return ResponseEntity.ok(cursos);
    }

    // GET - Obtener curso por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<Curso> getCursoById(@PathVariable Long id) {
        Optional<Curso> curso = cursoService.findById(id);
        return curso.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET - Buscar curso por nombre
    @GetMapping("/nombre/{nombre}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<Curso> getCursoByNombre(@PathVariable String nombre) {
        Optional<Curso> curso = cursoService.findByNombre(nombre);
        return curso.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET - Buscar cursos por instructor
    @GetMapping("/instructor/{instructor}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<Curso>> getCursosByInstructor(@PathVariable String instructor) {
        List<Curso> cursos = cursoService.findByInstructor(instructor);
        return ResponseEntity.ok(cursos);
    }

    // GET - Buscar cursos por rango de fechas
    @GetMapping("/fechas")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<Curso>> getCursosByFechaRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<Curso> cursos = cursoService.findByFechaRange(fechaInicio, fechaFin);
        return ResponseEntity.ok(cursos);
    }

    // POST - Crear nuevo curso
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_COURSE')")
    public ResponseEntity<Curso> createCurso(@Valid @RequestBody Curso curso) {
        try {
            Curso nuevoCurso = cursoService.save(curso);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCurso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // PUT - Actualizar curso
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_COURSE')")
    public ResponseEntity<Curso> updateCurso(@PathVariable Long id, @Valid @RequestBody Curso curso) {
        Optional<Curso> cursoExistente = cursoService.findById(id);
        if (cursoExistente.isPresent()) {
            curso.setId(id);
            Curso cursoActualizado = cursoService.save(curso);
            return ResponseEntity.ok(cursoActualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE - Eliminar curso (eliminación física)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_COURSE')")
    public ResponseEntity<Void> deleteCurso(@PathVariable Long id) {
        Optional<Curso> curso = cursoService.findById(id);
        if (curso.isPresent()) {
            cursoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH - Activar curso
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_COURSE')")
    public ResponseEntity<Void> activarCurso(@PathVariable Long id) {
        Optional<Curso> curso = cursoService.findById(id);
        if (curso.isPresent()) {
            cursoService.activarCurso(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH - Desactivar curso
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_COURSE')")
    public ResponseEntity<Void> desactivarCurso(@PathVariable Long id) {
        Optional<Curso> curso = cursoService.findById(id);
        if (curso.isPresent()) {
            cursoService.desactivarCurso(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET - Obtener alumnos de un curso
    @GetMapping("/{id}/alumnos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_COURSE')")
    public ResponseEntity<List<ar.edu.centro8.ps.jwt.model.Alumno>> getAlumnosDeCurso(@PathVariable Long id) {
        try {
            List<ar.edu.centro8.ps.jwt.model.Alumno> alumnos = cursoService.getAlumnosDeCurso(id);
            return ResponseEntity.ok(alumnos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST - Agregar alumno a curso
    @PostMapping("/{cursoId}/alumnos/{alumnoId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_COURSE')")
    public ResponseEntity<Void> agregarAlumnoACurso(@PathVariable Long cursoId, @PathVariable Long alumnoId) {
        try {
            cursoService.agregarAlumno(cursoId, alumnoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE - Remover alumno de curso
    @DeleteMapping("/{cursoId}/alumnos/{alumnoId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_COURSE')")
    public ResponseEntity<Void> removerAlumnoDeCurso(@PathVariable Long cursoId, @PathVariable Long alumnoId) {
        try {
            cursoService.removerAlumno(cursoId, alumnoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
