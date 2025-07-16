package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.model.Curso;
import ar.edu.centro8.ps.jwt.repository.IAlumnoRepository;
import ar.edu.centro8.ps.jwt.repository.ICursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CursoService implements ICursoService {

    @Autowired
    private ICursoRepository cursoRepository;

    @Autowired
    private IAlumnoRepository alumnoRepository;

    @Override
    public List<Curso> findAll() {
        return cursoRepository.findAll();
    }

    @Override
    public Optional<Curso> findById(Long id) {
        return cursoRepository.findById(id);
    }

    @Override
    public Curso save(Curso curso) {
        return cursoRepository.save(curso);
    }

    @Override
    public void deleteById(Long id) {
        cursoRepository.deleteById(id);
    }

    @Override
    public void update(Curso curso) {
        cursoRepository.save(curso);
    }

    @Override
    public List<Curso> findActiveCursos() {
        return cursoRepository.findByActivoTrue();
    }

    @Override
    public Optional<Curso> findByNombre(String nombre) {
        return cursoRepository.findByNombre(nombre);
    }

    @Override
    public List<Curso> findByInstructor(String instructor) {
        return cursoRepository.findByInstructorContainingIgnoreCase(instructor);
    }

    @Override
    public List<Curso> findByFechaRange(LocalDate fechaInicio, LocalDate fechaFin) {
        return cursoRepository.findByFechaRange(fechaInicio, fechaFin);
    }

    @Override
    public List<Curso> findActiveCursosWithAlumnos() {
        return cursoRepository.findActiveCursosWithAlumnos();
    }

    @Override
    public void activarCurso(Long id) {
        Optional<Curso> cursoOpt = cursoRepository.findById(id);
        if (cursoOpt.isPresent()) {
            Curso curso = cursoOpt.get();
            curso.setActivo(true);
            cursoRepository.save(curso);
        }
    }

    @Override
    public void desactivarCurso(Long id) {
        Optional<Curso> cursoOpt = cursoRepository.findById(id);
        if (cursoOpt.isPresent()) {
            Curso curso = cursoOpt.get();
            curso.setActivo(false);
            cursoRepository.save(curso);
        }
    }

    @Override
    public void agregarAlumno(Long cursoId, Long alumnoId) {
        Optional<Curso> cursoOpt = cursoRepository.findById(cursoId);
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(alumnoId);

        if (cursoOpt.isPresent() && alumnoOpt.isPresent()) {
            Curso curso = cursoOpt.get();
            Alumno alumno = alumnoOpt.get();

            if (!alumno.getCursos().contains(curso)) {
                alumno.getCursos().add(curso);
                alumnoRepository.save(alumno);
            } else {
                throw new RuntimeException("El alumno ya está inscrito en este curso");
            }
        } else {
            throw new RuntimeException("Curso o alumno no encontrado");
        }
    }

    @Override
    public void removerAlumno(Long cursoId, Long alumnoId) {
        Optional<Curso> cursoOpt = cursoRepository.findById(cursoId);
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(alumnoId);

        if (cursoOpt.isPresent() && alumnoOpt.isPresent()) {
            Curso curso = cursoOpt.get();
            Alumno alumno = alumnoOpt.get();

            if (alumno.getCursos().contains(curso)) {
                alumno.getCursos().remove(curso);
                alumnoRepository.save(alumno);
            } else {
                throw new RuntimeException("El alumno no está inscrito en este curso");
            }
        } else {
            throw new RuntimeException("Curso o alumno no encontrado");
        }
    }

    @Override
    public List<Alumno> getAlumnosDeCurso(Long cursoId) {
        Optional<Curso> cursoOpt = cursoRepository.findById(cursoId);
        if (cursoOpt.isPresent()) {
            return cursoOpt.get().getAlumnos();
        } else {
            throw new RuntimeException("Curso no encontrado");
        }
    }
}
