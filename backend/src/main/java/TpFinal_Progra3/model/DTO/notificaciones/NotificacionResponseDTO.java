package TpFinal_Progra3.model.DTO.notificaciones;

import TpFinal_Progra3.model.enums.TipoNotificacion;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "DTO de respuesta con datos de una notificación.")
public class NotificacionResponseDTO {
    @Schema(description = "ID único de la notificación", example = "123")
    private Long id;

    @Schema(description = "ID del usuario emisor", example = "10")
    private Long emisorId;

    @Schema(description = "Email del usuario emisor", example = "emisor@ejemplo.com")
    private String emisorEmail;

    @Schema(description = "ID del usuario receptor", example = "42")
    private Long receptorId;

    @Schema(description = "Email del usuario receptor", example = "receptor@ejemplo.com")
    private String receptorEmail;

    @Schema(description = "Mensaje de la notificación", example = "Tu obra fue aprobada")
    private String mensaje;

    @Schema(description = "Fecha y hora de la notificación", example = "18/06/2025 14:30", type = "string", format = "date-time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fecha;

    @Schema(description = "Indica si la notificación fue leída", example = "false")
    private Boolean isLeido;

    private TipoNotificacion tipo;
    private Long referenciaId;
}