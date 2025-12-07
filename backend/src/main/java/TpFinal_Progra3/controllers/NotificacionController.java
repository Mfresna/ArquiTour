package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.notificaciones.NotificacionResponseDTO;
import TpFinal_Progra3.services.implementacion.NotificacionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Tag(name = "Notificaciones", description = "Gestión de notificaciones entre usuarios")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @Operation(summary = "Obtener notificaciones recibidas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de notificaciones recibidas",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = NotificacionResponseDTO.class)))
    })
    @GetMapping("/recibidas")
    public ResponseEntity<List<NotificacionResponseDTO>> notificacionesRecibidas(
            HttpServletRequest request,
            @Parameter(description = "Filtrar por leídas (true) o no leídas (false)") @RequestParam(required = false) Boolean isLeido){
        return ResponseEntity.ok(notificacionService.obtenerRecibidas(request,isLeido));
    }

    @PatchMapping("/leer/{id}")
    public ResponseEntity<Void> marcarLeida(@PathVariable("id") @Positive Long idNotificacion) {
        notificacionService.marcarLeida(idNotificacion);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(HttpServletRequest request) {
        notificacionService.marcarTodasLeidas(request);
        return ResponseEntity.ok().build();
    }
}
