package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.security.model.entities.Rol;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    // Convertir de DTO a entidad
    public Usuario mapUsuario(UsuarioDTO usuarioDTO) {
        return Usuario.builder()
                .email(usuarioDTO.getEmail().toLowerCase())
                .nombre(usuarioDTO.getNombre())
                .apellido(usuarioDTO.getApellido())
                .fechaNacimiento(usuarioDTO.getFechaNacimiento())
                .descripcion(usuarioDTO.getDescripcion())
                .build();
    }

    // Convertir de entidad a DTO (si lo necesitás para devolver en un GET)
    public UsuarioResponseDTO mapResponseDTO(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .roles(usuario.getCredencial().getRoles().stream()
                        .map(r -> r.getRol().name())
                        .toList())

                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())

                .isActivo(usuario.getIsActivo())

                .fechaNacimiento(usuario.getFechaNacimiento())
                .descripcion(usuario.getDescripcion())
                .urlImagen(usuario.getImagen() != null ? usuario.getImagen().getUrl() : null)

                .idEstudios(usuario.getEstudios().stream().map(EstudioArq::getId).toList())
                .listaFavoritos(usuario.getListaFavoritos().stream()
                        .map(f -> FavoritoBasicoDTO.builder()
                                .id(f.getId())
                                .nombre(f.getNombreLista())
                                .build())
                        .toList())

                .build();
    }



}
