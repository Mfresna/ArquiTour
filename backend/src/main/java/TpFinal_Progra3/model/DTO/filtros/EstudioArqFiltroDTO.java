package TpFinal_Progra3.model.DTO.filtros;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "DTO para aplicar filtros al buscar estudios de arquitectura.")
public class EstudioArqFiltroDTO {

    // Filtro por nombre parcial o completo (opcional)
    @Schema(
            description = "Filtro por nombre del estudio (puede ser parcial o completo).",
            example = "Rojas Vega"
    )
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\\s\\-\\:\\.,¡\\?()/]+$",
            message = "El nombre del estudio solo puede contener letras, números, la ñ y un solo espacio entre palabras.")
    private String nombre;

    @Schema(
            description = "ID de una obra asociada al estudio.",
            example = "5"
    )
    @Positive(message = "El ID de la obra debe ser un número positivo.")
    private Long obraId;
}
