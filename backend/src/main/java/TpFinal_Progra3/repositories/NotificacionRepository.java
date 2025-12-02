package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByReceptor_Id(Long receptorIdr);
    List<Notificacion> findByEmisor_Id(Long emisorId);

    //Si es leido
    List<Notificacion> findByReceptor_IdAndIsLeidoFalse(Long receptorId);
    List<Notificacion> findByReceptor_IdAndIsLeidoTrue(Long receptorId);

}
