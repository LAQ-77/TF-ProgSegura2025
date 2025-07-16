package ar.edu.centro8.ps.jwt.repository;

import ar.edu.centro8.ps.jwt.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ICursoRepository extends JpaRepository<Curso, Long> {
    
    // Buscar cursos activos
    List<Curso> findByActivoTrue();
    
    // Buscar curso por nombre
    Optional<Curso> findByNombre(String nombre);
    
    // Buscar cursos por instructor
    List<Curso> findByInstructorContainingIgnoreCase(String instructor);
    
    // Buscar cursos por rango de fechas
    @Query("SELECT c FROM Curso c WHERE c.fechaInicio >= :fechaInicio AND c.fechaFin <= :fechaFin")
    List<Curso> findByFechaRange(LocalDate fechaInicio, LocalDate fechaFin);
    
    // Buscar cursos activos con alumnos
    @Query("SELECT c FROM Curso c LEFT JOIN FETCH c.alumnos WHERE c.activo = true")
    List<Curso> findActiveCursosWithAlumnos();
}

