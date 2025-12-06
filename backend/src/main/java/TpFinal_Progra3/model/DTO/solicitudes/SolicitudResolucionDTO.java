package TpFinal_Progra3.model.DTO.solicitudes;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SolicitudResolucionDTO {
    //Resuelve cualqueir solicitud
    @NotNull(message = "La condicion de aceptacion debe existir.")
    private boolean aceptar;

    private String comentarioAdmin;
}
