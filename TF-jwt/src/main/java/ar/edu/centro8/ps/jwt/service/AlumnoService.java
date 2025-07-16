package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.model.Curso;
import ar.edu.centro8.ps.jwt.repository.IAlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlumnoService implements IAlumnoService {

    @Autowired
    private IAlumnoRepository alumnoRepository;

    @Autowired
    private ICursoService cursoService;

    @Override
    public List<Alumno> findAll() {
        return alumnoRepository.findAll();
    }

    @Override
    public Optional<Alumno> findById(Long id) {
        return alumnoRepository.findById(id);
    }

    @Override
    public Alumno save(Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    @Override
    public void deleteById(Long id) {
        alumnoRepository.deleteById(id);
    }

    @Override
    public void update(Alumno alumno) {
        alumnoRepository.save(alumno);
    }

    @Override
    public List<Alumno> findActivosAlumnos() {
        return alumnoRepository.findByActivoTrue();
    }

    @Override
    public Optional<Alumno> findByDni(String dni) {
        return alumnoRepository.findByDni(dni);
    }

    @Override
    public Optional<Alumno> findByEmail(String email) {
        return alumnoRepository.findByEmail(email);
    }

    @Override
    public List<Alumno> findByCurso(Curso curso) {
        return alumnoRepository.findByCurso(curso);
    }

    @Override
    public List<Alumno> findByCursoId(Long cursoId) {
        return alumnoRepository.findByCursoId(cursoId);
    }

    @Override
    public List<Alumno> findByNombreOrApellido(String termino) {
        return alumnoRepository.findByNombreOrApellidoContaining(termino);
    }

    @Override
    public List<Alumno> findActivosByCursoId(Long cursoId) {
        return alumnoRepository.findActivosByCursoId(cursoId);
    }

    @Override
    public Long countActivosByCursoId(Long cursoId) {
        return alumnoRepository.countActivosByCursoId(cursoId);
    }

    @Override
    public void activarAlumno(Long id) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(id);
        if (alumnoOpt.isPresent()) {
            Alumno alumno = alumnoOpt.get();
            alumno.setActivo(true);
            alumnoRepository.save(alumno);
        }
    }

    @Override
    public void desactivarAlumno(Long id) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(id);
        if (alumnoOpt.isPresent()) {
            Alumno alumno = alumnoOpt.get();
            alumno.setActivo(false);
            alumnoRepository.save(alumno);
        }
    }

    @Override
    public void inscribirEnCurso(Long alumnoId, Long cursoId) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(alumnoId);
        Optional<Curso> cursoOpt = cursoService.findById(cursoId);

        if (alumnoOpt.isPresent() && cursoOpt.isPresent()) {
            Alumno alumno = alumnoOpt.get();
            Curso curso = cursoOpt.get();

            if (!alumno.getCursos().contains(curso)) {
                alumno.getCursos().add(curso);
                alumnoRepository.save(alumno);
            } else {
                throw new RuntimeException("El alumno ya está inscrito en este curso");
            }
        } else {
            throw new RuntimeException("Alumno o curso no encontrado");
        }
    }

    @Override
    public void desinscribirDeCurso(Long alumnoId, Long cursoId) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(alumnoId);
        Optional<Curso> cursoOpt = cursoService.findById(cursoId);

        if (alumnoOpt.isPresent() && cursoOpt.isPresent()) {
            Alumno alumno = alumnoOpt.get();
            Curso curso = cursoOpt.get();

            if (alumno.getCursos().contains(curso)) {
                alumno.getCursos().remove(curso);
                alumnoRepository.save(alumno);
            } else {
                throw new RuntimeException("El alumno no está inscrito en este curso");
            }
        } else {
            throw new RuntimeException("Alumno o curso no encontrado");
        }
    }

    @Override
    public List<Curso> getCursosDeAlumno(Long alumnoId) {
        Optional<Alumno> alumnoOpt = alumnoRepository.findById(alumnoId);
        if (alumnoOpt.isPresent()) {
            return alumnoOpt.get().getCursos();
        } else {
            throw new RuntimeException("Alumno no encontrado");
        }
    }
}
