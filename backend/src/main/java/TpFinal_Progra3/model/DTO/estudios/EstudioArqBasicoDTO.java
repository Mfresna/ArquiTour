package TpFinal_Progra3.model.DTO.estudios;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@Schema(description = "DTO con información básica del estudio de arquitectura")
public class EstudioArqBasicoDTO {

    @Schema(
            description = "Nombre del estudio",
            example = "Estudio Rojas Vega",
            minLength = 2,
            maxLength = 100
    )
    @NotBlank(message = "El nombre del estudio no puede estar vacío.")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
    @Pattern(regexp = "^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\\s\\-\\:\\.,¡\\?()\\/\\+]+$",
            message = "El nombre del estudio solo puede contener letras, números, la ñ y un solo espacio entre palabras.")
    private String nombre;


    @Schema(
            description = "URL de la imagen del estudio",
            example = "https://misitio.com/imagenes/estudio.jpg",
            maxLength = 2048
    )
    @Size(max = 2048, message = "La URL no debe superar los 2048 caracteres.")
//    @Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
//            message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
    private String imagenUrl; // URL de la imagen asociada
}