package TpFinal_Progra3.services.interfaces;

import TpFinal_Progra3.exceptions.BorradoException;
import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoResponseDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.services.implementacion.FavoritoService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface FavoritoServiceInterface {
    FavoritoService.ResultadoFavorito crearOActualizarFavorito(HttpServletRequest request, FavoritoDTO dto);
    List<FavoritoBasicoDTO> obtenerFavoritosDelUsuario(HttpServletRequest request);
    List<ObraResponseDTO> listarObrasDeFavorito(HttpServletRequest request, Long favoritoId);
    FavoritoResponseDTO agregarObraAFavorito(HttpServletRequest request, Long favoritoId, Long idObra);
    FavoritoResponseDTO eliminarObraDeFavoritoPorId(HttpServletRequest request, Long favoritoId, Long obraId) throws NotFoundException, BorradoException;
    FavoritoResponseDTO renombrarFavoritoPorId(HttpServletRequest request, Long favoritoId, String nuevoNombre) throws ProcesoInvalidoException, NotFoundException;
    String eliminarFavoritoPorId(HttpServletRequest request, Long favoritoId) throws NotFoundException;
}
