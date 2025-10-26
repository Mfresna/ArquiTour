package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.BorradoException;
import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoResponseDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.entities.Favorito;
import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.mappers.FavoritoMapper;
import TpFinal_Progra3.model.mappers.ObraMapper;
import TpFinal_Progra3.repositories.FavoritoRepository;
import TpFinal_Progra3.services.interfaces.FavoritoServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritoService implements FavoritoServiceInterface {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioService usuarioService;
    private final ObraService obraService;
    private final FavoritoMapper favoritoMapper;
    private final ObraMapper obraMapper;


    public ResultadoFavorito crearOActualizarFavorito(HttpServletRequest request, FavoritoDTO dto) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);

        Favorito favorito = usuario.getListaFavoritos().stream()
                .filter(f -> f.getNombreLista().equalsIgnoreCase(dto.getNombreLista()))
                .findFirst()
                .orElse(null);

        List<Obra> obrasSolicitadas = obraService.obtenerObrasPorIds(dto.getIdObras());

        boolean esNuevo;

        if (favorito != null) {
            List<Long> idsObrasYaAgregadas = favorito.getObras().stream()
                    .map(Obra::getId)
                    .toList();

            obrasSolicitadas.stream()
                    .filter(obra -> !idsObrasYaAgregadas.contains(obra.getId()))
                    .forEach(favorito.getObras()::add);

            esNuevo = false;
        } else {
            favorito = Favorito.builder()
                    .nombreLista(dto.getNombreLista())
                    .obras(obrasSolicitadas)
                    .usuario(usuario)
                    .build();
            esNuevo = true;
        }

        Favorito guardado = favoritoRepository.save(favorito);
        FavoritoResponseDTO response = favoritoMapper.mapResponseDTO(guardado);

        return new ResultadoFavorito(response, esNuevo);
    }

    public record ResultadoFavorito(FavoritoResponseDTO dto, boolean esNuevo) {}

    // 2. Listar todos los favoritos del usuario
    public List<FavoritoBasicoDTO> obtenerFavoritosDelUsuario(HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        return usuario.getListaFavoritos().stream()
                .map(favoritoMapper::mapBasicoDTO)
                .toList();
    }

    // 3. Listar obras de un favorito
    public List<ObraResponseDTO> listarObrasDeFavorito(HttpServletRequest request, Long favoritoId) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        Favorito favorito = obtenerFavoritoPorId(favoritoId, usuario);
        return favorito.getObras().stream()
                .map(obraMapper::mapResponseDTO)
                .toList();
    }

    // 4. Agregar obras a un favorito
    public FavoritoResponseDTO agregarObraAFavorito(HttpServletRequest request, Long favoritoId, Long idObra) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        Obra nuevasObra = obraService.obtenerObra(idObra);

        Favorito favorito = obtenerFavoritoPorId(favoritoId, usuario);
        favorito.getObras().add(nuevasObra);

        return favoritoMapper.mapResponseDTO(favoritoRepository.save(favorito));
    }

    // 5. Eliminar obra de un favorito
    public FavoritoResponseDTO eliminarObraDeFavoritoPorId(HttpServletRequest request, Long favoritoId, Long obraId) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        Favorito favorito = obtenerFavoritoPorId(favoritoId, usuario);

        boolean eliminada = favorito.getObras().removeIf(obra -> obra.getId().equals(obraId));
        if (!eliminada) {
            throw new NotFoundException("La obra con ID " + obraId + " no se encuentra en la lista.");
        }

        if(favorito.getObras().isEmpty()){
            //Si el favorito se queda sin obras se elimina de la DB
            favoritoRepository.delete(favorito);
            throw new BorradoException("El favorito fue eliminado porque no contenía más obras.");
        }else{
            return favoritoMapper.mapResponseDTO(favoritoRepository.save(favorito));
        }
    }

    // 6. Renombrar favorito
    public FavoritoResponseDTO renombrarFavoritoPorId(HttpServletRequest request, Long favoritoId, String nuevoNombre) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        Favorito favorito = obtenerFavoritoPorId(favoritoId, usuario);

        boolean duplicado = usuario.getListaFavoritos().stream()
                .anyMatch(f -> f.getNombreLista().equalsIgnoreCase(nuevoNombre) && !f.getId().equals(favoritoId));
        if (duplicado) {
            throw new ProcesoInvalidoException("Ya existe otra lista con ese nombre.");
        }

        favorito.setNombreLista(nuevoNombre);
        return favoritoMapper.mapResponseDTO(favoritoRepository.save(favorito));
    }

    // 7. Eliminar favorito completo
    public String eliminarFavoritoPorId(HttpServletRequest request, Long favoritoId) {
        Usuario usuario = obtenerUsuarioDesdeRequest(request);
        Favorito favorito = obtenerFavoritoPorId(favoritoId, usuario);

        usuarioService.eliminarFavoritoDeUsuario(usuario,favorito);

        return("Lista de Favoritos " + favoritoId + " - " + favorito.getNombreLista() + " fue eliminada.");
    }

    // === Métodos privados reutilizables ===

    private Usuario obtenerUsuarioDesdeRequest(HttpServletRequest request) {
        return usuarioService.buscarUsuario(usuarioService.obtenerMiPerfil(request).getId());
    }

    private Favorito obtenerFavoritoPorId(Long favoritoId, Usuario usuario) {
        return usuario.getListaFavoritos().stream()
                .filter(f -> f.getId().equals(favoritoId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Lista no encontrada con ID: " + favoritoId));
    }

}

