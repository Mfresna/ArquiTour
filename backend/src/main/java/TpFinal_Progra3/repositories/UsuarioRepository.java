package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

    // Buscar por email directo en la entidad Usuario
    Optional<Usuario> findByEmailIgnoreCase(String email);

    // Buscar por estado activo
    List<Usuario> findByIsActivoTrue();
    List<Usuario> findByIsActivoFalse();

    // Buscar por nombre o apellido
    List<Usuario> findByNombreIgnoreCase(String nombre);
    List<Usuario> findByApellidoIgnoreCase(String apellido);

    // Ver si existe un usuario por email
    boolean existsByEmailIgnoreCase(String email);

    // Buscar usuarios que pertenezcan a un estudio
    List<Usuario> findByEstudiosContaining(EstudioArq estudio);

//    // Buscar usuarios por ID de estudio (si usás proyección)
//    List<UsuarioBasicoProjection> findByEstudiosId(Long estudioId);
//
//    // Buscar proyección básica de usuario por email
//    Optional<UsuarioBasicoProjection> findProjectedByEmail(String email);
}
