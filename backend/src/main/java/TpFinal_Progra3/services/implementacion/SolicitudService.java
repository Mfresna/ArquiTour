package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.SolicitudesException;
import TpFinal_Progra3.model.DTO.filtros.SolicitudFiltroDTO;
import TpFinal_Progra3.model.DTO.filtros.UsuarioFiltroDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudNuevaDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudResolucionDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudResponseDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.solicitudes.Solicitud;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.entities.solicitudes.SolicitudAltaArquitecto;
import TpFinal_Progra3.model.entities.solicitudes.SolicitudBajaRol;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoNotificacion;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import TpFinal_Progra3.model.mappers.SolicitudMapper;
import TpFinal_Progra3.repositories.SolicitudRepository;
import TpFinal_Progra3.security.model.DTO.RolesDTO;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.specifications.SolicitudSpecification;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final SolicitudMapper solicitudMapper;
    private final UsuarioService usuarioService;
    private final ImagenService imagenService;
    private final NotificacionService notificacionService;

    @Transactional
    public SolicitudResponseDTO nuevaSolicitud(HttpServletRequest request,
                                               SolicitudNuevaDTO dto,
                                               List<MultipartFile> archivos) {

        Usuario usuario = usuarioService.buscarUsuario(request);

        if (dto.getTipo() == TipoSolicitud.ALTA_ARQUITECTO) {
            if (solicitudRepository.existsByUsuario_IdAndTipoAndEstado(usuario.getId(), dto.getTipo(), EstadoSolicitud.PENDIENTE)) {
                throw new SolicitudesException(HttpStatus.BAD_REQUEST, "Ya tenés una solicitud de ALTA pendiente.");
            }

        } else if (dto.getTipo() == TipoSolicitud.BAJA_ROL) {

            solicitudRepository.findByUsuario_IdAndTipoAndEstado(usuario.getId(), dto.getTipo(), EstadoSolicitud.PENDIENTE)
                    .ifPresent((s)->{
                        if(((SolicitudBajaRol) s).getRolAEliminar() == dto.getRolAEliminar()){
                            throw new SolicitudesException(HttpStatus.BAD_REQUEST, "Ya tenés una solicitud de BAJA pendiente para el rol " + dto.getRolAEliminar());
                        }
                    }
            );
        }


        Solicitud solicitud;

        if (dto.getTipo() == TipoSolicitud.ALTA_ARQUITECTO) {
            //Solicita ser Arqui

            if(usuario.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ARQUITECTO)){
                throw new SolicitudesException(HttpStatus.NOT_ACCEPTABLE, "Ya es Arquitecto");
            }

            List<Imagen> imagenes = imagenService.subirArchivosMixtos(archivos);
            if (imagenes.isEmpty()) {
                throw new SolicitudesException(HttpStatus.NO_CONTENT, "Las imagenes son Obligatorias");
            }
            solicitud = solicitudMapper.mapSolicitudArq(dto, imagenes, usuario);

        } else if (dto.getTipo() == TipoSolicitud.BAJA_ROL) {
            //Solicita baja de algun rol
            solicitud = solicitudMapper.mapSolicitudBajaRol(dto, usuario);

        } else {
            throw new SolicitudesException(HttpStatus.NOT_ACCEPTABLE, "Tipo de solicitud no soportado");
        }

        solicitudRepository.save(solicitud);

        //Notifico a los Administradores
        UsuarioFiltroDTO filtro = new UsuarioFiltroDTO();
        filtro.setRol(RolUsuario.ROLE_ADMINISTRADOR);
        List<Usuario> admins = usuarioService.filtrarUsuarios(filtro);

        //Si el usuario es Admin no le mando la notificacion (él mismo no se puede aceptar)
        if (usuario.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR)) {
            admins = admins.stream().filter(a -> !a.equals(usuario)).toList();
        }

        notificacionService.crearNotificacionMultiples(
                usuario,
                admins,
                dto.getTipo().getDescripcion(),
                TipoNotificacion.SOLICITUD_CAMBIO_ROL,
                solicitud.getId());


        return solicitudMapper.mapToDTO(solicitud);
    }

    // ========== 2) TOMAR SOLICITUD (EN_PROCESO) ==========
    @Transactional
    public SolicitudResponseDTO tomarSolicitud(HttpServletRequest request, Long solicitudId) {

        Usuario admin = usuarioService.buscarUsuario(request);

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada."));

        if (solicitud.getUsuario().equals(admin)) {
            throw new SolicitudesException(HttpStatus.NOT_MODIFIED, "No se puede Autoaceptar la Solicitud");
        }

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

        return solicitudMapper.mapToDTO(solicitud);
    }

    // ========== 3) RESOLVER SOLICITUD (APROBAR / RECHAZAR) ==========
    // @Transactional
    // public Solicitud resolverSolicitud(HttpServletRequest request,
    //                                               Long solicitudId,
    //                                               SolicitudResolucionDTO resolucion) {

    //     Usuario admin = usuarioService.buscarUsuario(request);

    //     Solicitud solicitud = solicitudRepository.findById(solicitudId)
    //             .orElseThrow(() -> new NotFoundException("Solicitud no encontrada."));

    //     if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
    //         throw new SolicitudesException(HttpStatus.BAD_REQUEST, "La solicitud ya fue resuelta.");
    //     }

    //     if (solicitud.getAdminAsignado() == null ||
    //             !solicitud.getAdminAsignado().getId().equals(admin.getId())) {
    //         throw new SolicitudesException(HttpStatus.FORBIDDEN, "Solo el administrador asignado puede resolver esta solicitud.");
    //     }

    //     solicitud.setAdminAsignado(admin);
    //     solicitud.setComentarioAdmin(resolucion.getComentarioAdmin());
    //     solicitud.setFechaResolucion(LocalDate.now());
    //     solicitud.setEstado(resolucion.isAceptar() ? EstadoSolicitud.APROBADA : EstadoSolicitud.RECHAZADA);


    //     String mensajeNotificacion = "Su Solicitud fue RECHAZADA";

    //     if (resolucion.isAceptar()) {
    //         aplicarEfectoSolicitud(request, solicitud);
    //         mensajeNotificacion = "Su Solicitud fue APROBADA";
    //     }

    //     notificacionService.crearNotificacion(
    //             admin,
    //             solicitud.getUsuario(),
    //             mensajeNotificacion,
    //             TipoNotificacion.RESPUESTA_CAMBIO_ROL,
    //             solicitud.getId()
    //     );

    //     return solicitudRepository.save(solicitud);
    // }

    // ========== 3) RESOLVER SOLICITUD (APROBAR / RECHAZAR) ==========
    @Transactional
    public Solicitud resolverSolicitud(HttpServletRequest request,
                                    Long solicitudId,
                                    SolicitudResolucionDTO resolucion) {

        Usuario admin = usuarioService.buscarUsuario(request);

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada."));

        // 🔴 Solo se puede resolver si está EN_PROCESO
        if (solicitud.getEstado() != EstadoSolicitud.EN_PROCESO) {
            throw new SolicitudesException(HttpStatus.BAD_REQUEST,
                    "La solicitud debe estar EN_PROCESO para poder ser resuelta.");
        }

        // 🔒 Solo el admin asignado puede resolverla
        if (solicitud.getAdminAsignado() == null ||
                !solicitud.getAdminAsignado().getId().equals(admin.getId())) {
            throw new SolicitudesException(HttpStatus.FORBIDDEN,
                    "Solo el administrador asignado puede resolver esta solicitud.");
        }

        solicitud.setComentarioAdmin(resolucion.getComentarioAdmin());
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setEstado(resolucion.isAceptar()
                ? EstadoSolicitud.APROBADA
                : EstadoSolicitud.RECHAZADA);

        String mensajeNotificacion = "Su Solicitud fue RECHAZADA";

        if (resolucion.isAceptar()) {
            aplicarEfectoSolicitud(request, solicitud);
            mensajeNotificacion = "Su Solicitud fue APROBADA";
        }

        notificacionService.crearNotificacion(
                admin,
                solicitud.getUsuario(),
                mensajeNotificacion,
                TipoNotificacion.RESPUESTA_CAMBIO_ROL,
                solicitud.getId()
        );

        return solicitudRepository.save(solicitud);
    }


    private void aplicarEfectoSolicitud(HttpServletRequest request, Solicitud solicitud) {

        if (solicitud instanceof SolicitudAltaArquitecto) {
            // agregar rol arquitecto
            usuarioService.agregarRoles(request,
                    solicitud.getUsuario().getId(),
                    RolesDTO.builder()
                            .roles(List.of(RolUsuario.ROLE_ARQUITECTO))
                            .build()
            );

        } else if (solicitud instanceof SolicitudBajaRol baja) {
            // quitar el rol solicitado
            usuarioService.quitarRoles(request,
                    solicitud.getUsuario().getId(),
                    RolesDTO.builder()
                            .roles(List.of(baja.getRolAEliminar()))
                            .build()
            );
        }
    }

    //======= Obtener Solicitudes

    public Solicitud obtenerSolicitud (Long id){
        return solicitudRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Solicitud no encontrada con ID: " + id));
    }

    // public List<SolicitudResponseDTO> filtrarSolicitudes(SolicitudFiltroDTO filtro) {

    //     return solicitudRepository.findAll(SolicitudSpecification.filtrar(filtro))
    //             .stream()
    //             .map(solicitudMapper::mapToDTO)
    //             .toList();

    // }

    public List<SolicitudResponseDTO> filtrarSolicitudes(HttpServletRequest request,
                                                        SolicitudFiltroDTO filtro) {

        // 1. Usuario autenticado
        Usuario usuario = usuarioService.buscarUsuario(request);

        // 2. ¿Es admin?
        boolean esAdmin = usuario.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR);
        // (o stream si no tenés ese método helper)

        // 3. Si NO es admin, solo ve SUS solicitudes
        if (!esAdmin) {
            filtro.setUsuarioId(usuario.getId());
        }

        // 4. Aplica spec como antes
        return solicitudRepository.findAll(
                        SolicitudSpecification.filtrar(filtro),
                        Sort.by(Sort.Direction.DESC, "fechaCreacion"))
                .stream()
                .map(solicitudMapper::mapToDTO)
                .toList();
    }
}


