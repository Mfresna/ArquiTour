package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.filtros.SolicitudFiltroDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudNuevaDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudResolucionDTO;
import TpFinal_Progra3.model.DTO.solicitudes.SolicitudResponseDTO;
import TpFinal_Progra3.model.mappers.SolicitudMapper;
import TpFinal_Progra3.services.implementacion.SolicitudService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "SolicitudRol", description = "SolicitudDeRoles")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
public class SolicitudRolController {

    private final SolicitudService solicitudService;
    private final SolicitudMapper solicitudMapper;

    // ========== 1) CREAR NUEVA SOLICITUD (ALTA_ARQUITECTO / BAJA_ROL) ==========
    @PostMapping(value = "/nueva", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitudResponseDTO> crearSolicitud(
            HttpServletRequest request,
            @Valid @RequestPart("datosSolicitud") SolicitudNuevaDTO dto,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudService.nuevaSolicitud(request, dto, archivos));
    }


    // ========== 2) TOMAR SOLICITUD (PASAR A EN_PROCESO / VALIDAR COLISIÓN) ==========
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/tomar")
    public ResponseEntity<SolicitudResponseDTO> tomarSolicitud(
            HttpServletRequest request,
            @PathVariable("id") @Positive Long id
    ) {
        return ResponseEntity.ok(solicitudService.tomarSolicitud(request, id));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/{id}/dejar")
    public ResponseEntity<Void> dejarSolicitud(HttpServletRequest request, @PathVariable("id") @Positive Long id) {
        solicitudService.dejarSolicitud(request, id);
        return ResponseEntity.accepted().build();
    }


    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/resolver")
    public ResponseEntity<SolicitudResponseDTO> resolverSolicitud(
            HttpServletRequest request,
            @PathVariable("id") @Positive Long id,
            @Valid @RequestBody SolicitudResolucionDTO resolucion
    ) {

        return ResponseEntity.ok(
                solicitudMapper.mapToDTO(
                        solicitudService.resolverSolicitud(request, id, resolucion)
                ));
    }

    //========================= OBTENER SOLICITUDES

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudResponseDTO> obtenerSolicitud(
            @PathVariable("id") @Positive Long id
    ) {
        return ResponseEntity.ok(
                solicitudMapper.mapToDTO(
                        solicitudService.obtenerSolicitud(id)
                ));
    }
    @GetMapping("/filtrar")
    public ResponseEntity<List<SolicitudResponseDTO>> filtrarSolicitudes(@Valid SolicitudFiltroDTO filtro, HttpServletRequest request) {
        return ResponseEntity.ok(solicitudService.filtrarSolicitudes(request, filtro));
    }


}
        