package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.model.Curso;

import java.util.List;
import java.util.Optional;

public interface IAlumnoService {

    public List<Alumno> findAll();

    public Optional<Alumno> findById(Long id);

    public Alumno save(Alumno alumno);

    public void deleteById(Long id);

    public void update(Alumno alumno);

    // Métodos específicos para Alumno
    public List<Alumno> findActivosAlumnos();

    public Optional<Alumno> findByDni(String dni);

    public Optional<Alumno> findByEmail(String email);

    public List<Alumno> findByCurso(Curso curso);

    public List<Alumno> findByCursoId(Long cursoId);

    public List<Alumno> findByNombreOrApellido(String termino);

    public List<Alumno> findActivosByCursoId(Long cursoId);

    public Long countActivosByCursoId(Long cursoId);

    public void activarAlumno(Long id);

    public void desactivarAlumno(Long id);

    // Métodos para relación muchos a muchos
    public void inscribirEnCurso(Long alumnoId, Long cursoId);

    public void desinscribirDeCurso(Long alumnoId, Long cursoId);

    public List<Curso> getCursosDeAlumno(Long alumnoId);
}
