package TpFinal_Progra3.services.interfaces;

import TpFinal_Progra3.model.DTO.notificaciones.NotificacionDTO;
import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface NotificacionServiceinterface {
    NotificacionResponseDTO crearNotificacion(HttpServletRequest request, NotificacionDTO dto);
    List<NotificacionResponseDTO> obtenerRecibidas(HttpServletRequest request, Boolean isLeidas);
    List<NotificacionResponseDTO> obtenerEnviadas(HttpServletRequest request);
}
