package TpFinal_Progra3.model.DTO.filtros;

import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import io.swagger.v3.oas.annotations.media.Schema;
<<<<<<< HEAD
=======
import jakarta.validation.constraints.Pattern;
>>>>>>> backup
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "DTO utilizado para aplicar filtros en la búsqueda de obras.")
public class ObraFiltroDTO {
    @Schema(
            description = "Categoría de la obra.",
            example = "VIVIENDA"
    )
    private CategoriaObra categoria;

    @Schema(
            description = "Estado actual de la obra.",
            example = "FINALIZADA"
    )
    private EstadoObra estado;

    @Schema(
            description = "ID del estudio de arquitectura responsable de la obra.",
            example = "3"
    )
    @Positive(message = "El ID del estudio debe ser un número positivo.")
    private Long estudioId;
<<<<<<< HEAD
=======

    // Filtro por nombre parcial o completo (opcional)
    @Schema(
            description = "Filtro por nombre de la obra (puede ser parcial o completo).",
            example = "Casa del Puente"
    )
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\\s\\-\\:\\.,¡\\?()/]+$",
            message = "El nombre de la obra solo puede contener letras, números, la ñ y un solo espacio entre palabras.")
    private String nombre;
>>>>>>> backup
}
