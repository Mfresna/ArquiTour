package TpFinal_Progra3.security.model.DTO;

import TpFinal_Progra3.security.model.enums.RolUsuario;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "DTO para asignar o quitar roles a un usuario")
public class RolesDTO {

    @Schema(description = "Lista de roles a agregar o quitar", example = "[\"ROLE_USUARIO\", \"ROLE_ARQUITECTO\",\"ROLE_ADMINISTRADOR\"]")
    @NotEmpty(message = "Debe proporcionar al menos un rol.")
    private List<RolUsuario> roles;
}
