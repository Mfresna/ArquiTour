package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.SolicitudCambioRolArq;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudArqRepository extends JpaRepository<SolicitudCambioRolArq, Long> {

    boolean existsByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndEstado(Long usuarioId, EstadoSolicitud estado);

    List<SolicitudCambioRolArq> findByEstadoOrderByFechaCreacionAsc(EstadoSolicitud estado);

    List<SolicitudCambioRolArq> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    List<SolicitudCambioRolArq> findByEstado(EstadoSolicitud estado);
}
