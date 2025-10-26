package TpFinal_Progra3.model.mappers;

import TpFinal_Progra3.model.DTO.obras.ObraDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.Obra;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ObraMapper {

    // Convertir de DTO a entidad
    public Obra mapObra(ObraDTO obraDto, EstudioArq estudio, List<Imagen> imagenes) {
        return Obra.builder()
                .nombre(obraDto.getNombre())
                .latitud(obraDto.getLatitud())
                .longitud(obraDto.getLongitud())
                .descripcion(obraDto.getDescripcion())
                .anioEstado(obraDto.getAnioEstado())
                .estado(obraDto.getEstado())
                .categoria(obraDto.getCategoria())
                .estudio(estudio)
                .imagenes(imagenes)
                .build();
    }

    // Convertir de entidad a DTO (si lo necesitás para devolver en un GET)
    public ObraResponseDTO mapResponseDTO(Obra obra) {
        return ObraResponseDTO.builder()
                .id(obra.getId())
                .nombre(obra.getNombre())
                .latitud(obra.getLatitud())
                .longitud(obra.getLongitud())
                .descripcion(obra.getDescripcion())
                .anioEstado(obra.getAnioEstado())
                .estado(obra.getEstado())
                .categoria(obra.getCategoria())
                .estudioId(obra.getEstudio().getId())
                .urlsImagenes(obra.getImagenes().stream().map(Imagen::getUrl).toList())
                .build();
    }
}