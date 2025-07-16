package ar.edu.centro8.ps.jwt.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "alumnos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Column(unique = true, nullable = false, length = 20)
    @NotBlank(message = "El DNI es obligatorio")
    private String dni;

    @Column(unique = true, nullable = false, length = 100)
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @Column(length = 200)
    private String direccion;

    @Column(nullable = false)
    private LocalDate fechaInscripcion = LocalDate.now();

    @Column(nullable = false)
    private Boolean activo = true;

    // Relación muchos a muchos con Curso
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "alumno_curso", joinColumns = @JoinColumn(name = "alumno_id"), inverseJoinColumns = @JoinColumn(name = "curso_id"))
    private List<Curso> cursos = new ArrayList<>();

}
