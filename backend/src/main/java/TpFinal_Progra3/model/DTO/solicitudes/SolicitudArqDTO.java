package TpFinal_Progra3.model.DTO.solicitudes;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SolicitudArqDTO {

    @Schema(description = "Matrícula del arquitecto.", example = "MAT-12345", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "La matrícula es obligatoria.")
    @Size(max = 100, message = "La matrícula no puede superar los 100 caracteres.")
    private String matriculaArquitecto;

    @Schema(description = "Nombre de la universidad.", example = "Universidad Nacional de Mar del Plata", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "La universidad es obligatoria.")
    @Size(max = 200, message = "La universidad no puede superar los 200 caracteres.")
    private String universidad;

    @NotNull(message = "El año de recibido es obligatorio.")
    @Min(value = 1900, message = "El año de recibido no puede ser menor a 1900.")
    private Integer anioRecibido;
}
