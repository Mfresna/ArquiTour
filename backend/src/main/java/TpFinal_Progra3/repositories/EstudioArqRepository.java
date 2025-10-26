package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.EstudioArq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EstudioArqRepository extends JpaRepository<EstudioArq, Long>, JpaSpecificationExecutor<EstudioArq> {

    Optional<EstudioArq> findByNombreIgnoreCase(String nombre);
    List<EstudioArq> findByNombreContainingIgnoreCase(String nombre);
}
