package ar.edu.centro8.ps.jwt.controller;

import ar.edu.centro8.ps.jwt.dto.AuthResponseDTO;
import ar.edu.centro8.ps.jwt.model.UserSec;
import ar.edu.centro8.ps.jwt.repository.IUserRepository;
import ar.edu.centro8.ps.jwt.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/oauth2")
public class OAuth2Controller {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/success")
    public ResponseEntity<AuthResponseDTO> oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            // Obtener el username del usuario autenticado con OAuth2
            String username = oauth2User.getAttribute("login");
            
            // Buscar el usuario en la base de datos
            Optional<UserSec> userOpt = userRepository.findUserEntityByUsername(username);
            
            if (userOpt.isPresent()) {
                UserSec user = userOpt.get();
                
                // Generar JWT token
                String accessToken = jwtUtils.createToken(user.getUsername());
                
                // Crear respuesta
                AuthResponseDTO authResponse = new AuthResponseDTO(
                    user.getUsername(),
                    "Usuario autenticado correctamente con GitHub",
                    accessToken,
                    true
                );
                
                return ResponseEntity.ok(authResponse);
            } else {
                // Usuario no encontrado en la base de datos
                AuthResponseDTO authResponse = new AuthResponseDTO(
                    username,
                    "Usuario no encontrado en la base de datos",
                    "",
                    false
                );
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authResponse);
            }
        } catch (Exception e) {
            // Error en el proceso de autenticación
            AuthResponseDTO authResponse = new AuthResponseDTO(
                "",
                "Error en la autenticación OAuth2: " + e.getMessage(),
                "",
                false
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(authResponse);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getOAuth2User(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            return ResponseEntity.ok(oauth2User.getAttributes());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
    }
}

