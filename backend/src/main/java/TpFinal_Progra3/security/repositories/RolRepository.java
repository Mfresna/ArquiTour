package TpFinal_Progra3.security.repositories;

import TpFinal_Progra3.security.model.entities.Rol;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    // Buscar rol por su nombre (enum)
    Optional<Rol> findByRol(RolUsuario rol);

    // Verificar si existe un rol
    boolean existsByRol(RolUsuario rol);
}
