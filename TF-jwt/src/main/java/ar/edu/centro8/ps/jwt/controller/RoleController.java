package ar.edu.centro8.ps.jwt.controller;

import ar.edu.centro8.ps.jwt.model.Role;
import ar.edu.centro8.ps.jwt.model.Permission;
import ar.edu.centro8.ps.jwt.service.IPermissionService;
import ar.edu.centro8.ps.jwt.service.IRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private IRoleService roleService;

    @Autowired
    private IPermissionService permiService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_ROLE')")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.findAll();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('READ_ROLE')")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        Optional<Role> role = roleService.findById(id);
        return role.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_ROLE')")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Set<Permission> permiList = new HashSet<Permission>();
        Permission readPermission;

        // Recuperar la Permission/s por su ID
        for (Permission per : role.getPermissionsList()) {
            readPermission = permiService.findById(per.getId()).orElse(null);
            if (readPermission != null) {
                // si encuentro, guardo en la lista
                permiList.add(readPermission);
            }
        }

        role.setPermissionsList(permiList);
        Role newRole = roleService.save(role);
        return ResponseEntity.ok(newRole);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_ROLE')")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        Role rol = roleService.findById(id).orElse(null);
        if (rol != null) {
            rol.setRole(role.getRole());
            // Procesar permisos igual que en createRole
            Set<Permission> permiList = new HashSet<>();
            for (Permission per : role.getPermissionsList()) {
                Permission perm = permiService.findById(per.getId()).orElse(null);
                if (perm != null) {
                    permiList.add(perm);
                }
            }
            rol.setPermissionsList(permiList);
            roleService.update(rol);
            return ResponseEntity.ok(rol);
        }
        return ResponseEntity.notFound().build();
    }

}
