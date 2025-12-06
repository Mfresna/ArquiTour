package TpFinal_Progra3.model.DTO.solicitudes;

import TpFinal_Progra3.model.DTO.usuarios.UsuarioBasicoDTO;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
public class SolicitudResponseDTO {
    private Long id;

    private TipoSolicitud tipoSolicitud;

    private UsuarioBasicoDTO usuario;

    private Long idUsuario;        // id del usuario que pidió la solicitud
    private Long idAdminAsignado;  // id del admin que la tomó (puede ser null)

    private EstadoSolicitud estado;

    private UsuarioBasicoDTO adminAsignado;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fechaCreacion;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fechaResolucion;

    private String comentarioRta;

    //Arquitecto
    private String matriculaArquitecto;

    private String universidad;

    private Integer anioRecibido;

    @Schema(description = "Listado de URLs de imágenes asociadas a la obra",
            example = "[\"https://cdn.miapp.com/img1.jpg\", \"https://cdn.miapp.com/img2.jpg\"]")
    private List<String> urlsImagenes;


    //Baja Rol
    private RolUsuario rolBaja;

    private String motivo;
}
