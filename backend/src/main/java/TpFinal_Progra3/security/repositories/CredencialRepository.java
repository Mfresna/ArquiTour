package TpFinal_Progra3.security.repositories;

import TpFinal_Progra3.security.model.entities.Credencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    // Buscar por email (es el username)
    Optional<Credencial> findByEmail(String email);

    // Verificar existencia por email
    boolean existsByEmail(String email);
}
