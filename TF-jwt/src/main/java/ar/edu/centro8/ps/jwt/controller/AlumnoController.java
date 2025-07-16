package ar.edu.centro8.ps.jwt.controller;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.service.IAlumnoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = "*")
public class AlumnoController {

    @Autowired
    private IAlumnoService alumnoService;

    // GET - Obtener todos los alumnos
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<Alumno>> getAllAlumnos() {
        List<Alumno> alumnos = alumnoService.findAll();
        return ResponseEntity.ok(alumnos);
    }

    // GET - Obtener alumnos activos
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<Alumno>> getActivosAlumnos() {
        List<Alumno> alumnos = alumnoService.findActivosAlumnos();
        return ResponseEntity.ok(alumnos);
    }

    // GET - Obtener alumno por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<Alumno> getAlumnoById(@PathVariable Long id) {
        Optional<Alumno> alumno = alumnoService.findById(id);
        return alumno.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET - Buscar alumno por DNI
    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<Alumno> getAlumnoByDni(@PathVariable String dni) {
        Optional<Alumno> alumno = alumnoService.findByDni(dni);
        return alumno.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET - Buscar alumno por email
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<Alumno> getAlumnoByEmail(@PathVariable String email) {
        Optional<Alumno> alumno = alumnoService.findByEmail(email);
        return alumno.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET - Buscar alumnos por curso ID
    @GetMapping("/curso/{cursoId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<Alumno>> getAlumnosByCursoId(@PathVariable Long cursoId) {
        List<Alumno> alumnos = alumnoService.findByCursoId(cursoId);
        return ResponseEntity.ok(alumnos);
    }

    // GET - Buscar alumnos activos por curso ID
    @GetMapping("/curso/{cursoId}/activos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<Alumno>> getActivosAlumnosByCursoId(@PathVariable Long cursoId) {
        List<Alumno> alumnos = alumnoService.findActivosByCursoId(cursoId);
        return ResponseEntity.ok(alumnos);
    }

    // GET - Contar alumnos activos por curso ID
    @GetMapping("/curso/{cursoId}/count")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<Long> countActivosAlumnosByCursoId(@PathVariable Long cursoId) {
        Long count = alumnoService.countActivosByCursoId(cursoId);
        return ResponseEntity.ok(count);
    }

    // GET - Buscar alumnos por nombre o apellido
    @GetMapping("/buscar/{termino}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<Alumno>> getAlumnosByNombreOrApellido(@PathVariable String termino) {
        List<Alumno> alumnos = alumnoService.findByNombreOrApellido(termino);
        return ResponseEntity.ok(alumnos);
    }

    // POST - Crear nuevo alumno
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_STUDENT')")
    public ResponseEntity<Alumno> createAlumno(@Valid @RequestBody Alumno alumno) {
        try {
            // Verificar que no exista un alumno con el mismo DNI
            Optional<Alumno> existeAlumnoDni = alumnoService.findByDni(alumno.getDni());
            if (existeAlumnoDni.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }

            // Verificar que no exista un alumno con el mismo email
            Optional<Alumno> existeAlumnoEmail = alumnoService.findByEmail(alumno.getEmail());
            if (existeAlumnoEmail.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }

            Alumno nuevoAlumno = alumnoService.save(alumno);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAlumno);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // PUT - Actualizar alumno
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_STUDENT')")
    public ResponseEntity<Alumno> updateAlumno(@PathVariable Long id, @Valid @RequestBody Alumno alumno) {
        Optional<Alumno> alumnoExistente = alumnoService.findById(id);
        if (alumnoExistente.isPresent()) {
            // Verificar que no exista otro alumno con el mismo DNI
            Optional<Alumno> existeAlumnoDni = alumnoService.findByDni(alumno.getDni());
            if (existeAlumnoDni.isPresent() && !existeAlumnoDni.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }

            // Verificar que no exista otro alumno con el mismo email
            Optional<Alumno> existeAlumnoEmail = alumnoService.findByEmail(alumno.getEmail());
            if (existeAlumnoEmail.isPresent() && !existeAlumnoEmail.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }

            alumno.setId(id);
            Alumno alumnoActualizado = alumnoService.save(alumno);
            return ResponseEntity.ok(alumnoActualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE - Eliminar alumno (eliminación física)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_STUDENT')")
    public ResponseEntity<Void> deleteAlumno(@PathVariable Long id) {
        Optional<Alumno> alumno = alumnoService.findById(id);
        if (alumno.isPresent()) {
            alumnoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH - Activar alumno
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_STUDENT')")
    public ResponseEntity<Void> activarAlumno(@PathVariable Long id) {
        Optional<Alumno> alumno = alumnoService.findById(id);
        if (alumno.isPresent()) {
            alumnoService.activarAlumno(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH - Desactivar alumno
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_STUDENT')")
    public ResponseEntity<Void> desactivarAlumno(@PathVariable Long id) {
        Optional<Alumno> alumno = alumnoService.findById(id);
        if (alumno.isPresent()) {
            alumnoService.desactivarAlumno(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // POST - Inscribir alumno en curso
    @PostMapping("/{alumnoId}/cursos/{cursoId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_STUDENT')")
    public ResponseEntity<Void> inscribirAlumnoEnCurso(@PathVariable Long alumnoId, @PathVariable Long cursoId) {
        try {
            alumnoService.inscribirEnCurso(alumnoId, cursoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE - Desinscribir alumno de curso
    @DeleteMapping("/{alumnoId}/cursos/{cursoId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_STUDENT')")
    public ResponseEntity<Void> desinscribirAlumnoDeCurso(@PathVariable Long alumnoId, @PathVariable Long cursoId) {
        try {
            alumnoService.desinscribirDeCurso(alumnoId, cursoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET - Obtener cursos de un alumno
    @GetMapping("/{id}/cursos")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_STUDENT')")
    public ResponseEntity<List<ar.edu.centro8.ps.jwt.model.Curso>> getCursosDeAlumno(@PathVariable Long id) {
        try {
            List<ar.edu.centro8.ps.jwt.model.Curso> cursos = alumnoService.getCursosDeAlumno(id);
            return ResponseEntity.ok(cursos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
