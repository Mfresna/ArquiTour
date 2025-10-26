package TpFinal_Progra3.model.DTO.favoritos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@Schema(description = "DTO básico que representa un conjunto de favoritos del usuario.")
public class FavoritoBasicoDTO {
    @Schema(
            description = "ID del conjunto de favoritos",
            example = "1"
    )
    private Long id;

    @Schema(
            description = "Nombre asignado al conjunto de favoritos",
            example = "Mis obras favoritas"
    )
    private String nombre;
}
