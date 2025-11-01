package TpFinal_Progra3.security.repositories;

import TpFinal_Progra3.security.model.entities.ValidacionEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface ValidacionEmailRepository extends JpaRepository<ValidacionEmail, Long> {
    Optional<ValidacionEmail> findByEmail(String email);

}


