package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqResponseDTO;
import TpFinal_Progra3.model.entities.*;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SolicitudMapper {

    // de DTO a Entidad
    public SolicitudCambioRolArq mapSolicitud(SolicitudArqDTO dto, Usuario usuario, List<Imagen> imagenes) {
        return SolicitudCambioRolArq.builder()
                .usuario(usuario)
                .matriculaArquitecto(dto.getMatriculaArquitecto())
                .universidad(dto.getUniversidad())
                .anioRecibido(dto.getAnioRecibido())
                .imagenesSolicitud(imagenes)
                .estado(EstadoSolicitud.PENDIENTE)
                .build();
    }

    // de Entidad a DTO response
    public SolicitudArqResponseDTO mapResponseDTO(SolicitudCambioRolArq solic) {
        return SolicitudArqResponseDTO.builder()
                .id(solic.getId())
                .matriculaArquitecto(solic.getMatriculaArquitecto())
                .universidad(solic.getUniversidad())
                .anioRecibido(solic.getAnioRecibido())
                .imagenesUrls(
                        solic.getImagenesSolicitud() != null
                                ? solic.getImagenesSolicitud().stream().map(Imagen::getUrl).toList()
                                : List.of()
                )
                .estado(solic.getEstado())
                .fechaCreacion(solic.getFechaCreacion())
                .fechaResolucion(solic.getFechaResolucion())
                .usuarioId(solic.getUsuario().getId())
                .adminId(
                        solic.getAdminAsignado() != null
                                ? solic.getAdminAsignado().getId()
                                : null
                )
                .build();
    }
}

