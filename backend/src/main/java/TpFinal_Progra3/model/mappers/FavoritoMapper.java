package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoResponseDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.entities.Favorito;
import TpFinal_Progra3.model.entities.Imagen;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class FavoritoMapper {

    private final ObraMapper obraMapper;

    // Convierte de DTO a entidad Favorito
//    public Favorito mapFavorito(FavoritoDTO dto) {
//        List<Obra> obras = dto.getIdObras().stream()
//                .map(id -> obraRepository.findById(id)
//                        .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id)))
//                .toList();
//
//        return Favorito.builder()
//                .nombreLista(dto.getNombreLista())
//                .obras(obras)
//                .build();
//    }

    // Convierte de entidad Favorito a DTO de respuesta
    public FavoritoResponseDTO mapResponseDTO(Favorito favorito) {
        return FavoritoResponseDTO.builder()
                .id(favorito.getId())
                .nombreLista(favorito.getNombreLista())
                .fechaCreacion(favorito.getFechaCreacion())
                .obras(favorito.getObras() != null
                        ? favorito.getObras().stream()
                        .map(obra -> ObraResponseDTO.builder()
                                .id(obra.getId())
                                .nombre(obra.getNombre())
                                .latitud(obra.getLatitud())
                                .longitud(obra.getLongitud())
                                .descripcion(obra.getDescripcion())
                                .anioEstado(obra.getAnioEstado())
                                .estado(obra.getEstado())
                                .categoria(obra.getCategoria())
                                .estudioId(obra.getEstudio() != null ? obra.getEstudio().getId() : null)
                                .urlsImagenes(obra.getImagenes() != null
                                        ? obra.getImagenes().stream()
                                        .map(Imagen::getUrl)
                                        .toList()
                                        : new ArrayList<>())
                                .build())
                        .toList()
                        : new ArrayList<>())
                .build();
    }

    public FavoritoBasicoDTO mapBasicoDTO(Favorito favorito) {
        return FavoritoBasicoDTO.builder()
                .id(favorito.getId())
                .nombre(favorito.getNombreLista())
                .build();
    }
}
