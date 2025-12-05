package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import TpFinal_Progra3.model.entities.Notificacion;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {

    public NotificacionResponseDTO mapResponseDto(Notificacion notificacion) {
        return NotificacionResponseDTO.builder()
                .id(notificacion.getId())
                .emisorId(notificacion.getEmisor().getId())
                .receptorId(notificacion.getReceptor() != null ? notificacion.getReceptor().getId() : null)
                .mensaje(notificacion.getMensaje())
                .fecha(notificacion.getFecha())
                .isLeido(notificacion.getIsLeido())
                .tipo(notificacion.getTipo())
                .referenciaId(notificacion.getReferenciaId())
                .build();
    }
}
