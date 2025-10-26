package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import TpFinal_Progra3.model.entities.Notificacion;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {

    public NotificacionResponseDTO mapResponseDto(Notificacion notificacion) {
        return NotificacionResponseDTO.builder()
                .id(notificacion.getId())

                .mensaje(notificacion.getMensaje())

                .fecha(notificacion.getFecha()) // usamos la fecha generada automáticamente
                .isLeido(notificacion.getIsLeido())

                .emisorEmail(notificacion.getEmisor().getEmail())
                .emisorId(notificacion.getEmisor().getId())

                .receptorEmail(notificacion.getReceptor().getEmail())
                .receptorId(notificacion.getReceptor().getId())

                .build();
    }
}
