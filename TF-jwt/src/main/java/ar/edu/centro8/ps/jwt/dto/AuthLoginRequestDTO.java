package ar.edu.centro8.ps.jwt.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequestDTO (@NotBlank String username, @NotBlank String password) {
}
