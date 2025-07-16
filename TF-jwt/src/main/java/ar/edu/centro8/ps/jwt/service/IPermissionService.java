package ar.edu.centro8.ps.jwt.service;

import ar.edu.centro8.ps.jwt.model.Permission;

import java.util.List;
import java.util.Optional;

public interface IPermissionService {

    List<Permission> findAll();

    Optional<Permission> findById(Long id);

    Permission save(Permission permission);

    void deleteById(Long id);

    Permission update(Permission permission);

}
