package TpFinal_Progra3.model.DTO.obras;

import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
@Schema(description = "DTO para crear o actualizar una obra arquitectónica")
public class ObraDTO {
    @Schema(description = "Nombre de la obra",
            example = "Casa Palafito")
    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
    @Pattern(regexp = "^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\\s\\-\\:\\.,¡\\?()\\/]+$"
            , message = "El nombre contiene caracteres inválidos.")
    private String nombre;


    @Schema(description = "Latitud geográfica de la obra",
            example = "-42.4828")
    @NotNull(message = "La latitud no puede ser nula.")
    @DecimalMin(value = "-90.0", inclusive = true, message = "La latitud debe ser mayor o igual a -90.0.")
    @DecimalMax(value = "90.0", inclusive = true, message = "La latitud debe ser menor o igual a 90.0.")
    private Double latitud;

    @Schema(description = "Longitud geográfica de la obra",
            example = "-73.7669")
    @NotNull(message = "La longitud no puede ser nula.")
    @DecimalMin(value = "-180.0", inclusive = true, message = "La longitud debe ser mayor o igual a -180.0.")
    @DecimalMax(value = "180.0", inclusive = true, message = "La longitud debe ser menor o igual a 180.0.")
    private Double longitud;

    @Schema(description = "Descripción textual detallada de la obra",
            example = "Obra ubicada sobre pilotes de madera, diseñada con materiales reciclables.")
    @NotBlank(message = "Debe ingresar una descripcion de la Obra.")
    @Size(max = 16000000)
    private String descripcion;

    @Schema(description = "Año correspondiente al estado actual de la obra",
            example = "2022")
    @NotNull(message = "El año del estado no puede ser nulo.")
    private Integer anioEstado;

    @Schema(description = "Estado actual de la obra",
            example = "EN_CONSTRUCCION")
    @NotNull(message = "El estado de la obra es obligatorio.")
    private EstadoObra estado;

    @Schema(description = "Categoría de la obra",
            example = "VIVIENDA_UNIFAMILIAR")
    @NotNull(message = "La categoría de la obra es obligatoria.")
    private CategoriaObra categoria;

    @Schema(description = "ID del estudio de arquitectura responsable",
            example = "5")
    @NotNull(message = "El ID del estudio es obligatorio.")
    @Positive(message = "El ID del estudio debe ser un número positivo.")
    private Long estudioId;

    @Schema(description = "Listado de URLs de imágenes asociadas a la obra",
            example = "[\"https://cdn.miapp.com/img1.jpg\", \"https://cdn.miapp.com/img2.jpg\"]")
    private List<@Size(max = 2048, message = "La URL no debe superar los 2048 caracteres.")
<<<<<<< HEAD
                @Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
                        message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
=======
                // @Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
                //         message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
>>>>>>> backup
            String> urlsImagenes;
}