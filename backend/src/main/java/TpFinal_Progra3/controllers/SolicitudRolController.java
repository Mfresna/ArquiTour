package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.solicitudes.ResolucionSolicitudDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudArqResponseDTO;
import TpFinal_Progra3.services.implementacion.SolicitudService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "SolicitudRol", description = "SolicitudDeRoles")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
public class SolicitudRolController {

    private final SolicitudService solicitudService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitudArqResponseDTO> crearSolicitud(
            HttpServletRequest request,
            @RequestPart("datosSolicitud") @Valid SolicitudArqDTO datosSolicitud,
            @RequestPart(value = "archivos", required = false) MultipartFile[] archivos) {

        return ResponseEntity.ok()
                .body(
                    solicitudService.crearSolicitud(
                    request,
                    datosSolicitud,
                    archivos)
                );
    }

    @PatchMapping("/{id}/asignarseSolicitud")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<SolicitudArqResponseDTO> tomarSolicitud(
            HttpServletRequest request,
            @PathVariable @Positive Long id) {

        return ResponseEntity.ok(solicitudService.tomarSolicitud(request, id));
    }

    @PatchMapping("/{id}/resolver")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<SolicitudArqResponseDTO> resolverSolicitud(
            HttpServletRequest request,
            @PathVariable @Positive Long id,
            @RequestBody @Valid ResolucionSolicitudDTO body) {

        SolicitudArqResponseDTO dto = solicitudService.resolverSolicitud(
                request,
                id,
                body.getAprobada(),
                body.getMotivo()
        );
        return ResponseEntity.ok(dto);
    }

}
