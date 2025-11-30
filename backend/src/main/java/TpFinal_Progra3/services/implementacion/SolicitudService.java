package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.SolicitudesException;
import TpFinal_Progra3.model.DTO.filtros.UsuarioFiltroDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqResponseDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.SolicitudCambioRolArq;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoNotificacion;
import TpFinal_Progra3.model.mappers.SolicitudMapper;
import TpFinal_Progra3.repositories.SolicitudArqRepository;
import TpFinal_Progra3.security.model.DTO.RolesDTO;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudArqRepository solicitudRepository;
    private final SolicitudMapper solicitudMapper;
    private final UsuarioService usuarioService;
    private final ImagenService imagenService;
    private final NotificacionService notificacionService;

    @Transactional
    public SolicitudArqResponseDTO crearSolicitud(HttpServletRequest request,
                                                  SolicitudArqDTO dto,
                                                  List<MultipartFile> archivos) {

        System.out.println("HOLA 1");
        Usuario usuario = usuarioService.buscarUsuario(request);

        if (solicitudRepository.existsByUsuarioIdAndEstado(usuario.getId(), EstadoSolicitud.PENDIENTE)) {
            throw new SolicitudesException(HttpStatus.BAD_REQUEST, "Ya tenés una solicitud pendiente.");
        }
        System.out.println("HOLA 2");
        List<Imagen> imagenes = imagenService.subirArchivosMixtos(archivos);

        if(imagenes.isEmpty()){
            throw new SolicitudesException(HttpStatus.NOT_ACCEPTABLE, "Las imagenes son Obligatorias");
        }

        SolicitudCambioRolArq solicitud = SolicitudCambioRolArq.builder()
                .usuario(usuario)
                .matriculaArquitecto(dto.getMatriculaArquitecto())
                .universidad(dto.getUniversidad())
                .anioRecibido(dto.getAnioRecibido())
                .imagenesSolicitud(imagenes)
                .estado(EstadoSolicitud.PENDIENTE)
                .build();

        solicitudRepository.save(solicitud);

        //Notifico a los Administradores
        UsuarioFiltroDTO filtro = new UsuarioFiltroDTO();
        filtro.setRol(RolUsuario.ROLE_ADMINISTRADOR);
        List<Usuario> admins = usuarioService.filtrarUsuarios(filtro);


        notificacionService.notificacionMasiva(
                usuario,
                admins,
                "Nueva solicitud de cambio de rol a arquitecto",
                TipoNotificacion.SOLICITUD_CAMBIO_ROL,
                solicitud.getId());


        return solicitudMapper.mapResponseDTO(solicitud);
    }


    // ========== 2) TOMAR SOLICITUD (EN_PROCESO) ==========

    @Transactional
    public SolicitudArqResponseDTO tomarSolicitud(HttpServletRequest request, Long solicitudId) {

        Usuario admin = usuarioService.buscarUsuario(request);

        SolicitudCambioRolArq solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada."));

        if (solicitud.getEstado() == EstadoSolicitud.PENDIENTE) {
            solicitud.setEstado(EstadoSolicitud.EN_PROCESO);
            solicitud.setAdminAsignado(admin);
            solicitudRepository.save(solicitud);
        } else if (solicitud.getEstado() == EstadoSolicitud.EN_PROCESO) {
            if (solicitud.getAdminAsignado() == null ||
                    !solicitud.getAdminAsignado().getId().equals(admin.getId())) {
                throw new SolicitudesException(HttpStatus.CONFLICT,
                        "La solicitud ya está siendo gestionada por otro administrador.");
            }
           //Si es el mismo admin lo dejamos como es
        } else {
            throw new SolicitudesException(HttpStatus.BAD_REQUEST,
                    "La solicitud ya fue resuelta.");
        }

        return solicitudMapper.mapResponseDTO(solicitud);
    }

    // ========== 3) RESOLVER SOLICITUD (APROBAR / RECHAZAR) ==========

    @Transactional
    public SolicitudArqResponseDTO resolverSolicitud(HttpServletRequest request,
                                                     Long solicitudId,
                                                     boolean aprobada,
                                                     String motivo) {

        Usuario admin = usuarioService.buscarUsuario(request);

        SolicitudCambioRolArq solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada."));

        if (solicitud.getEstado() != EstadoSolicitud.EN_PROCESO && solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new SolicitudesException(HttpStatus.BAD_REQUEST, "La solicitud ya fue resuelta.");
        }

        if (solicitud.getAdminAsignado() == null ||
                !solicitud.getAdminAsignado().getId().equals(admin.getId())) {
            throw new SolicitudesException(HttpStatus.FORBIDDEN, "Solo el administrador asignado puede resolver esta solicitud.");
        }

        String mensajeNotificacion;

        if (aprobada) {
            solicitud.setEstado(EstadoSolicitud.APROBADA);
            solicitud.setFechaResolucion(LocalDate.now());
            solicitud.setComentarioAdmin(motivo);

            // Agregar rol ARQUITECTO al usuario
            usuarioService.agregarRoles(
                    request,
                    solicitud.getUsuario().getId(),
                    RolesDTO.builder()
                            .roles(List.of(RolUsuario.ROLE_ARQUITECTO))
                            .build()
            );

            mensajeNotificacion = "Tu solicitud de cambio de rol fue APROBADA.";
        } else {
            solicitud.setEstado(EstadoSolicitud.RECHAZADA);
            solicitud.setFechaResolucion(LocalDate.now());
            solicitud.setComentarioAdmin(motivo);

            mensajeNotificacion = "Tu solicitud de cambio de rol fue RECHAZADA. Motivo: " + motivo;
        }

        solicitudRepository.save(solicitud);

        notificacionService.crearNotificacionAutomatica(
                admin,
                solicitud.getUsuario(),
                mensajeNotificacion,
                TipoNotificacion.RESPUESTA_CAMBIO_ROL,
                solicitud.getId()
        );

        return solicitudMapper.mapResponseDTO(solicitud);
    }

}
