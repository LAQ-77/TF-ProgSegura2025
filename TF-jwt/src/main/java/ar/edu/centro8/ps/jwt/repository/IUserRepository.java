package ar.edu.centro8.ps.jwt.repository;

import ar.edu.centro8.ps.jwt.model.UserSec;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<UserSec, Long> {
    /**
     * Busca un usuario por su nombre de usuario.
     * Utiliza EntityGraph para cargar los roles y permisos asociados al usuario.
     * Garantiza que al buscar el usuario, también se cargan sus roles y los 
     * permisos de esos roles, todo junto en un unico join.
     *
     * @param username el nombre de usuario a buscar
     * @return un Optional que contiene el UserSec si se encuentra, o vacío si no
     */
    @EntityGraph(attributePaths = {"rolesList", "rolesList.permissionsList"})
    Optional<UserSec> findUserEntityByUsername(String username);

    Optional<UserSec> findByUsername(String username);

}