package TpFinal_Progra3.model.DTO.obras;

import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
@Schema(description = "DTO de respuesta para una obra arquitectónica")
public class ObraResponseDTO {
    @Schema(description = "ID de la obra", example = "1")
    private Long id;

    @Schema(description = "Nombre de la obra", example = "Casa Palafito")
    private String nombre;

    @Schema(description = "Latitud geográfica de la obra", example = "-42.4828")
    private Double latitud;

    @Schema(description = "Longitud geográfica de la obra", example = "-73.7669")
    private Double longitud;

    @Schema(description = "Descripción breve de la obra", example = "Vivienda elevada sobre pilotes con vista al mar.")
    private String descripcion;

    @Schema(description = "Año asociado al estado actual de la obra", example = "2022")
    private Integer anioEstado;

    @Schema(description = "Estado actual de la obra", example = "FINALIZADA")
    private EstadoObra estado;

    @Schema(description = "Categoría de la obra", example = "VIVIENDA_UNIFAMILIAR")
    private CategoriaObra categoria;

    @Schema(description = "ID del estudio de arquitectura asociado", example = "5")
    private Long estudioId;

    @Schema(description = "Listado de URLs de imágenes asociadas a la obra",
            example = "[\"https://cdn.miapp.com/img1.jpg\", \"https://cdn.miapp.com/img2.jpg\"]")
    private List<String> urlsImagenes;

}
