package TpFinal_Progra3.model.DTO.solicitudes;

import TpFinal_Progra3.model.enums.TipoSolicitud;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SolicitudNuevaDTO {
    //No se aplican validaciones para que pueda aceptar cualquier cosa y luego en el service valida.


    private TipoSolicitud tipo;

    // para ALTA_ARQUITECTO
    private String matriculaArquitecto;
    private String universidad;
    private Integer anioRecibido;

    // para BAJA_ROL
    private RolUsuario rolAEliminar;
    private String motivo;
}
