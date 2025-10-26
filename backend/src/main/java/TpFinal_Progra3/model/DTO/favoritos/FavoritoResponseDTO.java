package TpFinal_Progra3.model.DTO.favoritos;

import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Schema(description = "Respuesta detallada de una lista de favoritos de un usuario")
public class FavoritoResponseDTO {

    @Schema(description = "Identificador único de la lista de favoritos", example = "42")
    private Long id;

    @Schema(description = "Nombre de la lista de favoritos", example = "Obras preferidas 2024")
    private String nombreLista;

    @Schema(description = "Fecha de creación de la lista", type = "string", pattern = "dd/MM/yyyy HH:mm", example = "18/06/2025 10:30")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fechaCreacion;

    @Schema(description = "Listado de obras arquitectónicas favoritas asociadas a esta lista")
    private List<ObraResponseDTO> obras;
}
