package ar.edu.centro8.ps.jwt.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El nombre del curso es obligatorio")
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @Column(nullable = false)
    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @Column(nullable = false)
    @NotNull(message = "La duración en horas es obligatoria")
    private Integer duracionHoras;

    @Column(length = 100)
    private String instructor;

    @Column(nullable = false)
    private Boolean activo = true;

    // Relación muchos a muchos con Alumno
    @ManyToMany(mappedBy = "cursos", fetch = FetchType.LAZY)
    @JsonIgnore
    //@JoinTable(name = "alumno_curso", joinColumns = @JoinColumn(name = "alumno_id"), inverseJoinColumns = @JoinColumn(name = "curso_id"))
    private List<Alumno> alumnos = new ArrayList<>();

    //@ManyToMany
    //@JoinTable(name = "alumno_curso", joinColumns = @JoinColumn(name = "alumno_id"), inverseJoinColumns = @JoinColumn(name = "curso_id"))
    //@JsonManagedReference
    //private List<Curso> cursos = new ArrayList<>();

}
