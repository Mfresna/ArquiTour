package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.solicitudes.SolicitudNuevaDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudResponseDTO;
import TpFinal_Progra3.model.entities.*;
import TpFinal_Progra3.model.entities.solicitudes.Solicitud;
import TpFinal_Progra3.model.entities.solicitudes.SolicitudAltaArquitecto;
import TpFinal_Progra3.model.entities.solicitudes.SolicitudBajaRol;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;


import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SolicitudMapper {

    private final UsuarioMapper usuarioMapper;


    // =============================================== de DTO a Entidades

    // de SolicitudNueva a Solicitud Arqui
    public SolicitudAltaArquitecto mapSolicitudArq (SolicitudNuevaDTO dto, List<Imagen> imagenes, Usuario usr){
        return SolicitudAltaArquitecto.builder()
                .matriculaArquitecto(dto.getMatriculaArquitecto())
                .universidad(dto.getUniversidad())
                .anioRecibido(dto.getAnioRecibido())
                .imagenesSolicitud(imagenes)
                .usuario(usr)
                .tipo(TipoSolicitud.ALTA_ARQUITECTO)
                .build();
    }

    // de SolicitudNueva a Solicitud Baja Rol
    public SolicitudBajaRol mapSolicitudBajaRol (SolicitudNuevaDTO dto, Usuario usr){
        return SolicitudBajaRol.builder()
                .usuario(usr)
                .rolAEliminar(dto.getRolAEliminar())
                .motivo(dto.getMotivo())
                .tipo(TipoSolicitud.BAJA_ROL)
                .build();
    }

    // =============================================== de Entidades a DTO

    // de Entidad a DTO
    public SolicitudResponseDTO mapToDTO(Solicitud solicitud){

        // ====== CAMPOS COMUNES ======
        SolicitudResponseDTO dto = SolicitudResponseDTO.builder()
                .id(solicitud.getId())
                .estado(solicitud.getEstado())
                .usuario(usuarioMapper.mapBasicoDTO(solicitud.getUsuario()))
                .adminAsignado(solicitud.getAdminAsignado() != null
                        ? usuarioMapper.mapBasicoDTO(solicitud.getAdminAsignado())
                        : null)
                .fechaCreacion(solicitud.getFechaCreacion())
                .fechaResolucion(solicitud.getFechaResolucion())
                .comentarioRta(solicitud.getComentarioAdmin())
                .idUsuario(
                    solicitud.getUsuario() != null
                            ? solicitud.getUsuario().getId()
                            : null
                )
                .idAdminAsignado(
                        solicitud.getAdminAsignado() != null
                                ? solicitud.getAdminAsignado().getId()
                                : null
                )
                .build();

        // ====== CAMPOS SEGÚN TIPO ======
        if (solicitud instanceof SolicitudAltaArquitecto alta) {

            dto.setTipoSolicitud(TipoSolicitud.ALTA_ARQUITECTO);
            dto.setMatriculaArquitecto(alta.getMatriculaArquitecto());
            dto.setUniversidad(alta.getUniversidad());
            dto.setAnioRecibido(alta.getAnioRecibido());

            if (alta.getImagenesSolicitud() != null) {
                dto.setUrlsImagenes(alta.getImagenesSolicitud().stream().map(Imagen::getUrl).toList());
            }

        } else if (solicitud instanceof SolicitudBajaRol baja) {

            dto.setTipoSolicitud(TipoSolicitud.BAJA_ROL);

            dto.setRolBaja(baja.getRolAEliminar());
            dto.setMotivo(baja.getMotivo());
        }

        return dto;
    }

}

