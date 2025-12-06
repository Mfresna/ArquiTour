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

    @PreAuthorize("!hasRole('ARQUITECTO')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitudArqResponseDTO> crearSolicitud(
            HttpServletRequest request,
            //@RequestPart("datos") SolicitudArqDTO datosSolicitud,
            @RequestPart(value = "archivos") List<MultipartFile> archivos) {

        SolicitudArqDTO a = SolicitudArqDTO.builder()
                .matriculaArquitecto("MAT")
                .universidad("UNMDP")
                .anioRecibido(2020)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                    solicitudService.crearSolicitud(
                    request,
                    a,
                    archivos)
                );
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/tomarla")
    public ResponseEntity<SolicitudArqResponseDTO> tomarSolicitud(
            HttpServletRequest request,
            @PathVariable @Positive Long id) {

        return ResponseEntity.ok(solicitudService.tomarSolicitud(request, id));
    }

    @PatchMapping("/{id}/resolverla")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<SolicitudArqResponseDTO> resolverSolicitud(
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
    public ResponseEntity<List<SolicitudResponseDTO>> filtrarSolicitudes(
            @Valid SolicitudFiltroDTO filtro
    ) {
        return ResponseEntity.ok(solicitudService.filtrarSolicitudes(filtro));
    }


}
        