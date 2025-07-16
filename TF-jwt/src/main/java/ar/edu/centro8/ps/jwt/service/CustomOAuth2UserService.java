package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Role;
import ar.edu.centro8.ps.jwt.model.UserSec;
import ar.edu.centro8.ps.jwt.repository.IRoleRepository;
import ar.edu.centro8.ps.jwt.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IRoleService roleService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // Obtener información del usuario de GitHub
        String githubId = oauth2User.getAttribute("id").toString();
        String username = oauth2User.getAttribute("login");
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        // Buscar si el usuario ya existe en la base de datos
        Optional<UserSec> existingUser = userRepository.findByUsername(username);
        
        UserSec user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // Crear nuevo usuario si no existe
            user = new UserSec();
            user.setUsername(username);
            user.setPassword(""); // No necesitamos password para OAuth2
            user.setEnabled(true);
            user.setAccountNotExpired(true);
            user.setAccountNotLocked(true);
            user.setCredentialNotExpired(true);
            
            // Asignar rol por defecto (USER)
            Set<Role> roles = new HashSet<>();
            Optional<Role> userRole = roleService.findByRole("USER");
            if (userRole.isPresent()) {
                roles.add(userRole.get());
            } else {
                // Crear rol USER si no existe
                Role newRole = new Role();
                newRole.setRole("USER");
                newRole.setPermissionsList(new HashSet<>());
                Role savedRole = roleService.save(newRole);
                roles.add(savedRole);
            }
            user.setRolesList(roles);
            
            // Guardar el usuario
            userRepository.save(user);
        }
        
        return oauth2User;
    }
}

