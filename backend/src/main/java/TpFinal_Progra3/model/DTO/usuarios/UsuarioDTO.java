package TpFinal_Progra3.model.DTO.usuarios;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Builder
@Data
@Schema(description = "DTO para crear un nuevo usuario con datos básicos y credenciales")
public class UsuarioDTO {

    @Schema(description = "Email del usuario", example = "usuario@correo.com")
    @NotBlank(message = "El email es obligatorio.")
    @Email(message = "El email debe tener un formato válido.")
    private String email;

    @Schema(description = "Contraseña del usuario", example = "Clave123")
    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Pattern(regexp = "^(?=.*[A-ZÁÉÍÓÚÑ])(?=.*\\d)[A-Za-záéíóúÁÉÍÓÚñÑ\\d@._!+\\-]{6,}$",
            message = "La contraseña debe contener al menos una mayúscula y un número")
    private String password;

    @Schema(description = "Nombre del usuario", example = "Juan")
    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres.")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$",
            message = "El nombre solo puede contener letras y un solo espacio entre estas.")
    private String nombre;

    @Schema(description = "Apellido del usuario", example = "Pérez")
    @NotBlank(message = "El apellido es obligatorio.")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres.")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$",
            message = "El apelldio solo puede contener letras y un solo espacio entre estas.")
    private String apellido;

    @Schema(description = "Fecha de nacimiento", example = "1990-01-01")
    @NotNull(message = "La fecha de nacimiento es obligatoria.")
    @Past(message = "La fecha de nacimiento debe ser una fecha pasada.")
    private LocalDate fechaNacimiento;

    @Schema(description = "Descripción opcional del perfil", example = "Arquitecto especializado en viviendas sustentables")    @Size(max = 255, message = "La descripción no debe superar los 255 caracteres.")
    private String descripcion;

    @Schema(description = "URL de imagen de perfil", example = "https://miapp.com/img/perfil.png")
    @Pattern(
            regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$",
            message = "La URL debe comenzar con http o https y terminar en una imagen válida (.jpg, .png, etc.).")
    private String imagenUrl;
}
