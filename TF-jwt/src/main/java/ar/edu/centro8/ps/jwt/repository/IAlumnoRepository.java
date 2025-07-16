package ar.edu.centro8.ps.jwt.repository;

import ar.edu.centro8.ps.jwt.model.Alumno;
import ar.edu.centro8.ps.jwt.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IAlumnoRepository extends JpaRepository<Alumno, Long> {

    // Buscar alumnos activos
    List<Alumno> findByActivoTrue();

    // Buscar alumno por DNI
    Optional<Alumno> findByDni(String dni);

    // Buscar alumno por email
    Optional<Alumno> findByEmail(String email);

    // Buscar alumnos por curso
    @Query("SELECT a FROM Alumno a JOIN a.cursos c WHERE c = :curso")
    List<Alumno> findByCurso(@Param("curso") Curso curso);

    // Buscar alumnos por curso ID
    @Query("SELECT a FROM Alumno a JOIN a.cursos c WHERE c.id = :cursoId")
    List<Alumno> findByCursoId(@Param("cursoId") Long cursoId);

    // Buscar alumnos por nombre o apellido
    @Query("SELECT a FROM Alumno a WHERE a.nombre LIKE %:termino% OR a.apellido LIKE %:termino%")
    List<Alumno> findByNombreOrApellidoContaining(@Param("termino") String termino);

    // Buscar alumnos activos por curso
    @Query("SELECT a FROM Alumno a JOIN a.cursos c WHERE c.id = :cursoId AND a.activo = true")
    List<Alumno> findActivosByCursoId(@Param("cursoId") Long cursoId);

    // Contar alumnos por curso
    @Query("SELECT COUNT(a) FROM Alumno a JOIN a.cursos c WHERE c.id = :cursoId AND a.activo = true")
    Long countActivosByCursoId(@Param("cursoId") Long cursoId);
}
