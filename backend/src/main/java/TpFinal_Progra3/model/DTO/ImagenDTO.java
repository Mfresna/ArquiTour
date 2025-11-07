package TpFinal_Progra3.model.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@Schema(description = "DTO que contiene una URL de imagen")
public class ImagenDTO {

    @Schema(description = "URL de la imagen cargada en Cloudinary", example = "https://res.cloudinary.com/.../imagen.jpg")
    @NotBlank(message = "La URL de la imagen es obligatoria.")
    @Size(max = 2048, message = "La URL no debe superar los 2048 caracteres.")
//    @Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
//            message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
    private String url;
}