package TpFinal_Progra3.model.DTO.filtros;

import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class SolicitudFiltroDTO {

    private TipoSolicitud tipo;

    private EstadoSolicitud estado;

    @Positive(message = "El ID del usuario debe ser un número positivo.")
    private Long usuarioId;

    @Positive(message = "El ID del administrador debe ser un número positivo.")
    private Long adminAsignadoId;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaDesde;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaHasta;

    private Boolean asignada;
}
