package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.solicitudes.Solicitud;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudArqRepository extends JpaRepository<Solicitud, Long> {

    boolean existsByUsuario_Id(Long usuarioId);
    boolean existsByUsuario_IdAndEstado(Long usuarioId, EstadoSolicitud estado);

    List<Solicitud> findByEstadoOrderByFechaCreacionAsc(EstadoSolicitud estado);

    List<Solicitud> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    List<Solicitud> findByEstado(EstadoSolicitud estado);

    List<Solicitud> findByUniversidad(String universidad);

    List<Solicitud> findByMatriculaArquitecto(String matriculaArquitecto);

}

