package TpFinal_Progra3.security.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Roles posibles para un usuario en el sistema.")
public enum RolUsuario {
    @Schema(description = "Administrador: puede cargar obras y gestionar solicitudes de usuarios.")
    ROLE_ADMINISTRADOR,
        //puede cargar obras y gestionar solicitudes de usuarios
        @Schema(description = "Arquitecto: puede cargar sus propias obras y dar de alta un estudio de arquitectura.")
    ROLE_ARQUITECTO,
        //puede cargar sus propias obras y dar de alta un estudio de arquitectura
        @Schema(description = "Usuario: solo puede visualizar y agregar a favoritos las obras.")
    ROLE_USUARIO
        //solo puede visualizar y agregar a favoritos las obras
}
