package TpFinal_Progra3.model.DTO.notificaciones;

import TpFinal_Progra3.model.enums.TipoNotificacion;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO para enviar una notificación a un usuario receptor.")
public class NotificacionDTO {

    @Schema(
            description = "ID del usuario receptor de la notificación.",
            example = "42",
            required = true
    )
    @NotNull(message = "El ID del Receptor es obligatorio.")
    @Positive(message = "El ID del Receptor debe ser un número positivo.")
    private Long idReceptor;

    @Schema(
            description = "Mensaje que se enviará en la notificación.",
            example = "Tu solicitud ha sido aprobada.",
            required = true,
            minLength = 2,
            maxLength = 500
    )
    @NotBlank(message = "El mensaje no puede estar vacío.")
    @Size(min = 2, max = 500, message = "El mensaje debe tener entre 2 y 500 caracteres.")
    private String mensaje;

}
