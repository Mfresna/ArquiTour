package TpFinal_Progra3.model.DTO.solicitudes;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "DTO para resolver una solicitud de cambio de rol a arquitecto.")
public class ResolucionSolicitudDTO {

    @Schema(description = "Indica si la solicitud se aprueba (true) o se rechaza (false).", example = "true")
    @NotNull(message = "El campo 'aprobada' es obligatorio.")
    private Boolean aprobada;

    @Schema(description = "Motivo de la decisión. Obligatorio si la solicitud es rechazada.",
            example = "No se adjuntó título válido.")
    @Size(max = 280, message = "El motivo no puede superar los 280 caracteres.")
    private String motivo;
}