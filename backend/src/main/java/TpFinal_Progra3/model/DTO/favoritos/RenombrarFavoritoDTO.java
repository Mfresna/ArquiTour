package TpFinal_Progra3.model.DTO.favoritos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO utilizado para renombrar una lista de favoritos.")
public class RenombrarFavoritoDTO {
    @Schema(
            description = "Nuevo nombre para la lista de favoritos.",
            example = "Obras de arquitectura moderna",
            maxLength = 100,
            required = true
    )
    @NotBlank(message = "El nuevo nombre no puede estar vacío.")
    @Size(max = 100, message = "El nuevo nombre no debe superar los 100 caracteres.")
    @Pattern(regexp = "^(?!.* {2})[a-zA-Z0-9 ]+$",
            message = "El nombre de la lista solo puede contener letras y números.")
    private String nuevoNombre;
}
