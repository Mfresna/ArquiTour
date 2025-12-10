package TpFinal_Progra3.model.DTO.favoritos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "DTO para crear o actualizar una lista de obras favoritas.")

public class FavoritoDTO {
    @Schema(
            description = "Nombre asignado a la lista de favoritos.",
            example = "Mis obras favoritas",
            maxLength = 100,
            required = true
    )
    @NotBlank(message = "El nombre de la lista no puede estar vacío.")
    @Size(max = 100, message = "El nombre de la lista no debe superar los 100 caracteres.")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\-¿\\?¡!()\\s]+$",
            message = "El nombre de la lista solo puede contener letras y números.")
    private String nombreLista;

    @Schema(
            description = "Lista de IDs de obras que forman parte de los favoritos.",
            example = "[12, 34, 56]",
            required = true
    )
    @NotEmpty(message = "Debe contener al menos una obra.")
    private List<@Positive Long> idObras;
}
