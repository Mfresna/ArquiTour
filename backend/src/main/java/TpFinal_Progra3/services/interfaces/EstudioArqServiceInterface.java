package TpFinal_Progra3.services.interfaces;

import TpFinal_Progra3.model.DTO.estudios.EstudioArqBasicoDTO;
import TpFinal_Progra3.model.DTO.estudios.EstudioArqDTO;
import TpFinal_Progra3.model.DTO.filtros.EstudioArqFiltroDTO;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface EstudioArqServiceInterface {
    EstudioArqDTO crearEstudio(HttpServletRequest request, EstudioArqBasicoDTO dto);
    void eliminarEstudio(Long id);
    EstudioArqDTO obtenerEstudio(Long id);
    List<EstudioArqDTO> filtrarEstudios(EstudioArqFiltroDTO filtro);
    EstudioArqDTO agregarArquitectoAEstudio(HttpServletRequest request, Long estudioId, Long arquitectoId);
    EstudioArqDTO eliminarArquitectoDeEstudio(HttpServletRequest request, Long estudioId, Long arquitectoId);
    EstudioArqDTO modificarEstudio(HttpServletRequest request, Long id, EstudioArqDTO dto);
    EstudioArqDTO actualizarEstudioImagenPerfil(HttpServletRequest request, Long id, String url);
}