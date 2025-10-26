package TpFinal_Progra3.services.interfaces;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.model.DTO.obras.ObraDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.DTO.filtros.ObraFiltroDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.Obra;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface ObraServiceInterface {
    ObraResponseDTO crearObra(HttpServletRequest request, ObraDTO dto);
    ObraResponseDTO obtenerObraResponseDTO(Long id);
    void eliminarObra(HttpServletRequest request, Long id);
    String obraEnMapa(int zoom, Long id);
    List<ObraResponseDTO> obrasPorTerritorio(String ciudad, String pais);
    List<ObraResponseDTO> obrasPorDistancia(HttpServletRequest request, Double distancia);
    List<ObraResponseDTO> filtrarObras(ObraFiltroDTO filtro);
    ObraResponseDTO modificarObra(HttpServletRequest request, Long id, ObraDTO obraDTO);
    List<Imagen> listarImagenes(Long id);
    void eliminarImagenes(HttpServletRequest request,Long id, List<String> urlImagenes);
    ObraResponseDTO agregarImagenes(HttpServletRequest request, Long id, List<String> urlImagenes);
    List<Obra> obtenerObrasPorIds(List<Long> ids);
    Obra obtenerObra(Long id);
}