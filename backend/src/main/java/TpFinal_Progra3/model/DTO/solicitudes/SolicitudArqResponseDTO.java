package TpFinal_Progra3.model.DTO.solicitudes;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Builder
@Data
public class SolicitudArqResponseDTO {

    private Long id;
    private String matriculaArquitecto;
    private String universidad;
    private Integer anioRecibido;
    private List<String> imagenesUrls;

    private EstadoSolicitud estado;
    private LocalDate fechaCreacion;
    private LocalDate fechaResolucion;

    private Long adminId;

    private Long usuarioId;
}