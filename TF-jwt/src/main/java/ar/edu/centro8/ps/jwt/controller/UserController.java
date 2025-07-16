package ar.edu.centro8.ps.jwt.controller;

import ar.edu.centro8.ps.jwt.model.Role;
import ar.edu.centro8.ps.jwt.model.UserSec;
import ar.edu.centro8.ps.jwt.service.IRoleService;
import ar.edu.centro8.ps.jwt.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private IUserService userService;

    @Autowired
    private IRoleService roleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_USER')")
    public ResponseEntity<List<UserSec>> getAllUsers() {
        List<UserSec> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_USER')")
    public ResponseEntity<UserSec> getUserById(@PathVariable Long id) {
        Optional<UserSec> user = userService.findById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_USER')")
    public ResponseEntity<UserSec> createUser(@RequestBody UserSec userSec) {

        Set<Role> roleList = new HashSet<Role>();
        Role readRole;

        // encriptamos contraseña
        userSec.setPassword(userService.encriptPassword(userSec.getPassword()));

        // Recuperar la Permission/s por su ID
        for (Role role : userSec.getRolesList()) {
            readRole = roleService.findById(role.getId()).orElse(null);
            if (readRole != null) {
                // si encuentro, guardo en la lista
                roleList.add(readRole);
            }
        }

        if (!roleList.isEmpty()) {
            userSec.setRolesList(roleList);

            UserSec newUser = userService.save(userSec);
            return ResponseEntity.ok(newUser);
        }
        return null;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_USER')")
    public ResponseEntity<UserSec> updateUser(@PathVariable Long id, @RequestBody UserSec userSec) {
        Optional<UserSec> existingUser = userService.findById(id);
        if (existingUser.isPresent()) {
            userSec.setId(id);

            Set<Role> roleList = new HashSet<Role>();
            Role readRole;

            // Si se proporciona una nueva contraseña, encriptarla
            if (userSec.getPassword() != null && !userSec.getPassword().isEmpty()) {
                userSec.setPassword(userService.encriptPassword(userSec.getPassword()));
            } else {
                // Mantener la contraseña existente
                userSec.setPassword(existingUser.get().getPassword());
            }

            // Recuperar los roles por su ID
            for (Role role : userSec.getRolesList()) {
                readRole = roleService.findById(role.getId()).orElse(null);
                if (readRole != null) {
                    roleList.add(readRole);
                }
            }

            if (!roleList.isEmpty()) {
                userSec.setRolesList(roleList);
                UserSec updatedUser = userService.save(userSec);
                return ResponseEntity.ok(updatedUser);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_USER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<UserSec> user = userService.findById(id);
        if (user.isPresent()) {
            userService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}