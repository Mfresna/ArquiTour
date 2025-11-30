package TpFinal_Progra3.model.DTO.filtros;

import TpFinal_Progra3.security.model.enums.RolUsuario;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

@Data
@Schema(description = "DTO para filtrar usuarios por distintos criterios")
public class UsuarioFiltroDTO {

    @Schema(description = "Nombre a filtrar", example = "Pedro")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$",
            message = "El nombre solo puede contener letras.")
    private String nombre;

    @Schema(description = "Apellido a filtrar", example = "González")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+){0,3}$\n",
            message = "El apelldio solo puede contener letras y un solo espacio entre estas, hasta 4 palabras.")
    private String apellido;

    @Schema(description = "Email a filtrar", example = "pedro@gmail.com")
    @Email(message = "El email debe tener un formato válido")
    private String email;

    @Schema(description = "Filtrar por si está activo", example = "true")
    private Boolean isActivo;

    @Schema(description = "Filtrar por rol del usuario", example = "ROLE_ADMINISTRADOR")
    private RolUsuario rol;
}
