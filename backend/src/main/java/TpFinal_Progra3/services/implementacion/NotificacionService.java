package TpFinal_Progra3.services.implementacion;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.notificaciones.NotificacionDTO;
import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import TpFinal_Progra3.model.entities.Notificacion;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.mappers.NotificacionMapper;
import TpFinal_Progra3.repositories.NotificacionRepository;
import TpFinal_Progra3.services.interfaces.NotificacionServiceinterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService implements NotificacionServiceinterface {

    private final UsuarioService usuarioService;
    private final NotificacionRepository notificacionRepository;
    private final NotificacionMapper notificacionMapper;

    public NotificacionResponseDTO crearNotificacion(HttpServletRequest request, NotificacionDTO dto) {

        Usuario emisor = usuarioService.buscarUsuario(usuarioService.obtenerMiPerfil(request).getId());
        if(emisor.getId().equals(dto.getIdReceptor())) {throw new ProcesoInvalidoException("El Receptor no puede ser igual al Emisor");}
        Usuario receptor = usuarioService.buscarUsuario(dto.getIdReceptor());

        Notificacion notificacion = Notificacion.builder()
                .emisor(emisor)
                .receptor(receptor)
                .mensaje(dto.getMensaje())
                .isLeido(false)
                .build();

        return notificacionMapper.mapResponseDto(notificacionRepository.save(notificacion));
    }


    public List<NotificacionResponseDTO> obtenerRecibidas(HttpServletRequest request, Boolean isLeidas) {
        Long receptorId = usuarioService.obtenerMiPerfil(request).getId();

        return notificacionRepository.findByReceptor_Id(receptorId).stream()
                .filter(n -> isLeidas == null || n.getIsLeido().equals(isLeidas))
                .map(notificacionMapper::mapResponseDto)
                .toList();
    }


    public List<NotificacionResponseDTO> obtenerEnviadas(HttpServletRequest request) {

        return notificacionRepository.findByEmisor_Id(usuarioService.obtenerMiPerfil(request).getId()).stream()
                .map(notificacionMapper::mapResponseDto)
                .toList();
    }

}
