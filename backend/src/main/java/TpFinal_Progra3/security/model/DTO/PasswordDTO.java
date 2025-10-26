package TpFinal_Progra3.security.model.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@Schema(description = "DTO para actualizar la contraseña del usuario")
public class PasswordDTO {
    @Schema(description = "Nueva contraseña del usuario", example = "NuevaPass456")
    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Pattern(regexp = "^(?=.*[A-ZÁÉÍÓÚÑ])(?=.*\\d)[A-Za-záéíóúÁÉÍÓÚñÑ\\d@._!+\\-]{6,}$",
            message = "La contraseña debe contener al menos una mayúscula, un número y solo puede incluir letras, números y los símbolos @ . _ - ! +")
    private String nuevaPassword;
}
