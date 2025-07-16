package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.model.Curso;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ICursoService {

    public List<Curso> findAll();

    public Optional<Curso> findById(Long id);

    public Curso save(Curso curso);

    public void deleteById(Long id);

    public void update(Curso curso);

    // Métodos específicos para Curso
    public List<Curso> findActiveCursos();

    public Optional<Curso> findByNombre(String nombre);

    public List<Curso> findByInstructor(String instructor);

    public List<Curso> findByFechaRange(LocalDate fechaInicio, LocalDate fechaFin);

    public List<Curso> findActiveCursosWithAlumnos();

    public void activarCurso(Long id);

    public void desactivarCurso(Long id);

    // Métodos para relación muchos a muchos
    public void agregarAlumno(Long cursoId, Long alumnoId);

    public void removerAlumno(Long cursoId, Long alumnoId);

    public List<Alumno> getAlumnosDeCurso(Long cursoId);
}
