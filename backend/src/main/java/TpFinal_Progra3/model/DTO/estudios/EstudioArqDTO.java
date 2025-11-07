package TpFinal_Progra3.model.DTO.estudios;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

        @Builder
        @Data
        @Schema(description = "DTO para crear o actualizar un Estudio de Arquitectura, incluyendo obras y arquitectos asociados.")
        public class EstudioArqDTO {

        private Long id;

        @Schema(
                description = "Nombre del estudio de arquitectura",
                example = "Estudio Sur Arquitectos",
                minLength = 2,
                maxLength = 100,
                required = true
        )
        @NotBlank(message = "El nombre del estudio no puede estar vacío.")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+( [A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+)*$",
                message = "El nombre del estudio solo puede contener letras, números, la ñ y un solo espacio entre palabras.")
        private String nombre;

        @Schema(
                description = "Lista de IDs de obras asociadas al estudio",
                example = "[1, 2, 3]"
        )
        private List< @Positive(message = "El ID de la obra debe ser un número positivo.")Long> obrasIds; // Lista de IDs de las obras asociadas

        @Schema(
                description = "Lista de IDs de arquitectos que forman parte del estudio",
                example = "[10, 11]"
        )
        private List< @Positive(message = "El ID del arquitecto debe ser un número positivo.")Long> arquitectosIds; // Lista de IDs de los arquitectos

        @Schema(
                description = "URL de la imagen que representa al estudio",
                example = "https://arquitectura.com/img/estudio.jpg",
                maxLength = 2048
        )
        @Size(max = 2048, message = "La URL no debe superar los 2048 caracteres.")
        @Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
                message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
        private String imagenUrl; // URL de la imagen asociada
        }