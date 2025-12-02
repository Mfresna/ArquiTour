package TpFinal_Progra3.services.implementacion;
import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.notificaciones.NotificacionDTO;
import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import TpFinal_Progra3.model.entities.Notificacion;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.enums.TipoNotificacion;
import TpFinal_Progra3.model.mappers.NotificacionMapper;
import TpFinal_Progra3.repositories.NotificacionRepository;
import TpFinal_Progra3.repositories.UsuarioRepository;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.security.services.JwtService;
import TpFinal_Progra3.services.interfaces.NotificacionServiceinterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService implements NotificacionServiceinterface {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final NotificacionMapper notificacionMapper;

    // ====== endpoint manual (DTO) ======
    public NotificacionResponseDTO crearNotificacion(HttpServletRequest request, NotificacionDTO dto) {

        Usuario emisor = obtenerUsuario(request);

        if (emisor.getId().equals(dto.getIdReceptor())) {
            throw new ProcesoInvalidoException("El Receptor no puede ser igual al Emisor");
        }

        Usuario receptor = obtenerUsuario(dto.getIdReceptor());

        Notificacion notificacion = Notificacion.builder()
                .emisor(emisor)
                .receptor(receptor)
                .mensaje(dto.getMensaje())
                .isLeido(false)
                .tipo(TipoNotificacion.MENSAJE_GENERAL)
                .build();

        return notificacionMapper.mapResponseDto(notificacionRepository.save(notificacion));
    }

    public List<NotificacionResponseDTO> obtenerRecibidas(HttpServletRequest request, Boolean isLeidas) {
        Long receptorId = obtenerUsuario(request).getId();

        return notificacionRepository.findByReceptor_Id(receptorId).stream()
                .filter(n -> isLeidas == null || n.getIsLeido().equals(isLeidas))
                .map(notificacionMapper::mapResponseDto)
                .toList();
    }

    public List<NotificacionResponseDTO> obtenerEnviadas(HttpServletRequest request) {
        Long emisorId = obtenerUsuario(request).getId();

        return notificacionRepository.findByEmisor_Id(emisorId).stream()
                .map(notificacionMapper::mapResponseDto)
                .toList();
    }

    public void marcarLeida(Long idNotificacion) {
        notificacionRepository.findById(idNotificacion)
                .ifPresentOrElse(
                        n -> {
                            n.setIsLeido(true);
                            notificacionRepository.save(n);
                        },
                        () -> { throw new NotFoundException(HttpStatus.NOT_FOUND, "Notificación no encontrada"); }
                );
    }

    public void marcarTodasLeidas(HttpServletRequest request) {
        //Todas las recibidas
        obtenerRecibidas(request,null)
                .forEach(n -> marcarLeida(n.getId()));
    }


    public Notificacion crearNotificacionAutomatica(
            Usuario emisor,
            Usuario receptor,
            String mensaje,
            TipoNotificacion tipo,
            Long referenciaId
    ) {
        Notificacion notificacion = Notificacion.builder()
                .emisor(emisor)
                .receptor(receptor)
                .mensaje(mensaje)
                .tipo(tipo)
                .referenciaId(referenciaId)
                .isLeido(false)
                .build();

        return notificacionRepository.save(notificacion);
    }

    public Notificacion crearNotificacionAutomatica(
            Usuario emisor,
            Usuario receptor,
            String mensaje,
            TipoNotificacion tipo
    ) {
        return crearNotificacionAutomatica(emisor, receptor, mensaje, tipo, null);
    }

    public void notificacionMasiva(Usuario emisor, List<Usuario> receptores, String mensaje, TipoNotificacion tipo, Long idSolicitud){

        receptores.forEach(receptor ->
                crearNotificacionAutomatica(emisor, receptor, mensaje, tipo, idSolicitud)
        );
    }

    //=================================================================================

    private Usuario obtenerUsuario(HttpServletRequest request){
         return usuarioRepository.findByEmailIgnoreCase(jwtService.extractUsername(request))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado a partir del Token recibido."));
    }

    private Usuario obtenerUsuario(Long id){
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + id));
    }
}

