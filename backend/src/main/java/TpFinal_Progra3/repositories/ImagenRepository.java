package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.Imagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagenRepository extends JpaRepository<Imagen, Long> {

    Optional<Imagen> findByUrl(String url);
    boolean existsByUrl(String url);
}
