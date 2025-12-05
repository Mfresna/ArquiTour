package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.entities.solicitudes.Solicitud;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long>, JpaSpecificationExecutor<Solicitud> {

    boolean existsByUsuario_Id(Long usuarioId);
    boolean existsByUsuario_IdAndEstado(Long usuarioId, EstadoSolicitud estado);
    boolean existsByUsuario_IdAndTipoAndEstado(Long usuarioId,EstadoSolicitud estado, TipoSolicitud tipo );

    List<Solicitud> findByEstado(EstadoSolicitud estado);
    List<Solicitud> findByUsuario(Usuario usuario);


}
