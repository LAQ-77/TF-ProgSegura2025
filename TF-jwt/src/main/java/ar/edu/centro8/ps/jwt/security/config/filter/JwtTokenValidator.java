package ar.edu.centro8.ps.jwt.security.config.filter;

import com.auth0.jwt.interfaces.DecodedJWT;
import ar.edu.centro8.ps.jwt.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

//mediante el extends establecemos que es un filtro que se tiene que ejecutar siempre
public class JwtTokenValidator extends OncePerRequestFilter {

    private JwtUtils jwtUtils;

    public JwtTokenValidator(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // importante: el nonnull debe ser de sringframework, no lombok
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Excluir el endpoint de login del filtro JWT
        String path = request.getRequestURI();
        if ("/auth/login".equals(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        // en el encabezado antes del token viene la palabra bearer (esquema de
        // autenticación)
        // por lo que debemos sacarlo
        if (jwtToken != null && jwtToken.startsWith("Bearer ")) {
            jwtToken = jwtToken.substring(7); // Quita "Bearer "
            DecodedJWT decodedJWT = jwtUtils.validateToken(jwtToken);
            // si el token es válido, le concedemos el acceso
            // extraemos el username y los authorities del token decodificado

            // 🔽 LOG: mostrar token recibido
            System.out.println("🔐 Token recibido: " + jwtToken);
            String username = jwtUtils.extractUsername(decodedJWT);
            String authorities = jwtUtils.getSpecificClaim(decodedJWT, "authorities").asString();
            // Si todo está ok, hay que setearlo en el Context Holder
            // Para eso tengo que convertirlos a GrantedAuthority
            // 🔽 LOG: mostrar información decodificada
            System.out.println("👤 Usuario extraído del token: " + username);
            System.out.println("🔑 Authorities extraídos: " + authorities);

            Collection<? extends GrantedAuthority> authoritiesList = AuthorityUtils
                    .commaSeparatedStringToAuthorityList(authorities);

            SecurityContext context = SecurityContextHolder.getContext();
            Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authoritiesList);
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            // SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        // si no viene el token, va al siguiente filtro
        filterChain.doFilter(request, response);
    }

}
