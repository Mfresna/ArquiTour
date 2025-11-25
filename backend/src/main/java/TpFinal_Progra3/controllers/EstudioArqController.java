package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.DTO.estudios.EstudioArqBasicoDTO;
import TpFinal_Progra3.model.DTO.estudios.EstudioArqDTO;
import TpFinal_Progra3.model.DTO.filtros.EstudioArqFiltroDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.services.implementacion.EstudioArqService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

import java.util.List;

@Tag(name = "Estudios de Arquitectura", description = "Operaciones relacionadas con los estudios")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/estudios")
@RequiredArgsConstructor
public class EstudioArqController {

    private final EstudioArqService estudioArqService;

    // 1. Crear estudio
    @Operation(summary = "Crear un nuevo estudio de arquitectura", description = "Solo accesible por ADMINISTRADOR o ARQUITECTO")
    @ApiResponse(responseCode = "201", description = "Estudio creado exitosamente")
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<EstudioArqDTO> crearEstudio(
            HttpServletRequest request,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos básicos del estudio",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = EstudioArqBasicoDTO.class),
                            examples = @ExampleObject(value = """
                    {
                      "nombre": "Estudio Moderna",
                      "imagenUrl": "https://miapp.com/img/estudio1.jpg"
                    }
                    """)
                    )
            )
            @RequestBody @Valid EstudioArqBasicoDTO dto) {
        EstudioArqDTO creado = estudioArqService.crearEstudio(request, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // 2. Obtener estudio por ID
    @Operation(summary = "Obtener estudio por ID")
    @ApiResponse(responseCode = "200", description = "Estudio encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<EstudioArqDTO> obtenerEstudio(
            @Parameter(description = "ID del estudio", required = true) @PathVariable @Positive Long id) {
        return ResponseEntity.ok(estudioArqService.obtenerEstudio(id));
    }

    // 3. Filtrar estudios por nombre u obraId
    @Operation(summary = "Filtrar estudios", description = "Filtrar por nombre o por ID de obra asociada")
    @GetMapping("/filtrar")
    public ResponseEntity<List<EstudioArqDTO>> filtrarEstudios(
            @Parameter(description = "Nombre del estudio (parcial o completo)")
            @RequestParam(required = false) String nombre,
            @Parameter(description = "ID de la obra asociada")
            @RequestParam(required = false) Long obraId) {
        EstudioArqFiltroDTO filtro = new EstudioArqFiltroDTO();
        filtro.setNombre(nombre);
        filtro.setObraId(obraId);
        return ResponseEntity.ok(estudioArqService.filtrarEstudios(filtro));
    }

    // 4. Actualizar estudio (nombre + imagen)
    @Operation(summary = "Actualizar un estudio")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<EstudioArqDTO> actualizarEstudio(
            HttpServletRequest request,
            @Parameter(description = "ID del estudio") @PathVariable @Positive Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos del estudio a actualizar",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = EstudioArqDTO.class),
                            examples = @ExampleObject(value = """
                    {
                      "nombre": "Estudio ReNova",
                      "imagenUrl": "https://miapp.com/img/estudio2.jpg",
                      "obrasIds": [1, 2],
                      "arquitectosIds": [3, 4]
                    }
                    """)
                    )
            )
            @Valid @RequestBody EstudioArqDTO dto) {
        return ResponseEntity.ok(estudioArqService.modificarEstudio(request, id, dto));
    }

    @Operation(summary = "Actualizar imagen del estudio")
    @PatchMapping("/{idEstudio}/imagenPerfil")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<EstudioArqDTO> actualizarEstudioImagenPerfil(
            HttpServletRequest request,
            @Parameter(description = "ID del estudio") @PathVariable @Positive Long idEstudio,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "URL de la nueva imagen",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ImagenDTO.class),
                            examples = @ExampleObject(value = """
                    {
                      "url": "https://miapp.com/img/perfilNuevo.jpg"
                    }
                    """)
                    )
            )
            @RequestBody @Valid ImagenDTO imgDTO){
        //Actualiza solo la imagen de perfil del estudio al que el usuario pertenece
        return ResponseEntity.ok(estudioArqService.actualizarEstudioImagenPerfil(request, idEstudio, imgDTO));
    }

    // 5. Agregar arquitecto al estudio
    @Operation(summary = "Agregar arquitecto al estudio")
    @PutMapping("/{estudioId}/arquitectos/{arquitectoId}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<EstudioArqDTO> agregarArquitecto(
            HttpServletRequest request,
            @Parameter(description = "ID del estudio") @PathVariable Long estudioId,
            @Parameter(description = "ID del arquitecto a agregar") @PathVariable Long arquitectoId) {
        return ResponseEntity.ok(estudioArqService.agregarArquitectoAEstudio(request, estudioId, arquitectoId));
    }

    // 6. Eliminar arquitecto del estudio
    @Operation(summary = "Eliminar arquitecto del estudio")
    @DeleteMapping("/{estudioId}/arquitectos/{arquitectoId}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<EstudioArqDTO> eliminarArquitecto(
            HttpServletRequest request,
            @Parameter(description = "ID del estudio") @PathVariable Long estudioId,
            @Parameter(description = "ID del arquitecto a eliminar") @PathVariable Long arquitectoId) {
        return ResponseEntity.ok(estudioArqService.eliminarArquitectoDeEstudio(request, estudioId, arquitectoId));
    }

    // 7. Eliminar estudio (solo si no tiene obras)
    @Operation(summary = "Eliminar un estudio", description = "Solo es posible si no tiene obras asociadas")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ApiResponse(responseCode = "204", description = "Estudio eliminado exitosamente")
    public ResponseEntity<Void> eliminarEstudio(@Parameter(description = "ID del estudio a eliminar") @PathVariable @Positive Long id) {
        estudioArqService.eliminarEstudio(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
