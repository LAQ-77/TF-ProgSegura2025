package ar.edu.centro8.ps.jwt.security.config;

import ar.edu.centro8.ps.jwt.model.UserSec;
import ar.edu.centro8.ps.jwt.repository.IUserRepository;
import ar.edu.centro8.ps.jwt.utils.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private IUserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String username = oauth2User.getAttribute("login");
        
        // Buscar el usuario en la base de datos
        Optional<UserSec> userOpt = userRepository.findUserEntityByUsername(username);
        
        if (userOpt.isPresent()) {
            UserSec user = userOpt.get();
            
            // Generar JWT token
            String accessToken = jwtUtils.createToken(user.getUsername());
            
            // Redirigir al frontend con el token como parámetro
            String redirectUrl = "http://localhost:3000/oauth2/redirect?token=" + accessToken;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } else {
            // Redirigir con error si el usuario no se encuentra
            String redirectUrl = "http://localhost:3000/oauth2/redirect?error=user_not_found";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
    }
}

