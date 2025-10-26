package TpFinal_Progra3.model.DTO.usuarios;

import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.security.model.entities.Rol;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Builder
@Data
@Schema(description = "DTO de respuesta con los datos completos de un usuario")
public class UsuarioResponseDTO {

    @Schema(description = "ID del usuario", example = "1")
    private Long id;

    @Schema(description = "Nombre del usuario", example = "Juan")
    private String email;

    @Schema(description = "Apellido del usuario", example = "Pérez")
    private String nombre;

    private String apellido;
    private List<String> roles;

    @Schema(description = "Fecha de nacimiento", example = "1990-01-01")
    private LocalDate fechaNacimiento;

    @Schema(description = "Descripción del perfil", example = "Arquitecto especializado en viviendas ecológicas")
    private String descripcion;

    @Schema(description = "URL de la imagen de perfil", example = "https://miapp.com/img/perfil.png")
    private String urlImagen;
    private List<Long> idEstudios;

    @Schema(description = "Lista de roles del usuario")
    private List<FavoritoBasicoDTO>listaFavoritos;
}



